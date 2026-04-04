from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import enum

db = SQLAlchemy()


class Account(db.Model):
    """Companies or organizations in the system"""
    __tablename__ = 'accounts'
    
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(50), unique=True, nullable=False)
    email_domain = db.Column(db.String(100))
    subscription_tier = db.Column(
        db.String(20),
        default='free'
    )
    billing_contact_email = db.Column(db.String(190))
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    users = db.relationship('User', backref='account', lazy='dynamic', cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', backref='account', lazy='dynamic', cascade='all, delete-orphan')
    invoices = db.relationship('Invoice', backref='account', lazy='dynamic', cascade='all, delete-orphan')
    audit_logs = db.relationship('AuditLog', backref='account', lazy='dynamic', cascade='all, delete-orphan')


class User(db.Model):
    """Individual people who log in"""
    __tablename__ = 'users'
    
    id = db.Column(db.BigInteger, primary_key=True)
    account_id = db.Column(db.BigInteger, db.ForeignKey('accounts.id'), nullable=False)
    email = db.Column(db.String(190), unique=True, nullable=False, index=True)
    email_verified_at = db.Column(db.DateTime, nullable=True)
    password_hash = db.Column(db.String(255), nullable=True)
    first_name = db.Column(db.String(100))
    last_name = db.Column(db.String(100))
    phone = db.Column(db.String(30), nullable=True)
    oauth_provider = db.Column(db.String(50), nullable=True)
    oauth_id = db.Column(db.String(120), nullable=True)
    last_login_at = db.Column(db.DateTime, nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    roles = db.relationship('UserRole', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    addresses = db.relationship('Address', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    payment_methods = db.relationship('PaymentMethod', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    subscriptions = db.relationship('Subscription', backref='user', lazy='dynamic')
    invoices = db.relationship('Invoice', backref='user', lazy='dynamic')
    payments = db.relationship('Payment', backref='user', lazy='dynamic')
    audit_logs = db.relationship('AuditLog', backref='user', lazy='dynamic')


class UserRole(db.Model):
    """Maps users to roles"""
    __tablename__ = 'user_roles'
    
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    role = db.Column(db.String(50), nullable=False)  # admin, manager, customer, viewer
    granted_at = db.Column(db.DateTime, default=datetime.utcnow)
    granted_by_user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=True)


class Address(db.Model):
    """User addresses"""
    __tablename__ = 'addresses'
    
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    address_type = db.Column(db.String(50), nullable=False)  # billing, shipping
    street = db.Column(db.String(255))
    city = db.Column(db.String(100))
    state = db.Column(db.String(100))
    postal_code = db.Column(db.String(20))
    country = db.Column(db.String(100))
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PaymentMethod(db.Model):
    """Payment methods for users"""
    __tablename__ = 'payment_methods'
    
    id = db.Column(db.BigInteger, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    provider = db.Column(db.String(50), nullable=False)  # stripe, paypal, bank
    brand = db.Column(db.String(50))  # visa, mastercard, amex
    last_four = db.Column(db.String(4))
    expiry_month = db.Column(db.Integer, nullable=True)
    expiry_year = db.Column(db.Integer, nullable=True)
    is_default = db.Column(db.Boolean, default=False)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = db.relationship('Subscription', backref='payment_method', lazy='dynamic')
    payments = db.relationship('Payment', backref='payment_method', lazy='dynamic')


class Product(db.Model):
    """Products available for subscription"""
    __tablename__ = 'products'
    
    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    slug = db.Column(db.String(100), unique=True, nullable=False)
    description = db.Column(db.Text)
    product_type = db.Column(db.String(50))  # product, subscription
    base_price_cents = db.Column(db.Integer)
    currency = db.Column(db.String(3), default='USD')
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    plans = db.relationship('Plan', backref='product', lazy='dynamic', cascade='all, delete-orphan')


class Plan(db.Model):
    """Pricing plans for products"""
    __tablename__ = 'plans'
    
    id = db.Column(db.BigInteger, primary_key=True)
    product_id = db.Column(db.BigInteger, db.ForeignKey('products.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    price_cents = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    interval = db.Column(db.String(50), nullable=False)  # monthly, yearly, one_time
    interval_count = db.Column(db.Integer, default=1)
    trial_days = db.Column(db.Integer, default=0)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    subscriptions = db.relationship('Subscription', backref='plan', lazy='dynamic')
    plan_features = db.relationship('PlanFeature', backref='plan', lazy='dynamic', cascade='all, delete-orphan')


class PlanFeature(db.Model):
    """Features included in a plan"""
    __tablename__ = 'plan_features'
    
    id = db.Column(db.BigInteger, primary_key=True)
    plan_id = db.Column(db.BigInteger, db.ForeignKey('plans.id', ondelete='CASCADE'), nullable=False)
    feature_name = db.Column(db.String(100), nullable=False)
    feature_value = db.Column(db.String(255))


class Subscription(db.Model):
    """Active or past subscriptions"""
    __tablename__ = 'subscriptions'
    
    id = db.Column(db.BigInteger, primary_key=True)
    account_id = db.Column(db.BigInteger, db.ForeignKey('accounts.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    plan_id = db.Column(db.BigInteger, db.ForeignKey('plans.id'), nullable=False)
    payment_method_id = db.Column(db.BigInteger, db.ForeignKey('payment_methods.id'), nullable=True)
    status = db.Column(db.String(50), default='trialing')  # trialing, active, past_due, paused, canceled, expired
    current_period_start = db.Column(db.DateTime)
    current_period_end = db.Column(db.DateTime)
    trial_starts_at = db.Column(db.DateTime, nullable=True)
    trial_ends_at = db.Column(db.DateTime, nullable=True)
    cancel_at_period_end = db.Column(db.Boolean, default=False)
    canceled_at = db.Column(db.DateTime, nullable=True)
    cancellation_reason = db.Column(db.String(255), nullable=True)
    ended_at = db.Column(db.DateTime, nullable=True)
    metadata = db.Column(db.JSON, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = db.Column(db.DateTime, nullable=True)
    
    # Relationships
    invoices = db.relationship('Invoice', backref='subscription', lazy='dynamic', cascade='all, delete-orphan')
    __table_args__ = (
        db.Index('idx_user_status', 'user_id', 'status'),
        db.Index('idx_status_period', 'status', 'current_period_end'),
    )


class Invoice(db.Model):
    """Billing statements"""
    __tablename__ = 'invoices'
    
    id = db.Column(db.BigInteger, primary_key=True)
    account_id = db.Column(db.BigInteger, db.ForeignKey('accounts.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    subscription_id = db.Column(db.BigInteger, db.ForeignKey('subscriptions.id'), nullable=True)
    invoice_number = db.Column(db.String(40), unique=True, nullable=False)
    invoice_date = db.Column(db.DateTime, default=datetime.utcnow)
    period_start = db.Column(db.DateTime)
    period_end = db.Column(db.DateTime)
    subtotal_cents = db.Column(db.Integer, default=0)
    discount_cents = db.Column(db.Integer, default=0)
    tax_cents = db.Column(db.Integer, default=0)
    total_amount_cents = db.Column(db.Integer, default=0)
    amount_paid_cents = db.Column(db.Integer, default=0)
    amount_due_cents = db.Column(db.Integer, default=0)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(50), default='draft')  # draft, ready, sent, opened, paid, past_due, void, refunded
    due_date = db.Column(db.DateTime)
    paid_at = db.Column(db.DateTime, nullable=True)
    billing_address_id = db.Column(db.BigInteger, db.ForeignKey('addresses.id'), nullable=True)
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    invoice_items = db.relationship('InvoiceItem', backref='invoice', lazy='dynamic', cascade='all, delete-orphan')
    payments = db.relationship('Payment', backref='invoice', lazy='dynamic', cascade='all, delete-orphan')
    __table_args__ = (
        db.Index('idx_subscription_status', 'subscription_id', 'status'),
        db.Index('idx_user_date', 'user_id', 'invoice_date'),
    )


class InvoiceItem(db.Model):
    """Line items on invoices"""
    __tablename__ = 'invoice_items'
    
    id = db.Column(db.BigInteger, primary_key=True)
    invoice_id = db.Column(db.BigInteger, db.ForeignKey('invoices.id', ondelete='CASCADE'), nullable=False)
    description = db.Column(db.String(255), nullable=False)
    quantity = db.Column(db.Integer, default=1)
    unit_price_cents = db.Column(db.Integer, nullable=False)
    amount_cents = db.Column(db.Integer, nullable=False)
    item_type = db.Column(db.String(50), default='charge')  # charge, credit, tax, addon
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Payment(db.Model):
    """Payment transactions"""
    __tablename__ = 'payments'
    
    id = db.Column(db.BigInteger, primary_key=True)
    invoice_id = db.Column(db.BigInteger, db.ForeignKey('invoices.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=False)
    payment_method_id = db.Column(db.BigInteger, db.ForeignKey('payment_methods.id'), nullable=True)
    amount_cents = db.Column(db.Integer, nullable=False)
    currency = db.Column(db.String(3), default='USD')
    status = db.Column(db.String(50), default='pending')  # pending, succeeded, failed
    transaction_ref = db.Column(db.String(120))
    failure_reason = db.Column(db.String(255), nullable=True)
    paid_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    __table_args__ = (
        db.Index('idx_status_date', 'status', 'created_at'),
    )


class AuditLog(db.Model):
    """System audit trail"""
    __tablename__ = 'audit_logs'
    
    id = db.Column(db.BigInteger, primary_key=True)
    account_id = db.Column(db.BigInteger, db.ForeignKey('accounts.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey('users.id'), nullable=True)
    action = db.Column(db.String(100), nullable=False)
    table_name = db.Column(db.String(100), nullable=False)
    record_id = db.Column(db.BigInteger)
    old_value = db.Column(db.JSON, nullable=True)
    new_value = db.Column(db.JSON, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    user_agent = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(50), default='success')  # success, failed
    error_message = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)
    
    __table_args__ = (
        db.Index('idx_account_date', 'account_id', 'created_at'),
    )
