"""Invoice and Payment routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Invoice, InvoiceItem, Payment, Subscription, User, PaymentMethod, db
from app.schemas import InvoiceSchema, InvoiceItemSchema, PaymentSchema
from app.utils import success_response, error_response, create_audit_log
from datetime import datetime

invoices_bp = Blueprint('invoices', __name__, url_prefix='/api/invoices')
payments_bp = Blueprint('payments', __name__, url_prefix='/api/payments')


# Invoice Routes
@invoices_bp.route('/', methods=['GET'])
@jwt_required()
def list_invoices():
    """List user invoices"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Invoice.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    invoices = query.order_by(Invoice.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return success_response({
        'items': InvoiceSchema(many=True).dump(invoices.items),
        'total': invoices.total,
        'pages': invoices.pages,
        'current_page': page
    })


@invoices_bp.route('/<int:invoice_id>', methods=['GET'])
@jwt_required()
def get_invoice(invoice_id):
    """Get invoice by ID"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    invoice = Invoice.query.get(invoice_id)
    
    if not invoice:
        return error_response('Invoice not found', 404)
    
    # Check ownership or admin
    is_admin = user.roles.filter_by(role='admin').first() is not None
    if not (invoice.user_id == user_id or (is_admin and invoice.account_id == user.account_id)):
        return error_response('Forbidden', 403)
    
    return success_response(InvoiceSchema().dump(invoice))


@invoices_bp.route('/<int:invoice_id>/items', methods=['GET'])
@jwt_required()
def get_invoice_items(invoice_id):
    """Get invoice line items"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    invoice = Invoice.query.get(invoice_id)
    
    if not invoice:
        return error_response('Invoice not found', 404)
    
    # Check ownership or admin
    is_admin = user.roles.filter_by(role='admin').first() is not None
    if not (invoice.user_id == user_id or (is_admin and invoice.account_id == user.account_id)):
        return error_response('Forbidden', 403)
    
    items = invoice.invoice_items.all()
    return success_response(InvoiceItemSchema(many=True).dump(items))


