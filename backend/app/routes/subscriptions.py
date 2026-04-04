"""Subscription management routes"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Subscription, Plan, User, Invoice, InvoiceItem, Payment, PaymentMethod, db
from app.schemas import SubscriptionSchema, InvoiceSchema, PaymentSchema
from app.utils import success_response, error_response, create_audit_log
from datetime import datetime, timedelta

subscriptions_bp = Blueprint('subscriptions', __name__, url_prefix='/api/subscriptions')


@subscriptions_bp.route('/', methods=['GET'])
@jwt_required()
def list_subscriptions():
    """List user subscriptions"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    status = request.args.get('status')
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Subscription.query.filter_by(user_id=user_id, deleted_at=None)
    
    if status:
        query = query.filter_by(status=status)
    
    subscriptions = query.paginate(page=page, per_page=per_page)
    
    return success_response({
        'items': SubscriptionSchema(many=True).dump(subscriptions.items),
        'total': subscriptions.total,
        'pages': subscriptions.pages,
        'current_page': page
    })


@subscriptions_bp.route('/<int:subscription_id>', methods=['GET'])
@jwt_required()
def get_subscription(subscription_id):
    """Get subscription by ID"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    subscription = Subscription.query.get(subscription_id)
    
    if not subscription or subscription.deleted_at:
        return error_response('Subscription not found', 404)
    
    # Check ownership or admin
    is_admin = user.roles.filter_by(role='admin').first() is not None
    if not (subscription.user_id == user_id or (is_admin and subscription.account_id == user.account_id)):
        return error_response('Forbidden', 403)
    
    return success_response(SubscriptionSchema().dump(subscription))


@subscriptions_bp.route('/', methods=['POST'])
@jwt_required()
def create_subscription():
    """Create new subscription"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    # Validate required fields
    required = ['plan_id']
    missing = [f for f in required if f not in data]
    if missing:
        return error_response(f'Missing fields: {", ".join(missing)}', 400)
    
    plan = Plan.query.get(data['plan_id'])
    if not plan:
        return error_response('Plan not found', 404)
    
    try:
        # Set trial period
        trial_days = plan.trial_days if plan.trial_days > 0 else 0
        current_time = datetime.utcnow()
        
        subscription = Subscription(
            account_id=user.account_id,
            user_id=user_id,
            plan_id=data['plan_id'],
            payment_method_id=data.get('payment_method_id'),
            status='trialing' if trial_days > 0 else 'active',
            current_period_start=current_time,
            current_period_end=current_time + timedelta(days=trial_days) if trial_days > 0 else current_time + timedelta(days=30),
            trial_starts_at=current_time if trial_days > 0 else None,
            trial_ends_at=(current_time + timedelta(days=trial_days)) if trial_days > 0 else None,
            metadata=data.get('metadata')
        )
        
        db.session.add(subscription)
        db.session.flush()
        
        # Create initial invoice
        invoice = Invoice(
            account_id=user.account_id,
            user_id=user_id,
            subscription_id=subscription.id,
            invoice_number=f"INV-{user.account_id}-{subscription.id}",
            invoice_date=current_time,
            period_start=subscription.current_period_start,
            period_end=subscription.current_period_end,
            subtotal_cents=plan.price_cents,
            total_amount_cents=plan.price_cents,
            amount_due_cents=plan.price_cents,
            status='draft',
            due_date=current_time + timedelta(days=7)
        )
        
        db.session.add(invoice)
        db.session.flush()
        
        # Create invoice item
        invoice_item = InvoiceItem(
            invoice_id=invoice.id,
            description=f"{plan.name} ({plan.interval})",
            quantity=1,
            unit_price_cents=plan.price_cents,
            amount_cents=plan.price_cents,
            item_type='charge'
        )
        
        db.session.add(invoice_item)
        db.session.commit()
        
        create_audit_log(user_id, user.account_id, 'subscription_created', 'subscriptions', subscription.id,
                        new_value=SubscriptionSchema().dump(subscription))
        
        return success_response({
            'subscription': SubscriptionSchema().dump(subscription),
            'invoice': InvoiceSchema().dump(invoice)
        }, 'Subscription created', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create subscription: {str(e)}', 400)


@subscriptions_bp.route('/<int:subscription_id>/cancel', methods=['POST'])
@jwt_required()
def cancel_subscription(subscription_id):
    """Cancel subscription"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    subscription = Subscription.query.get(subscription_id)
    
    if not subscription or subscription.deleted_at:
        return error_response('Subscription not found', 404)
    
    if subscription.user_id != user_id:
        return error_response('Forbidden', 403)
    
    if not request.is_json:
        data = {}
    else:
        data = request.get_json()
    
    try:
        old_value = SubscriptionSchema().dump(subscription)
        
        subscription.status = 'canceled'
        subscription.canceled_at = datetime.utcnow()
        subscription.cancellation_reason = data.get('reason')
        
        db.session.commit()
        
        new_value = SubscriptionSchema().dump(subscription)
        create_audit_log(user_id, user.account_id, 'subscription_canceled', 'subscriptions', subscription_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(SubscriptionSchema().dump(subscription), 'Subscription canceled')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Cancellation failed: {str(e)}', 400)


@subscriptions_bp.route('/<int:subscription_id>/pause', methods=['POST'])
@jwt_required()
def pause_subscription(subscription_id):
    """Pause subscription"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    subscription = Subscription.query.get(subscription_id)
    
    if not subscription or subscription.deleted_at:
        return error_response('Subscription not found', 404)
    
    if subscription.user_id != user_id:
        return error_response('Forbidden', 403)
    
    try:
        old_value = SubscriptionSchema().dump(subscription)
        
        subscription.status = 'paused'
        db.session.commit()
        
        new_value = SubscriptionSchema().dump(subscription)
        create_audit_log(user_id, user.account_id, 'subscription_paused', 'subscriptions', subscription_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(SubscriptionSchema().dump(subscription), 'Subscription paused')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Pause failed: {str(e)}', 400)


@subscriptions_bp.route('/<int:subscription_id>/resume', methods=['POST'])
@jwt_required()
def resume_subscription(subscription_id):
    """Resume paused subscription"""
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('Unauthorized', 401)
    
    subscription = Subscription.query.get(subscription_id)
    
    if not subscription or subscription.deleted_at:
        return error_response('Subscription not found', 404)
    
    if subscription.user_id != user_id:
        return error_response('Forbidden', 403)
    
    if subscription.status != 'paused':
        return error_response('Only paused subscriptions can be resumed', 400)
    
    try:
        old_value = SubscriptionSchema().dump(subscription)
        
        subscription.status = 'active'
        db.session.commit()
        
        new_value = SubscriptionSchema().dump(subscription)
        create_audit_log(user_id, user.account_id, 'subscription_resumed', 'subscriptions', subscription_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(SubscriptionSchema().dump(subscription), 'Subscription resumed')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Resume failed: {str(e)}', 400)
