"""Customer-facing store routes."""

import hmac
import importlib
import json
import uuid
from datetime import datetime, timedelta
from itertools import count
from threading import Lock

from flask import Blueprint, current_app, request
from sqlalchemy import func, or_
import requests

from app.models import (
    Account,
    Address,
    Invoice,
    InvoiceItem,
    Payment,
    Plan,
    Product,
    ProductImage,
    Subscription,
    User,
    UserRole,
    db,
)
from app.utils import error_response, success_response

store_bp = Blueprint('store', __name__, url_prefix='/api/store')

PRICE_RANGE_MAP = {
    'under_25': (None, 2500),
    '25_100': (2500, 10000),
    '100_plus': (10000, None),
}

TAX_RATE = 0.1
DISCOUNT_CODES = {
    'SAVE10': 0.1,
    'SAVE20': 0.2,
}

# Cart remains session-key based; checkout/order data is persisted in DB.
CART_STORE = {}
ORDER_SEQUENCE = count(5000)
STORE_LOCK = Lock()


def _customer_key():
    header_key = (request.headers.get('X-Customer-Key') or '').strip()
    query_key = (request.args.get('customer_key') or '').strip()
    json_key = ''

    if request.method in {'POST', 'PUT', 'PATCH', 'DELETE'}:
        payload = request.get_json(silent=True) or {}
        json_key = str(payload.get('customer_key') or '').strip()

    return header_key or query_key or json_key or 'guest'


def _normalize_customer_token(customer_key):
    cleaned = ''.join(ch if ch.isalnum() else '-' for ch in (customer_key or '').lower())
    cleaned = cleaned.strip('-')
    if not cleaned:
        cleaned = 'guest'
    return cleaned[:40]


def _empty_cart(customer_key):
    return {
        'customer_key': customer_key,
        'discount_code': None,
        'discount_rate': 0,
        'items': [],
    }


def _get_or_create_cart(customer_key):
    with STORE_LOCK:
        if customer_key not in CART_STORE:
            CART_STORE[customer_key] = _empty_cart(customer_key)
        return CART_STORE[customer_key]


def _format_money(cents):
    return cents if isinstance(cents, int) else 0


def _cart_snapshot(cart):
    subtotal_cents = 0
    items = []

    for row in cart['items']:
        product = Product.query.get(row['product_id'])
        if not product or not product.is_active:
            continue

        plan = Plan.query.get(row['plan_id']) if row.get('plan_id') else None
        unit_price_cents = None
        if plan and plan.is_active:
            unit_price_cents = plan.price_cents
        elif product.base_price_cents is not None:
            unit_price_cents = product.base_price_cents

        unit_price_cents = _format_money(unit_price_cents)
        quantity = max(1, int(row.get('quantity', 1)))
        line_total_cents = unit_price_cents * quantity
        subtotal_cents += line_total_cents

        items.append(
            {
                'line_id': row['line_id'],
                'product_id': product.id,
                'product_name': product.name,
                'plan_id': plan.id if plan else None,
                'plan_name': plan.name if plan else None,
                'billing_interval': plan.interval if plan else None,
                'quantity': quantity,
                'unit_price_cents': unit_price_cents,
                'line_total_cents': line_total_cents,
                'currency': (plan.currency if plan else product.currency) or 'USD',
            }
        )

    discount_rate = float(cart.get('discount_rate') or 0)
    discount_cents = int(round(subtotal_cents * discount_rate))
    taxable_amount = max(0, subtotal_cents - discount_cents)
    tax_cents = int(round(taxable_amount * TAX_RATE))
    total_cents = taxable_amount + tax_cents

    return {
        'customer_key': cart['customer_key'],
        'discount_code': cart.get('discount_code'),
        'discount_rate': discount_rate,
        'subtotal_cents': subtotal_cents,
        'discount_cents': discount_cents,
        'tax_cents': tax_cents,
        'total_cents': total_cents,
        'currency': items[0]['currency'] if items else 'USD',
        'items': items,
    }


def _to_catalog_item(product, plans):
    image_urls = [
        image.image_url
        for image in product.images.order_by(ProductImage.sort_order.asc(), ProductImage.id.asc()).all()
        if image.image_url
    ]

    active_prices = [plan.price_cents for plan in plans if plan.price_cents is not None]
    from_price = min(active_prices) if active_prices else product.base_price_cents
    to_price = max(active_prices) if active_prices else product.base_price_cents
    primary_interval = plans[0].interval if plans else None

    return {
        'id': product.id,
        'name': product.name,
        'slug': product.slug,
        'description': product.description,
        'product_type': product.product_type,
        'image_urls': image_urls,
        'currency': (plans[0].currency if plans else product.currency) or 'USD',
        'base_price_cents': product.base_price_cents,
        'pricing_summary': {
            'from_price_cents': from_price,
            'to_price_cents': to_price,
            'primary_interval': primary_interval,
            'has_recurring': any(plan.interval in ('monthly', 'yearly') for plan in plans),
        },
        'plans': [
            {
                'id': plan.id,
                'name': plan.name,
                'description': plan.description,
                'price_cents': plan.price_cents,
                'currency': plan.currency,
                'interval': plan.interval,
                'interval_count': plan.interval_count,
                'trial_days': plan.trial_days,
            }
            for plan in plans
        ],
    }


