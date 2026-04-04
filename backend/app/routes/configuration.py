"""Configuration routes for attributes, quotation templates, discounts, and taxes"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Attribute, AttributeValue, QuotationTemplate, Discount, Tax, PaymentTerm, Plan, User, db
from app.schemas import AttributeSchema, AttributeValueSchema, QuotationTemplateSchema, DiscountSchema, TaxSchema, PaymentTermSchema
from app.utils import success_response, error_response, admin_required, create_audit_log, is_json_request

attributes_bp = Blueprint('attributes', __name__, url_prefix='/api/attributes')
quotation_templates_bp = Blueprint('quotation_templates', __name__, url_prefix='/api/quotation-templates')
discounts_bp = Blueprint('discounts', __name__, url_prefix='/api/discounts')
taxes_bp = Blueprint('taxes', __name__, url_prefix='/api/taxes')
payment_terms_bp = Blueprint('payment_terms', __name__, url_prefix='/api/payment-terms')


@attributes_bp.route('/', methods=['GET'])
@jwt_required()
def list_attributes():
    """List active attributes"""
    items = Attribute.query.filter_by(is_active=True).order_by(Attribute.name.asc()).all()
    return success_response(AttributeSchema(many=True).dump(items))


@attributes_bp.route('/<int:attribute_id>', methods=['GET'])
@jwt_required()
def get_attribute(attribute_id):
    """Get attribute details"""
    item = Attribute.query.get(attribute_id)
    if not item:
        return error_response('Attribute not found', 404)
    return success_response(AttributeSchema().dump(item))


@attributes_bp.route('/', methods=['POST'])
@admin_required
def create_attribute():
    """Create attribute"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()
    name = (data.get('name') or '').strip()
    if not name:
        return error_response('Attribute name is required', 400)

    if Attribute.query.filter_by(name=name).first():
        return error_response('Attribute name already exists', 409)

    try:
        item = Attribute(name=name, is_active=data.get('is_active', True))
        db.session.add(item)
        db.session.flush()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'attribute_created',
            'attributes',
            item.id,
            new_value=AttributeSchema().dump(item),
        )

        db.session.commit()
        return success_response(AttributeSchema().dump(item), 'Attribute created', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create attribute: {str(e)}', 400)


@attributes_bp.route('/<int:attribute_id>', methods=['PUT'])
@admin_required
def update_attribute(attribute_id):
    """Update attribute"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    item = Attribute.query.get(attribute_id)
    if not item:
        return error_response('Attribute not found', 404)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()

    try:
        old_value = AttributeSchema().dump(item)

        if 'name' in data and str(data['name']).strip():
            next_name = str(data['name']).strip()
            duplicate = Attribute.query.filter(Attribute.name == next_name, Attribute.id != attribute_id).first()
            if duplicate:
                return error_response('Attribute name already exists', 409)
            item.name = next_name

        if 'is_active' in data:
            item.is_active = bool(data['is_active'])

        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'attribute_updated',
            'attributes',
            item.id,
            old_value=old_value,
            new_value=AttributeSchema().dump(item),
        )

        return success_response(AttributeSchema().dump(item), 'Attribute updated')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update attribute: {str(e)}', 400)


@attributes_bp.route('/<int:attribute_id>/values', methods=['GET'])
@jwt_required()
def list_attribute_values(attribute_id):
    """List values for an attribute"""
    item = Attribute.query.get(attribute_id)
    if not item:
        return error_response('Attribute not found', 404)

    values = item.values.filter_by(is_active=True).order_by(AttributeValue.id.asc()).all()
    return success_response(AttributeValueSchema(many=True).dump(values))


@attributes_bp.route('/<int:attribute_id>/values', methods=['POST'])
@admin_required
def create_attribute_value(attribute_id):
    """Create value for an attribute"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    item = Attribute.query.get(attribute_id)
    if not item:
        return error_response('Attribute not found', 404)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()
    value = (data.get('value') or '').strip()
    if not value:
        return error_response('Value is required', 400)

    try:
        row = AttributeValue(
            attribute_id=attribute_id,
            value=value,
            extra_price_cents=int(data.get('extra_price_cents') or 0),
            is_active=data.get('is_active', True),
        )
        db.session.add(row)
        db.session.flush()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'attribute_value_created',
            'attribute_values',
            row.id,
            new_value=AttributeValueSchema().dump(row),
        )

        db.session.commit()
        return success_response(AttributeValueSchema().dump(row), 'Attribute value created', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create attribute value: {str(e)}', 400)


@attributes_bp.route('/values/<int:value_id>', methods=['DELETE'])
@admin_required
def delete_attribute_value(value_id):
    """Delete attribute value"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    row = AttributeValue.query.get(value_id)
    if not row:
        return error_response('Attribute value not found', 404)

    try:
        old_value = AttributeValueSchema().dump(row)
        db.session.delete(row)
        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'attribute_value_deleted',
            'attribute_values',
            value_id,
            old_value=old_value,
        )

        return success_response(None, 'Attribute value deleted')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete attribute value: {str(e)}', 400)


@quotation_templates_bp.route('/', methods=['GET'])
@jwt_required()
def list_quotation_templates():
    """List active quotation templates"""
    items = QuotationTemplate.query.filter_by(is_active=True).order_by(QuotationTemplate.created_at.desc()).all()
    return success_response(QuotationTemplateSchema(many=True).dump(items))


@quotation_templates_bp.route('/<int:template_id>', methods=['GET'])
@jwt_required()
def get_quotation_template(template_id):
    """Get quotation template"""
    item = QuotationTemplate.query.get(template_id)
    if not item:
        return error_response('Quotation template not found', 404)
    return success_response(QuotationTemplateSchema().dump(item))


@quotation_templates_bp.route('/', methods=['POST'])
@admin_required
def create_quotation_template():
    """Create quotation template"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()
    name = (data.get('name') or '').strip()
    if not name:
        return error_response('Template name is required', 400)

    recurring_plan_id = data.get('recurring_plan_id')
    if recurring_plan_id and not Plan.query.get(recurring_plan_id):
        return error_response('Recurring plan not found', 404)

    try:
        item = QuotationTemplate(
            name=name,
            recurring_plan_id=recurring_plan_id,
            valid_for_days=int(data.get('valid_for_days') or 30),
            header=data.get('header'),
            footer=data.get('footer'),
            notes=data.get('notes'),
            is_active=data.get('is_active', True),
        )
        db.session.add(item)
        db.session.flush()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'quotation_template_created',
            'quotation_templates',
            item.id,
            new_value=QuotationTemplateSchema().dump(item),
        )

        db.session.commit()
        return success_response(QuotationTemplateSchema().dump(item), 'Quotation template created', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create quotation template: {str(e)}', 400)


@quotation_templates_bp.route('/<int:template_id>', methods=['PUT'])
@admin_required
def update_quotation_template(template_id):
    """Update quotation template"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    item = QuotationTemplate.query.get(template_id)
    if not item:
        return error_response('Quotation template not found', 404)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()

    recurring_plan_id = data.get('recurring_plan_id', item.recurring_plan_id)
    if recurring_plan_id and not Plan.query.get(recurring_plan_id):
        return error_response('Recurring plan not found', 404)

    try:
        old_value = QuotationTemplateSchema().dump(item)

        if 'name' in data and str(data['name']).strip():
            item.name = str(data['name']).strip()
        if 'recurring_plan_id' in data:
            item.recurring_plan_id = recurring_plan_id
        if 'valid_for_days' in data:
            item.valid_for_days = int(data.get('valid_for_days') or 30)
        if 'header' in data:
            item.header = data.get('header')
        if 'footer' in data:
            item.footer = data.get('footer')
        if 'notes' in data:
            item.notes = data.get('notes')
        if 'is_active' in data:
            item.is_active = bool(data.get('is_active'))

        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'quotation_template_updated',
            'quotation_templates',
            item.id,
            old_value=old_value,
            new_value=QuotationTemplateSchema().dump(item),
        )

        return success_response(QuotationTemplateSchema().dump(item), 'Quotation template updated')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update quotation template: {str(e)}', 400)


@discounts_bp.route('/', methods=['GET'])
@jwt_required()
def list_discounts():
    """List active discounts"""
    items = Discount.query.filter_by(is_active=True).order_by(Discount.created_at.desc()).all()
    return success_response(DiscountSchema(many=True).dump(items))


@discounts_bp.route('/<int:discount_id>', methods=['GET'])
@jwt_required()
def get_discount(discount_id):
    """Get discount by ID"""
    item = Discount.query.get(discount_id)
    if not item:
        return error_response('Discount not found', 404)
    return success_response(DiscountSchema().dump(item))


@discounts_bp.route('/', methods=['POST'])
@admin_required
def create_discount():
    """Create discount (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()
    name = (data.get('name') or '').strip()
    if not name:
        return error_response('Discount name is required', 400)

    value_type = data.get('value_type', 'percentage')
    if value_type not in ['percentage', 'fixed']:
        return error_response('Invalid value type', 400)

    recurring_plan_id = data.get('recurring_plan_id')
    if recurring_plan_id and not Plan.query.get(recurring_plan_id):
        return error_response('Recurring plan not found', 404)

    try:
        item = Discount(
            name=name,
            value_type=value_type,
            value=float(data.get('value') or 0),
            recurring_plan_id=recurring_plan_id,
            notes=data.get('notes'),
            is_active=data.get('is_active', True),
        )
        db.session.add(item)
        db.session.flush()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'discount_created',
            'discounts',
            item.id,
            new_value=DiscountSchema().dump(item),
        )

        db.session.commit()
        return success_response(DiscountSchema().dump(item), 'Discount created', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create discount: {str(e)}', 400)


@discounts_bp.route('/<int:discount_id>', methods=['PUT'])
@admin_required
def update_discount(discount_id):
    """Update discount (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    item = Discount.query.get(discount_id)
    if not item:
        return error_response('Discount not found', 404)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()

    if 'recurring_plan_id' in data and data.get('recurring_plan_id'):
        if not Plan.query.get(data.get('recurring_plan_id')):
            return error_response('Recurring plan not found', 404)

    try:
        old_value = DiscountSchema().dump(item)

        if 'name' in data and str(data.get('name')).strip():
            item.name = str(data.get('name')).strip()
        if 'value_type' in data and data.get('value_type') in ['percentage', 'fixed']:
            item.value_type = data.get('value_type')
        if 'value' in data:
            item.value = float(data.get('value') or 0)
        if 'recurring_plan_id' in data:
            item.recurring_plan_id = data.get('recurring_plan_id')
        if 'notes' in data:
            item.notes = data.get('notes')
        if 'is_active' in data:
            item.is_active = bool(data.get('is_active'))

        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'discount_updated',
            'discounts',
            item.id,
            old_value=old_value,
            new_value=DiscountSchema().dump(item),
        )

        return success_response(DiscountSchema().dump(item), 'Discount updated')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update discount: {str(e)}', 400)


@taxes_bp.route('/', methods=['GET'])
@jwt_required()
def list_taxes():
    """List active taxes"""
    items = Tax.query.filter_by(is_active=True).order_by(Tax.created_at.desc()).all()
    return success_response(TaxSchema(many=True).dump(items))


@taxes_bp.route('/<int:tax_id>', methods=['GET'])
@jwt_required()
def get_tax(tax_id):
    """Get tax by ID"""
    item = Tax.query.get(tax_id)
    if not item:
        return error_response('Tax not found', 404)
    return success_response(TaxSchema().dump(item))


@taxes_bp.route('/', methods=['POST'])
@admin_required
def create_tax():
    """Create tax (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()
    name = (data.get('name') or '').strip()
    if not name:
        return error_response('Tax name is required', 400)

    value_type = data.get('value_type', 'percentage')
    if value_type not in ['percentage', 'fixed']:
        return error_response('Invalid value type', 400)

    try:
        item = Tax(
            name=name,
            value_type=value_type,
            value=float(data.get('value') or 0),
            is_active=data.get('is_active', True),
        )
        db.session.add(item)
        db.session.flush()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'tax_created',
            'taxes',
            item.id,
            new_value=TaxSchema().dump(item),
        )

        db.session.commit()
        return success_response(TaxSchema().dump(item), 'Tax created', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create tax: {str(e)}', 400)


@taxes_bp.route('/<int:tax_id>', methods=['PUT'])
@admin_required
def update_tax(tax_id):
    """Update tax (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    item = Tax.query.get(tax_id)
    if not item:
        return error_response('Tax not found', 404)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()

    try:
        old_value = TaxSchema().dump(item)

        if 'name' in data and str(data.get('name')).strip():
            item.name = str(data.get('name')).strip()
        if 'value_type' in data and data.get('value_type') in ['percentage', 'fixed']:
            item.value_type = data.get('value_type')
        if 'value' in data:
            item.value = float(data.get('value') or 0)
        if 'is_active' in data:
            item.is_active = bool(data.get('is_active'))

        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'tax_updated',
            'taxes',
            item.id,
            old_value=old_value,
            new_value=TaxSchema().dump(item),
        )

        return success_response(TaxSchema().dump(item), 'Tax updated')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update tax: {str(e)}', 400)


@payment_terms_bp.route('/', methods=['GET'])
@jwt_required()
def list_payment_terms():
    """List active payment terms"""
    items = PaymentTerm.query.filter_by(is_active=True).order_by(PaymentTerm.created_at.desc()).all()
    return success_response(PaymentTermSchema(many=True).dump(items))


@payment_terms_bp.route('/<int:payment_term_id>', methods=['GET'])
@jwt_required()
def get_payment_term(payment_term_id):
    """Get payment term by ID"""
    item = PaymentTerm.query.get(payment_term_id)
    if not item:
        return error_response('Payment term not found', 404)
    return success_response(PaymentTermSchema().dump(item))


@payment_terms_bp.route('/', methods=['POST'])
@admin_required
def create_payment_term():
    """Create payment term (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()
    name = (data.get('name') or '').strip()
    if not name:
        return error_response('Payment term name is required', 400)

    discount_type = data.get('early_discount_type', 'percent')
    if discount_type not in ['percent', 'fixed']:
        return error_response('Invalid early discount type', 400)

    try:
        item = PaymentTerm(
            name=name,
            early_discount_type=discount_type,
            early_discount_value=float(data.get('early_discount_value') or 0),
            due_after_days=int(data.get('due_after_days') or 0),
            is_active=data.get('is_active', True),
        )
        db.session.add(item)
        db.session.flush()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'payment_term_created',
            'payment_terms',
            item.id,
            new_value=PaymentTermSchema().dump(item),
        )

        db.session.commit()
        return success_response(PaymentTermSchema().dump(item), 'Payment term created', 201)
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create payment term: {str(e)}', 400)


@payment_terms_bp.route('/<int:payment_term_id>', methods=['PUT'])
@admin_required
def update_payment_term(payment_term_id):
    """Update payment term (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    item = PaymentTerm.query.get(payment_term_id)
    if not item:
        return error_response('Payment term not found', 404)

    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)

    data = request.get_json()

    if 'early_discount_type' in data and data.get('early_discount_type') not in ['percent', 'fixed']:
        return error_response('Invalid early discount type', 400)

    try:
        old_value = PaymentTermSchema().dump(item)

        if 'name' in data and str(data.get('name')).strip():
            item.name = str(data.get('name')).strip()
        if 'early_discount_type' in data:
            item.early_discount_type = data.get('early_discount_type')
        if 'early_discount_value' in data:
            item.early_discount_value = float(data.get('early_discount_value') or 0)
        if 'due_after_days' in data:
            item.due_after_days = int(data.get('due_after_days') or 0)
        if 'is_active' in data:
            item.is_active = bool(data.get('is_active'))

        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'payment_term_updated',
            'payment_terms',
            item.id,
            old_value=old_value,
            new_value=PaymentTermSchema().dump(item),
        )

        return success_response(PaymentTermSchema().dump(item), 'Payment term updated')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to update payment term: {str(e)}', 400)
