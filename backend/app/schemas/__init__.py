from marshmallow import Schema, fields, validate, ValidationError, pre_load
from marshmallow_sqlalchemy import SQLAlchemyAutoSchema, SQLAlchemySchema, auto_field
from app.models import (
    Account, User, UserRole, Address, PaymentMethod, Product, Plan,
    PlanFeature, Subscription, Invoice, InvoiceItem, Payment, AuditLog,
    Attribute, AttributeValue, QuotationTemplate, Discount, Tax, PaymentTerm
)


# Account Schema
class AccountSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Account
        load_instance = True
        include_relationships = True
        
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    slug = fields.Str(required=True, unique=True, validate=validate.Length(min=1, max=50))
    email_domain = fields.Str(validate=validate.Length(max=100))
    subscription_tier = fields.Str(validate=validate.OneOf(['free', 'starter', 'professional', 'enterprise']))
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    deleted_at = fields.DateTime(allow_none=True)


# User Schema
class UserSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = User
        load_instance = True
        include_relationships = True
        
    id = fields.Int(dump_only=True)
    account_id = fields.Int(required=True)
    email = fields.Email(required=True)
    email_verified_at = fields.DateTime(allow_none=True)
    password_hash = fields.Str(load_only=True)  # Never serialize to output
    first_name = fields.Str(validate=validate.Length(max=100))
    last_name = fields.Str(validate=validate.Length(max=100))
    phone = fields.Str(validate=validate.Length(max=30))
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class UserCreateSchema(Schema):
    """Schema for user creation/registration"""
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))
    first_name = fields.Str(required=True)
    last_name = fields.Str(required=True)
    phone = fields.Str()
    account_id = fields.Int(required=True)


# User Role Schema
class UserRoleSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = UserRole
        load_instance = True
        
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    role = fields.Str(required=True, validate=validate.OneOf(['admin', 'manager', 'customer', 'viewer']))
    granted_at = fields.DateTime(dump_only=True)


# Address Schema
class AddressSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Address
        load_instance = True
        
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    address_type = fields.Str(required=True, validate=validate.OneOf(['billing', 'shipping']))
    street = fields.Str()
    city = fields.Str()
    state = fields.Str()
    postal_code = fields.Str()
    country = fields.Str()
    is_primary = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Payment Method Schema
class PaymentMethodSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PaymentMethod
        load_instance = True
        
    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    provider = fields.Str(required=True, validate=validate.OneOf(['stripe', 'paypal', 'bank']))
    brand = fields.Str()
    last_four = fields.Str()
    expiry_month = fields.Int()
    expiry_year = fields.Int()
    is_default = fields.Bool()
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Product Schema
class ProductSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Product
        load_instance = True
        
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    slug = fields.Str(required=True, unique=True)
    description = fields.Str()
    product_type = fields.Str(validate=validate.OneOf(['product', 'subscription']))
    base_price_cents = fields.Int()
    currency = fields.Str(validate=validate.Length(equal=3), dump_default='USD')
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Plan Feature Schema
class PlanFeatureSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PlanFeature
        load_instance = True
        
    id = fields.Int(dump_only=True)
    plan_id = fields.Int(required=True)
    feature_name = fields.Str(required=True)
    feature_value = fields.Str()


class AttributeValueSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AttributeValue
        load_instance = True

    id = fields.Int(dump_only=True)
    attribute_id = fields.Int(required=True)
    value = fields.Str(required=True)
    extra_price_cents = fields.Int(dump_default=0)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class AttributeSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Attribute
        load_instance = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    is_active = fields.Bool()
    values = fields.Nested(AttributeValueSchema, many=True, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class QuotationTemplateSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = QuotationTemplate
        load_instance = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    recurring_plan_id = fields.Int(allow_none=True)
    valid_for_days = fields.Int(dump_default=30)
    header = fields.Str(allow_none=True)
    footer = fields.Str(allow_none=True)
    notes = fields.Str(allow_none=True)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class DiscountSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Discount
        load_instance = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    value_type = fields.Str(required=True, validate=validate.OneOf(['percentage', 'fixed']))
    value = fields.Float(required=True)
    recurring_plan_id = fields.Int(allow_none=True)
    notes = fields.Str(allow_none=True)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class TaxSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Tax
        load_instance = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    value_type = fields.Str(required=True, validate=validate.OneOf(['percentage', 'fixed']))
    value = fields.Float(required=True)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class PaymentTermSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = PaymentTerm
        load_instance = True

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=120))
    early_discount_type = fields.Str(required=True, validate=validate.OneOf(['percent', 'fixed']))
    early_discount_value = fields.Float(required=True)
    due_after_days = fields.Int(required=True)
    is_active = fields.Bool()
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Plan Schema
class PlanSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Plan
        load_instance = True
        
    id = fields.Int(dump_only=True)
    product_id = fields.Int(required=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str()
    price_cents = fields.Int(required=True)
    currency = fields.Str(validate=validate.Length(equal=3), dump_default='USD')
    interval = fields.Str(required=True, validate=validate.OneOf(['monthly', 'yearly', 'one_time']))
    interval_count = fields.Int(dump_default=1)
    trial_days = fields.Int(dump_default=0)
    is_active = fields.Bool()
    plan_features = fields.Nested(PlanFeatureSchema, many=True, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Subscription Schema
class SubscriptionSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Subscription
        load_instance = True
        exclude = ('metadata_json',)
        
    id = fields.Int(dump_only=True)
    account_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    plan_id = fields.Int(required=True)
    payment_method_id = fields.Int(allow_none=True)
    status = fields.Str(
        required=True,
        validate=validate.OneOf(['trialing', 'active', 'past_due', 'paused', 'canceled', 'expired']),
        dump_default='trialing'
    )
    current_period_start = fields.DateTime()
    current_period_end = fields.DateTime()
    trial_starts_at = fields.DateTime(allow_none=True)
    trial_ends_at = fields.DateTime(allow_none=True)
    cancel_at_period_end = fields.Bool()
    canceled_at = fields.DateTime(allow_none=True)
    cancellation_reason = fields.Str()
    metadata = fields.Method('get_metadata', deserialize='load_metadata')
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)

    def get_metadata(self, obj):
        return obj.metadata_json

    def load_metadata(self, value):
        return value


# Invoice Item Schema
class InvoiceItemSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = InvoiceItem
        load_instance = True
        
    id = fields.Int(dump_only=True)
    invoice_id = fields.Int(required=True)
    description = fields.Str(required=True)
    quantity = fields.Int(dump_default=1)
    unit_price_cents = fields.Int(required=True)
    amount_cents = fields.Int(required=True)
    item_type = fields.Str(validate=validate.OneOf(['charge', 'credit', 'tax', 'addon']), dump_default='charge')
    created_at = fields.DateTime(dump_only=True)


# Invoice Schema
class InvoiceSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Invoice
        load_instance = True
        
    id = fields.Int(dump_only=True)
    account_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    subscription_id = fields.Int(allow_none=True)
    invoice_number = fields.Str(required=True, unique=True)
    invoice_date = fields.DateTime()
    period_start = fields.DateTime()
    period_end = fields.DateTime()
    subtotal_cents = fields.Int(dump_default=0)
    discount_cents = fields.Int(dump_default=0)
    tax_cents = fields.Int(dump_default=0)
    total_amount_cents = fields.Int(dump_default=0)
    amount_paid_cents = fields.Int(dump_default=0)
    amount_due_cents = fields.Int(dump_default=0)
    currency = fields.Str(validate=validate.Length(equal=3), dump_default='USD')
    status = fields.Str(
        validate=validate.OneOf(['draft', 'ready', 'sent', 'opened', 'paid', 'past_due', 'void', 'refunded']),
        dump_default='draft'
    )
    due_date = fields.DateTime()
    paid_at = fields.DateTime(allow_none=True)
    notes = fields.Str()
    invoice_items = fields.Nested(InvoiceItemSchema, many=True, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Payment Schema
class PaymentSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = Payment
        load_instance = True
        
    id = fields.Int(dump_only=True)
    invoice_id = fields.Int(required=True)
    user_id = fields.Int(required=True)
    payment_method_id = fields.Int(allow_none=True)
    amount_cents = fields.Int(required=True)
    currency = fields.Str(validate=validate.Length(equal=3), dump_default='USD')
    status = fields.Str(
        validate=validate.OneOf(['pending', 'succeeded', 'failed']),
        dump_default='pending'
    )
    transaction_ref = fields.Str()
    failure_reason = fields.Str()
    paid_at = fields.DateTime(allow_none=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


# Audit Log Schema
class AuditLogSchema(SQLAlchemyAutoSchema):
    class Meta:
        model = AuditLog
        load_instance = True
        
    id = fields.Int(dump_only=True)
    account_id = fields.Int(required=True)
    user_id = fields.Int(allow_none=True)
    action = fields.Str(required=True)
    table_name = fields.Str(required=True)
    record_id = fields.Int()
    old_value = fields.Dict()
    new_value = fields.Dict()
    ip_address = fields.Str()
    user_agent = fields.Str()
    status = fields.Str(validate=validate.OneOf(['success', 'failed']), dump_default='success')
    error_message = fields.Str()
    created_at = fields.DateTime(dump_only=True)