def _razorpay_credentials():
    key_id = (current_app.config.get('RAZORPAY_KEY_ID') or '').strip()
    key_secret = (current_app.config.get('RAZORPAY_KEY_SECRET') or '').strip()
    return key_id, key_secret


def _create_razorpay_order(amount_cents, currency, receipt, notes):
    key_id, key_secret = _razorpay_credentials()
    if not key_id or not key_secret:
        raise RuntimeError('Razorpay is not configured on the server')

    try:
        razorpay = importlib.import_module('razorpay')
    except ImportError as exc:
        raise RuntimeError('Razorpay SDK is not installed on the server') from exc

    client = razorpay.Client(auth=(key_id, key_secret))
    return client.order.create(
        {
            'amount': int(amount_cents),
            'currency': currency,
            'receipt': receipt,
            'notes': notes,
            'payment_capture': 1,
        }
    )


def _verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
    _, key_secret = _razorpay_credentials()
    if not key_secret:
        return False

    payload = f'{razorpay_order_id}|{razorpay_payment_id}'
    expected = hmac.new(key_secret.encode('utf-8'), payload.encode('utf-8'), 'sha256').hexdigest()
    return hmac.compare_digest(expected, razorpay_signature)


def _default_gemini_system_prompt():
    return (
        'You are SubSync Assistant for a subscription management system. '
        'Help users with subscriptions, billing, invoices, payments, orders, renewals, and dashboard guidance. '
        'Be concise, practical, and action-oriented. If policy or legal advice is requested, provide a safe disclaimer and suggest contacting support.'
    )


def _extract_gemini_reply(payload):
    candidates = payload.get('candidates') or []
    if not candidates:
        return ''

    parts = (((candidates[0] or {}).get('content') or {}).get('parts')) or []
    text_parts = [str(part.get('text') or '').strip() for part in parts if isinstance(part, dict)]
    return '\n'.join([part for part in text_parts if part]).strip()


def _build_assistant_context(customer_key, account, user, page_context=None):
    cart = _cart_snapshot(_get_or_create_cart(customer_key))

    total_subscriptions = (
        Subscription.query
        .filter(Subscription.account_id == account.id, Subscription.deleted_at.is_(None))
        .count()
    )
    active_subscriptions = (
        Subscription.query
        .filter(
            Subscription.account_id == account.id,
            Subscription.deleted_at.is_(None),
            Subscription.status == 'active',
        )
        .count()
    )

    recent_subscriptions = (
        db.session.query(Subscription, Plan.name)
        .outerjoin(Plan, Plan.id == Subscription.plan_id)
        .filter(Subscription.account_id == account.id, Subscription.deleted_at.is_(None))
        .order_by(Subscription.created_at.desc())
        .limit(5)
        .all()
    )

    recent_invoices = (
        Invoice.query
        .filter(Invoice.user_id == user.id)
        .order_by(Invoice.created_at.desc())
        .limit(5)
        .all()
    )

    recent_payments = (
        Payment.query
        .filter(Payment.user_id == user.id)
        .order_by(Payment.created_at.desc())
        .limit(5)
        .all()
    )

    context = {
        'customer': {
            'name': ' '.join([part for part in [user.first_name, user.last_name] if part]).strip(),
            'email': user.email,
            'phone': user.phone or '',
            'customer_key': customer_key,
        },
        'account': {
            'name': account.name,
            'slug': account.slug,
        },
        'subscriptions': {
            'active': active_subscriptions,
            'total': total_subscriptions,
            'recent': [
                {
                    'id': sub.id,
                    'status': sub.status,
                    'plan_name': plan_name or 'N/A',
                    'started_at': (sub.created_at.isoformat() if sub.created_at else ''),
                }
                for sub, plan_name in recent_subscriptions
            ],
        },
        'billing': {
            'recent_invoices': [
                {
                    'invoice_number': invoice.invoice_number,
                    'status': invoice.status,
                    'total_cents': int(invoice.total_amount_cents or 0),
                    'amount_due_cents': int(invoice.amount_due_cents or 0),
                    'currency': invoice.currency or 'USD',
                    'created_at': (invoice.created_at.isoformat() if invoice.created_at else ''),
                }
                for invoice in recent_invoices
            ],
            'recent_payments': [
                {
                    'status': payment.status,
                    'amount_cents': int(payment.amount_cents or 0),
                    'currency': payment.currency or 'USD',
                    'paid_at': (payment.paid_at.isoformat() if payment.paid_at else ''),
                }
                for payment in recent_payments
            ],
        },
        'cart': {
            'items': [
                {
                    'product_name': item.get('product_name'),
                    'plan_name': item.get('plan_name'),
                    'quantity': item.get('quantity'),
                    'line_total_cents': item.get('line_total_cents'),
                    'currency': item.get('currency') or cart.get('currency') or 'USD',
                }
                for item in cart.get('items', [])
            ],
            'subtotal_cents': cart.get('subtotal_cents', 0),
            'tax_cents': cart.get('tax_cents', 0),
            'total_cents': cart.get('total_cents', 0),
            'currency': cart.get('currency') or 'USD',
        },
    }

    if isinstance(page_context, dict):
        context['page'] = {
            'path': str(page_context.get('path') or ''),
            'screen': str(page_context.get('screen') or ''),
            'order_id': str(page_context.get('order_id') or ''),
        }

    return context