@invoices_bp.route('/', methods=['POST'])
@jwt_required()
def create_invoice():
    """Create manual invoice (admin)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    is_admin = user.roles.filter_by(role='admin').first() is not None
    if not is_admin:
        return error_response('Admin required', 403)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    required = ['user_id', 'invoice_number']
    missing = [f for f in required if f not in data]
    if missing:
        return error_response(f'Missing fields: {", ".join(missing)}', 400)
    
    # Check if user exists
    target_user = User.query.get(data['user_id'])
    if not target_user or target_user.deleted_at:
        return error_response('Target user not found', 404)
    
    if target_user.account_id != user.account_id:
        return error_response('Forbidden', 403)
    
    try:
        invoice = Invoice(
            account_id=user.account_id,
            user_id=data['user_id'],
            subscription_id=data.get('subscription_id'),
            invoice_number=data['invoice_number'],
            invoice_date=datetime.utcnow(),
            period_start=datetime.fromisoformat(data['period_start']) if 'period_start' in data else None,
            period_end=datetime.fromisoformat(data['period_end']) if 'period_end' in data else None,
            subtotal_cents=data.get('subtotal_cents', 0),
            discount_cents=data.get('discount_cents', 0),
            tax_cents=data.get('tax_cents', 0),
            total_amount_cents=data.get('total_amount_cents', 0),
            amount_due_cents=data.get('total_amount_cents', 0),
            status=data.get('status', 'draft'),
            due_date=datetime.fromisoformat(data['due_date']) if 'due_date' in data else None,
            notes=data.get('notes')
        )
        
        db.session.add(invoice)
        db.session.flush()
        
        # Add line items
        if 'items' in data and isinstance(data['items'], list):
            for item in data['items']:
                invoice_item = InvoiceItem(
                    invoice_id=invoice.id,
                    description=item.get('description'),
                    quantity=item.get('quantity', 1),
                    unit_price_cents=item.get('unit_price_cents', 0),
                    amount_cents=item.get('amount_cents', 0),
                    item_type=item.get('item_type', 'charge')
                )
                db.session.add(invoice_item)
        
        db.session.commit()
        
        create_audit_log(user_id, user.account_id, 'invoice_created', 'invoices', invoice.id,
                        new_value=InvoiceSchema().dump(invoice))
        
        return success_response(InvoiceSchema().dump(invoice), 'Invoice created', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create invoice: {str(e)}', 400)


@invoices_bp.route('/<int:invoice_id>/send', methods=['POST'])
@jwt_required()
def send_invoice(invoice_id):
    """Mark invoice as sent"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    is_admin = user.roles.filter_by(role='admin').first() is not None
    if not is_admin:
        return error_response('Admin required', 403)
    
    invoice = Invoice.query.get(invoice_id)
    
    if not invoice:
        return error_response('Invoice not found', 404)
    
    if invoice.account_id != user.account_id:
        return error_response('Forbidden', 403)
    
    try:
        old_value = InvoiceSchema().dump(invoice)
        
        invoice.status = 'sent'
        db.session.commit()
        
        new_value = InvoiceSchema().dump(invoice)
        create_audit_log(user_id, user.account_id, 'invoice_sent', 'invoices', invoice_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(InvoiceSchema().dump(invoice), 'Invoice marked as sent')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to send invoice: {str(e)}', 400)


# Payment Routes
@payments_bp.route('/', methods=['GET'])
@jwt_required()
def list_payments():
    """List user payments"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Payment.query.filter_by(user_id=user_id)
    
    if status:
        query = query.filter_by(status=status)
    
    payments = query.order_by(Payment.created_at.desc()).paginate(page=page, per_page=per_page)
    
    return success_response({
        'items': PaymentSchema(many=True).dump(payments.items),
        'total': payments.total,
        'pages': payments.pages,
        'current_page': page
    })


@payments_bp.route('/<int:payment_id>', methods=['GET'])
@jwt_required()
def get_payment(payment_id):
    """Get payment by ID"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    payment = Payment.query.get(payment_id)
    
    if not payment:
        return error_response('Payment not found', 404)
    
    # Check ownership or admin
    is_admin = user.roles.filter_by(role='admin').first() is not None
    if not (payment.user_id == user_id or (is_admin and user.account_id == user.account_id)):
        return error_response('Forbidden', 403)
    
    return success_response(PaymentSchema().dump(payment))


@payments_bp.route('/', methods=['POST'])
@jwt_required()
def create_payment():
    """Create payment for invoice"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    required = ['invoice_id', 'amount_cents', 'payment_method_id']
    missing = [f for f in required if f not in data]
    if missing:
        return error_response(f'Missing fields: {", ".join(missing)}', 400)
    
    # Verify invoice exists and belongs to user
    invoice = Invoice.query.get(data['invoice_id'])
    if not invoice:
        return error_response('Invoice not found', 404)
    
    if invoice.user_id != user_id:
        return error_response('Forbidden', 403)
    
    # Verify payment method
    payment_method = PaymentMethod.query.get(data['payment_method_id'])
    if not payment_method:
        return error_response('Payment method not found', 404)
    
    if payment_method.user_id != user_id:
        return error_response('Forbidden', 403)
    
    try:
        # Process payment (mock - always succeeds)
        payment = Payment(
            invoice_id=data['invoice_id'],
            user_id=user_id,
            payment_method_id=data['payment_method_id'],
            amount_cents=data['amount_cents'],
            currency=data.get('currency', 'USD'),
            status='succeeded',
            transaction_ref=f"TXN-{data['invoice_id']}-{int(datetime.utcnow().timestamp())}",
            paid_at=datetime.utcnow()
        )
        
        db.session.add(payment)
        db.session.flush()
        
        # Update invoice
        invoice.amount_paid_cents += data['amount_cents']
        invoice.amount_due_cents = max(0, invoice.total_amount_cents - invoice.amount_paid_cents)
        
        if invoice.amount_due_cents == 0:
            invoice.status = 'paid'
            invoice.paid_at = datetime.utcnow()
        
        db.session.commit()
        
        create_audit_log(user_id, user.account_id, 'payment_received', 'payments', payment.id,
                        new_value=PaymentSchema().dump(payment))
        
        return success_response({
            'payment': PaymentSchema().dump(payment),
            'invoice': InvoiceSchema().dump(invoice)
        }, 'Payment received', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Payment failed: {str(e)}', 400)