def _safe_json_loads(raw):
    if not raw:
        return {}
    try:
        value = json.loads(raw)
        if isinstance(value, dict):
            return value
    except Exception:
        return {}
    return {}


def _ensure_customer_identity(customer_key):
    token = _normalize_customer_token(customer_key)
    email_local = token.replace('-', '.')[:32]
    email = f'{email_local}@subsync.customer'

    created = False

    account = Account.query.order_by(Account.id.asc()).first()
    if not account:
        account = Account(
            name='SubSync Storefront',
            slug='subsync-storefront',
            billing_contact_email='storefront@subsync.customer',
            subscription_tier='free',
            is_active=True,
        )
        db.session.add(account)
        db.session.flush()
        created = True

    user = User.query.filter_by(email=email).first()
    if not user:
        user = User(
            account_id=account.id,
            email=email,
            first_name='Customer',
            last_name=token[:12],
            phone='',
            is_active=True,
        )
        db.session.add(user)
        db.session.flush()
        created = True

    if not user.roles.filter_by(role='customer').first():
        db.session.add(UserRole(user_id=user.id, role='customer'))
        created = True

    return account, user, created


def _build_profile_payload(customer_key, user):
    address = user.addresses.filter_by(address_type='billing').order_by(Address.id.asc()).first()
    full_name = ' '.join([part for part in [user.first_name, user.last_name] if part]).strip()

    return {
        'customer_key': customer_key,
        'name': full_name or f'User {_normalize_customer_token(customer_key)[:8]}',
        'email': user.email,
        'phone': user.phone or '',
        'address': address.street if address and address.street else '',
        'updated_at': (user.updated_at or user.created_at or datetime.utcnow()).isoformat(),
    }


def _build_order_from_invoice(invoice, payment, customer_key):
    metadata = _safe_json_loads(invoice.notes)
    metadata_items = metadata.get('items')
    if not isinstance(metadata_items, list):
        metadata_items = []

    charge_rows = [
        row
        for row in invoice.invoice_items.order_by(InvoiceItem.id.asc()).all()
        if row.item_type not in ('discount', 'tax')
    ]

    items = []
    for index, row in enumerate(charge_rows):
        meta = metadata_items[index] if index < len(metadata_items) and isinstance(metadata_items[index], dict) else {}
        items.append(
            {
                'line_id': meta.get('line_id') or f'line-{row.id}',
                'product_id': meta.get('product_id'),
                'product_name': meta.get('product_name') or row.description,
                'plan_id': meta.get('plan_id'),
                'plan_name': meta.get('plan_name'),
                'billing_interval': meta.get('billing_interval'),
                'quantity': row.quantity,
                'unit_price_cents': row.unit_price_cents,
                'line_total_cents': row.amount_cents,
                'currency': invoice.currency,
            }
        )

    payment_status = payment.status if payment else 'pending'

    return {
        'id': invoice.id,
        'order_number': metadata.get('order_number') or f'S{invoice.id:04d}',
        'invoice_number': invoice.invoice_number,
        'customer_key': customer_key,
        'address': metadata.get('address') or 'Address pending',
        'payment_method': metadata.get('payment_method') or 'Razorpay',
        'payment_status': payment_status,
        'created_at': (invoice.created_at or datetime.utcnow()).isoformat(),
        'discount_code': metadata.get('discount_code'),
        'discount_rate': metadata.get('discount_rate', 0),
        'subtotal_cents': int(invoice.subtotal_cents or 0),
        'discount_cents': int(invoice.discount_cents or 0),
        'tax_cents': int(invoice.tax_cents or 0),
        'total_cents': int(invoice.total_amount_cents or 0),
        'currency': invoice.currency or 'USD',
        'items': items,
    }


def _invoice_snapshot_from_invoice(invoice, order):
    rows = []
    for item in invoice.invoice_items.order_by(InvoiceItem.id.asc()).all():
        rows.append(
            {
                'description': item.description,
                'quantity': item.quantity,
                'unit_price_cents': item.unit_price_cents,
                'item_type': item.item_type,
                'amount_cents': item.amount_cents,
            }
        )

    date_value = invoice.invoice_date or invoice.created_at

    return {
        'invoice_number': invoice.invoice_number,
        'invoice_date': date_value.date().isoformat() if date_value else '',
        'order_number': order.get('order_number'),
        'currency': invoice.currency or 'USD',
        'rows': rows,
        'subtotal_cents': int(invoice.subtotal_cents or 0),
        'discount_cents': int(invoice.discount_cents or 0),
        'tax_cents': int(invoice.tax_cents or 0),
        'total_cents': int(invoice.total_amount_cents or 0),
        'amount_due_cents': int(invoice.amount_due_cents or 0),
        'address': order.get('address') or 'Address pending',
        'payment_method': order.get('payment_method') or 'Razorpay',
    }


@store_bp.route('/filters', methods=['GET'])
def get_store_filters():
    """Return category and sort options for customer catalog UIs."""
    categories = [
        row[0]
        for row in db.session.query(Product.product_type)
        .filter(Product.is_active.is_(True), Product.product_type.isnot(None))
        .distinct()
        .order_by(Product.product_type.asc())
        .all()
        if row[0]
    ]

    return success_response(
        {
            'categories': categories,
            'price_ranges': [
                {'key': 'all', 'label': 'All prices'},
                {'key': 'under_25', 'label': '$0 - $25'},
                {'key': '25_100', 'label': '$25 - $100'},
                {'key': '100_plus', 'label': '$100+'},
            ],
            'sort_options': [
                {'key': 'price_asc', 'label': 'Price: Low to high'},
                {'key': 'price_desc', 'label': 'Price: High to low'},
                {'key': 'name_asc', 'label': 'Name: A-Z'},
                {'key': 'newest', 'label': 'Newest'},
            ],
        }
    )


@store_bp.route('/catalog', methods=['GET'])
def list_store_catalog():
    """Return customer-friendly catalog data with product + recurring plan pricing."""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 16, type=int)
    search = (request.args.get('q') or '').strip()
    category = (request.args.get('category') or '').strip().lower()
    sort = (request.args.get('sort') or 'price_asc').strip().lower()
    price_range = (request.args.get('price_range') or 'all').strip().lower()

    min_plan_subquery = (
        db.session.query(
            Plan.product_id.label('product_id'),
            func.min(Plan.price_cents).label('min_price_cents'),
        )
        .filter(Plan.is_active.is_(True))
        .group_by(Plan.product_id)
        .subquery()
    )

    effective_price = func.coalesce(min_plan_subquery.c.min_price_cents, Product.base_price_cents, 0)

    query = (
        Product.query.filter(Product.is_active.is_(True))
        .outerjoin(min_plan_subquery, min_plan_subquery.c.product_id == Product.id)
    )

    if search:
        like_pattern = f'%{search}%'
        query = query.filter(
            or_(
                Product.name.ilike(like_pattern),
                Product.slug.ilike(like_pattern),
                Product.description.ilike(like_pattern),
            )
        )

    if category and category != 'all':
        query = query.filter(Product.product_type == category)

    if price_range in PRICE_RANGE_MAP:
        min_cents, max_cents = PRICE_RANGE_MAP[price_range]
        if min_cents is not None:
            query = query.filter(effective_price >= min_cents)
        if max_cents is not None:
            query = query.filter(effective_price <= max_cents)

    if sort == 'price_desc':
        query = query.order_by(effective_price.desc(), Product.name.asc())
    elif sort == 'name_asc':
        query = query.order_by(Product.name.asc())
    elif sort == 'newest':
        query = query.order_by(Product.created_at.desc())
    else:
        query = query.order_by(effective_price.asc(), Product.name.asc())

    paginated_products = query.paginate(page=page, per_page=per_page, error_out=False)
    product_ids = [product.id for product in paginated_products.items]

    plans_by_product_id = {product_id: [] for product_id in product_ids}
    if product_ids:
        plans = (
            Plan.query.filter(Plan.is_active.is_(True), Plan.product_id.in_(product_ids))
            .order_by(Plan.price_cents.asc(), Plan.id.asc())
            .all()
        )

        for plan in plans:
            plans_by_product_id.setdefault(plan.product_id, []).append(plan)

    items = [
        _to_catalog_item(product, plans_by_product_id.get(product.id, []))
        for product in paginated_products.items
    ]

    return success_response(
        {
            'items': items,
            'total': paginated_products.total,
            'pages': paginated_products.pages,
            'current_page': paginated_products.page,
            'has_next': paginated_products.has_next,
            'has_prev': paginated_products.has_prev,
            'filters': {
                'q': search,
                'category': category or 'all',
                'price_range': price_range,
                'sort': sort,
            },
        }
    )


@store_bp.route('/products/<int:product_id>', methods=['GET'])
def get_store_product(product_id):
    """Return a single active product with active plans for customer product page."""
    product = Product.query.get(product_id)
    if not product or not product.is_active:
        return error_response('Product not found', 404)

    plans = (
        Plan.query.filter_by(product_id=product.id, is_active=True)
        .order_by(Plan.price_cents.asc(), Plan.id.asc())
        .all()
    )

    return success_response(_to_catalog_item(product, plans))


@store_bp.route('/insights', methods=['GET'])
def get_store_insights():
    """Return customer dashboard insights aligned with subscription-management KPIs."""
    customer_key = _customer_key()
    account, _, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    cutoff_30d = datetime.utcnow() - timedelta(days=30)

    total_subscriptions = (
        Subscription.query
        .filter(Subscription.account_id == account.id, Subscription.deleted_at.is_(None))
        .count()
    )
    active_subscriptions = (
        Subscription.query
        .filter(
            Subscription.account_id == account.id,
            Subscription.deleted_at.is_(None),
            Subscription.status == 'active',
        )
        .count()
    )
    trending_subscriptions = (
        Subscription.query
        .filter(
            Subscription.account_id == account.id,
            Subscription.deleted_at.is_(None),
            Subscription.created_at >= cutoff_30d,
        )
        .count()
    )
    open_invoices = (
        Invoice.query
        .filter(Invoice.account_id == account.id, Invoice.amount_due_cents > 0)
        .count()
    )

    paid_revenue_cents = int(
        db.session.query(func.coalesce(func.sum(Payment.amount_cents), 0))
        .join(Invoice, Payment.invoice_id == Invoice.id)
        .filter(Invoice.account_id == account.id, Payment.status == 'succeeded')
        .scalar()
        or 0
    )

    trending_rows = (
        db.session.query(Plan.name, func.count(Subscription.id).label('count'))
        .join(Subscription, Subscription.plan_id == Plan.id)
        .filter(Subscription.account_id == account.id, Subscription.deleted_at.is_(None))
        .group_by(Plan.id, Plan.name)
        .order_by(func.count(Subscription.id).desc())
        .limit(3)
        .all()
    )

    trending_items = [
        {
            'name': row[0] or 'Unnamed Plan',
            'count': int(row[1] or 0),
        }
        for row in trending_rows
    ]

    return success_response(
        {
            'active_subscriptions': active_subscriptions,
            'total_subscriptions': total_subscriptions,
            'trending_subscriptions': trending_subscriptions,
            'open_invoices': open_invoices,
            'revenue_cents': paid_revenue_cents,
            'currency': 'USD',
            'trending_items': trending_items,
        }
    )


@store_bp.route('/chat', methods=['POST'])
def store_chat_assistant():
    """Customer assistant chat using Gemini 2.5 Flash."""
    payload = request.get_json(silent=True) or {}
    message = str(payload.get('message') or '').strip()
    if not message:
        return error_response('message is required', 400)

    api_key = (current_app.config.get('GEMINI_API_KEY') or '').strip()
    model = (current_app.config.get('GEMINI_MODEL') or 'gemini-2.5-flash').strip()
    if not api_key:
        return error_response('Gemini API key is not configured on server', 503)

    history = payload.get('history')
    if not isinstance(history, list):
        history = []

    system_prompt = str(payload.get('system_prompt') or _default_gemini_system_prompt()).strip()

    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    assistant_context = _build_assistant_context(
        customer_key=customer_key,
        account=account,
        user=user,
        page_context=payload.get('context'),
    )

    system_prompt = (
        f"{system_prompt}\n\n"
        "Use the factual customer context below to personalize and ground every answer. "
        "If data is missing, say so clearly and suggest the exact next action.\n"
        f"CUSTOMER_CONTEXT_JSON:\n{json.dumps(assistant_context, ensure_ascii=True)}"
    )

    contents = []
    for item in history[-8:]:
        if not isinstance(item, dict):
            continue
        role = 'model' if str(item.get('role') or '').lower() in {'assistant', 'model'} else 'user'
        text = str(item.get('text') or '').strip()
        if not text:
            continue
        contents.append({'role': role, 'parts': [{'text': text}]})

    contents.append({'role': 'user', 'parts': [{'text': message}]})

    endpoint = f'https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent'
    request_body = {
        'system_instruction': {'parts': [{'text': system_prompt}]},
        'contents': contents,
    }

    try:
        response = requests.post(
            endpoint,
            params={'key': api_key},
            json=request_body,
            timeout=25,
        )
    except requests.RequestException as exc:
        return error_response(f'Gemini request failed: {str(exc)}', 502)

    if response.status_code >= 400:
        detail = ''
        try:
            detail = (response.json() or {}).get('error', {}).get('message', '')
        except Exception:
            detail = response.text[:200]
        return error_response(f'Gemini API error: {detail or response.status_code}', 502)

    try:
        response_payload = response.json()
    except Exception:
        return error_response('Gemini API returned invalid response', 502)

    reply = _extract_gemini_reply(response_payload)
    if not reply:
        return error_response('Gemini did not return a reply', 502)

    return success_response(
        {
            'reply': reply,
            'model': model,
        }
    )


@store_bp.route('/cart', methods=['GET'])
def get_cart():
    """Get current cart snapshot for a customer key."""
    customer_key = _customer_key()
    cart = _get_or_create_cart(customer_key)
    return success_response(_cart_snapshot(cart))


@store_bp.route('/cart/items', methods=['POST'])
def add_cart_item():
    """Add item to cart."""
    payload = request.get_json(silent=True) or {}
    product_id = payload.get('product_id')
    plan_id = payload.get('plan_id')
    quantity = max(1, int(payload.get('quantity') or 1))

    if not product_id:
        return error_response('product_id is required', 400)

    product = Product.query.get(product_id)
    if not product or not product.is_active:
        return error_response('Product not found', 404)

    if plan_id:
        plan = Plan.query.get(plan_id)
        if not plan or not plan.is_active or plan.product_id != product.id:
            return error_response('Selected plan is invalid for this product', 400)

    customer_key = _customer_key()
    cart = _get_or_create_cart(customer_key)

    with STORE_LOCK:
        existing = next(
            (
                item
                for item in cart['items']
                if item['product_id'] == int(product_id) and item.get('plan_id') == (int(plan_id) if plan_id else None)
            ),
            None,
        )
        if existing:
            existing['quantity'] = existing['quantity'] + quantity
        else:
            line_id = f"line-{len(cart['items']) + 1}-{int(datetime.utcnow().timestamp())}"
            cart['items'].append(
                {
                    'line_id': line_id,
                    'product_id': int(product_id),
                    'plan_id': int(plan_id) if plan_id else None,
                    'quantity': quantity,
                }
            )

    return success_response(_cart_snapshot(cart), 'Item added to cart')


@store_bp.route('/cart/items/<line_id>', methods=['PUT'])
def update_cart_item(line_id):
    """Update cart item quantity."""
    payload = request.get_json(silent=True) or {}
    quantity = max(1, int(payload.get('quantity') or 1))

    customer_key = _customer_key()
    cart = _get_or_create_cart(customer_key)

    with STORE_LOCK:
        for row in cart['items']:
            if row['line_id'] == line_id:
                row['quantity'] = quantity
                return success_response(_cart_snapshot(cart), 'Cart updated')

    return error_response('Cart line item not found', 404)


@store_bp.route('/cart/items/<line_id>', methods=['DELETE'])
def remove_cart_item(line_id):
    """Remove item from cart."""
    customer_key = _customer_key()
    cart = _get_or_create_cart(customer_key)

    with STORE_LOCK:
        original_len = len(cart['items'])
        cart['items'] = [row for row in cart['items'] if row['line_id'] != line_id]
        if len(cart['items']) == original_len:
            return error_response('Cart line item not found', 404)

    return success_response(_cart_snapshot(cart), 'Item removed')


@store_bp.route('/cart/discount', methods=['POST'])
def apply_discount_code():
    """Apply a discount code to current cart."""
    payload = request.get_json(silent=True) or {}
    code = str(payload.get('code') or '').strip().upper()
    if not code:
        return error_response('Discount code is required', 400)

    discount_rate = DISCOUNT_CODES.get(code)
    if not discount_rate:
        return error_response('Invalid discount code', 400)

    customer_key = _customer_key()
    cart = _get_or_create_cart(customer_key)

    with STORE_LOCK:
        cart['discount_code'] = code
        cart['discount_rate'] = discount_rate

    return success_response(_cart_snapshot(cart), 'Discount applied')


@store_bp.route('/checkout', methods=['POST'])
def checkout_cart():
    """Create a persisted invoice + pending payment and return Razorpay checkout details."""
    payload = request.get_json(silent=True) or {}
    customer_key = _customer_key()
    cart = _get_or_create_cart(customer_key)
    snapshot = _cart_snapshot(cart)

    if not snapshot['items']:
        return error_response('Cart is empty', 400)

    key_id, key_secret = _razorpay_credentials()
    if not key_id or not key_secret:
        return error_response('Razorpay is not configured on server. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.', 503)

    account = None
    user = None

    try:
        account, user, created = _ensure_customer_identity(customer_key)
        if created:
            db.session.flush()

        order_number = f"S{next(ORDER_SEQUENCE):04d}"
        invoice_number = f"INV-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6].upper()}"

        metadata = {
            'customer_key': customer_key,
            'address': payload.get('address') or 'Address pending',
            'payment_method': payload.get('payment_method') or 'Razorpay',
            'order_number': order_number,
            'discount_code': snapshot.get('discount_code'),
            'discount_rate': snapshot.get('discount_rate', 0),
            'items': snapshot.get('items', []),
        }

        invoice = Invoice(
            account_id=account.id,
            user_id=user.id,
            invoice_number=invoice_number,
            invoice_date=datetime.utcnow(),
            subtotal_cents=snapshot['subtotal_cents'],
            discount_cents=snapshot['discount_cents'],
            tax_cents=snapshot['tax_cents'],
            total_amount_cents=snapshot['total_cents'],
            amount_due_cents=snapshot['total_cents'],
            currency=snapshot['currency'] or 'USD',
            status='sent',
            due_date=datetime.utcnow(),
            notes=json.dumps(metadata),
        )
        db.session.add(invoice)
        db.session.flush()

        for item in snapshot['items']:
            description = item.get('product_name') or 'Product'
            if item.get('plan_name'):
                description = f"{description} ({item.get('plan_name')})"

            db.session.add(
                InvoiceItem(
                    invoice_id=invoice.id,
                    description=description,
                    quantity=int(item.get('quantity') or 1),
                    unit_price_cents=int(item.get('unit_price_cents') or 0),
                    amount_cents=int(item.get('line_total_cents') or 0),
                    item_type='charge',
                )
            )

        if snapshot['discount_cents'] > 0:
            db.session.add(
                InvoiceItem(
                    invoice_id=invoice.id,
                    description=f"{snapshot.get('discount_code') or 'Discount'} on your order",
                    quantity=1,
                    unit_price_cents=-snapshot['discount_cents'],
                    amount_cents=-snapshot['discount_cents'],
                    item_type='discount',
                )
            )

        if snapshot['tax_cents'] > 0:
            db.session.add(
                InvoiceItem(
                    invoice_id=invoice.id,
                    description=f"Tax {int(TAX_RATE * 100)}%",
                    quantity=1,
                    unit_price_cents=snapshot['tax_cents'],
                    amount_cents=snapshot['tax_cents'],
                    item_type='tax',
                )
            )

        payment = Payment(
            invoice_id=invoice.id,
            user_id=user.id,
            amount_cents=snapshot['total_cents'],
            currency=snapshot['currency'] or 'USD',
            status='pending',
        )
        db.session.add(payment)
        db.session.flush()

        razorpay_order = _create_razorpay_order(
            amount_cents=snapshot['total_cents'],
            currency=snapshot['currency'] or 'USD',
            receipt=f'order_{invoice.id}',
            notes={
                'invoice_id': str(invoice.id),
                'customer_key': customer_key,
            },
        )

        payment.transaction_ref = razorpay_order.get('id')
        db.session.commit()

        with STORE_LOCK:
            CART_STORE[customer_key] = _empty_cart(customer_key)

        order_data = _build_order_from_invoice(invoice, payment, customer_key)
        customer_name = ' '.join([part for part in [user.first_name, user.last_name] if part]).strip()
        order_data['payment_gateway'] = {
            'provider': 'razorpay',
            'key_id': key_id,
            'order_id': razorpay_order.get('id'),
            'amount': razorpay_order.get('amount'),
            'currency': razorpay_order.get('currency') or snapshot['currency'] or 'USD',
            'name': 'SubSync',
            'description': f"Order {order_data['order_number']}",
            'prefill': {
                'name': customer_name,
                'email': user.email,
                'contact': user.phone or '',
            },
        }

        return success_response(order_data, 'Checkout initiated')

    except RuntimeError as exc:
        db.session.rollback()
        return error_response(str(exc), 503)
    except Exception as exc:
        db.session.rollback()
        return error_response(f'Checkout failed: {str(exc)}', 400)


@store_bp.route('/orders/<int:order_id>/verify-payment', methods=['POST'])
def verify_order_payment(order_id):
    """Verify Razorpay payment signature and settle invoice/payment records."""
    payload = request.get_json(silent=True) or {}
    customer_key = _customer_key()

    razorpay_order_id = str(payload.get('razorpay_order_id') or '').strip()
    razorpay_payment_id = str(payload.get('razorpay_payment_id') or '').strip()
    razorpay_signature = str(payload.get('razorpay_signature') or '').strip()

    if not razorpay_order_id or not razorpay_payment_id or not razorpay_signature:
        return error_response('Missing Razorpay verification fields', 400)

    account, user, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    invoice = Invoice.query.filter_by(id=order_id, user_id=user.id).first()
    if not invoice:
        return error_response('Order not found', 404)

    payment = Payment.query.filter_by(invoice_id=invoice.id).order_by(Payment.created_at.desc()).first()
    if not payment:
        return error_response('Payment record not found', 404)

    if payment.status == 'succeeded':
        order = _build_order_from_invoice(invoice, payment, customer_key)
        return success_response(order, 'Payment already verified')

    if payment.transaction_ref and payment.transaction_ref != razorpay_order_id:
        return error_response('Razorpay order mismatch', 400)

    if not _verify_razorpay_signature(razorpay_order_id, razorpay_payment_id, razorpay_signature):
        payment.status = 'failed'
        payment.failure_reason = 'Invalid Razorpay signature'
        db.session.commit()
        return error_response('Payment verification failed', 400)

    payment.status = 'succeeded'
    payment.transaction_ref = razorpay_payment_id
    payment.failure_reason = None
    payment.paid_at = datetime.utcnow()

    invoice.amount_paid_cents = int(invoice.amount_paid_cents or 0) + int(payment.amount_cents or 0)
    invoice.amount_due_cents = max(0, int(invoice.total_amount_cents or 0) - int(invoice.amount_paid_cents or 0))
    if invoice.amount_due_cents == 0:
        invoice.status = 'paid'
        invoice.paid_at = datetime.utcnow()

    metadata = _safe_json_loads(invoice.notes)
    metadata['razorpay_order_id'] = razorpay_order_id
    metadata['razorpay_payment_id'] = razorpay_payment_id
    invoice.notes = json.dumps(metadata)

    db.session.commit()

    order = _build_order_from_invoice(invoice, payment, customer_key)
    return success_response(order, 'Payment verified')


@store_bp.route('/orders/<int:order_id>/payment-session', methods=['POST'])
def create_order_payment_session(order_id):
    """Create a fresh Razorpay payment session for an existing unpaid order."""
    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    invoice = Invoice.query.filter_by(id=order_id, user_id=user.id).first()
    if not invoice:
        return error_response('Order not found', 404)

    amount_due = int(invoice.amount_due_cents or 0)
    if amount_due <= 0:
        return error_response('Order is already paid', 400)

    try:
        payment = Payment(
            invoice_id=invoice.id,
            user_id=user.id,
            amount_cents=amount_due,
            currency=invoice.currency or 'USD',
            status='pending',
        )
        db.session.add(payment)
        db.session.flush()

        key_id, _ = _razorpay_credentials()
        razorpay_order = _create_razorpay_order(
            amount_cents=amount_due,
            currency=invoice.currency or 'USD',
            receipt=f'order_retry_{invoice.id}_{payment.id}',
            notes={
                'invoice_id': str(invoice.id),
                'customer_key': customer_key,
                'payment_id': str(payment.id),
            },
        )

        payment.transaction_ref = razorpay_order.get('id')
        db.session.commit()

        return success_response(
            {
                'order_id': invoice.id,
                'amount_due_cents': amount_due,
                'payment_gateway': {
                    'provider': 'razorpay',
                    'key_id': key_id,
                    'order_id': razorpay_order.get('id'),
                    'amount': razorpay_order.get('amount'),
                    'currency': razorpay_order.get('currency') or invoice.currency or 'USD',
                    'name': 'SubSync',
                    'description': f'Order payment {invoice.invoice_number}',
                    'prefill': {
                        'email': user.email,
                        'contact': user.phone or '',
                    },
                },
            },
            'Payment session created',
        )
    except Exception as exc:
        db.session.rollback()
        return error_response(f'Unable to create payment session: {str(exc)}', 400)


@store_bp.route('/orders/<int:order_id>', methods=['GET'])
def get_order(order_id):
    """Get customer order summary for confirmation page."""
    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    invoice = Invoice.query.filter_by(id=order_id, user_id=user.id).first()
    if not invoice:
        return error_response('Order not found', 404)

    payment = Payment.query.filter_by(invoice_id=invoice.id).order_by(Payment.created_at.desc()).first()
    return success_response(_build_order_from_invoice(invoice, payment, customer_key))


@store_bp.route('/orders', methods=['GET'])
def list_orders():
    """List persisted orders for the current customer key."""
    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    invoices = (
        Invoice.query.filter_by(user_id=user.id)
        .order_by(Invoice.created_at.desc())
        .all()
    )

    rows = []
    for invoice in invoices:
        payment = Payment.query.filter_by(invoice_id=invoice.id).order_by(Payment.created_at.desc()).first()
        order = _build_order_from_invoice(invoice, payment, customer_key)
        rows.append(
            {
                'id': order['id'],
                'order_number': order.get('order_number'),
                'invoice_number': order.get('invoice_number'),
                'created_at': order.get('created_at'),
                'total_cents': order.get('total_cents', 0),
                'currency': order.get('currency') or 'USD',
                'payment_status': order.get('payment_status') or 'pending',
            }
        )

    return success_response({'items': rows, 'total': len(rows)})


@store_bp.route('/orders/<int:order_id>/invoice', methods=['GET'])
def get_order_invoice(order_id):
    """Get invoice data for a customer order."""
    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)
    if created:
        db.session.commit()

    invoice = Invoice.query.filter_by(id=order_id, user_id=user.id).first()
    if not invoice:
        return error_response('Order not found', 404)

    payment = Payment.query.filter_by(invoice_id=invoice.id).order_by(Payment.created_at.desc()).first()
    order = _build_order_from_invoice(invoice, payment, customer_key)
    return success_response(_invoice_snapshot_from_invoice(invoice, order))


@store_bp.route('/profile', methods=['GET'])
def get_profile():
    """Get editable customer profile for current customer key from persisted user profile."""
    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)

    if created:
        db.session.commit()

    return success_response(_build_profile_payload(customer_key, user))


@store_bp.route('/profile', methods=['PUT'])
def update_profile():
    """Update editable customer profile and persist to users/addresses tables."""
    payload = request.get_json(silent=True) or {}
    customer_key = _customer_key()
    account, user, created = _ensure_customer_identity(customer_key)

    name = str(payload.get('name') or '').strip()
    email = str(payload.get('email') or '').strip().lower()
    phone = str(payload.get('phone') or '').strip()
    address_value = str(payload.get('address') or '').strip()

    if email:
        existing_user = User.query.filter(User.email == email, User.id != user.id).first()
        if existing_user:
            return error_response('Email already in use', 400)

    if name:
        parts = [part for part in name.split(' ') if part]
        user.first_name = parts[0] if parts else user.first_name
        user.last_name = ' '.join(parts[1:]) if len(parts) > 1 else ''

    if email:
        user.email = email

    user.phone = phone

    billing_address = user.addresses.filter_by(address_type='billing').order_by(Address.id.asc()).first()
    if not billing_address:
        billing_address = Address(
            user_id=user.id,
            address_type='billing',
            is_primary=True,
        )
        db.session.add(billing_address)

    billing_address.street = address_value

    db.session.commit()

    return success_response(_build_profile_payload(customer_key, user), 'Profile updated')
