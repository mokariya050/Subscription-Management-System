"""Product and Plan management routes"""
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import Product, Plan, PlanFeature, User, db
from app.schemas import ProductSchema, PlanSchema, PlanFeatureSchema
from app.utils import success_response, error_response, admin_required, create_audit_log

products_bp = Blueprint('products', __name__, url_prefix='/api/products')
plans_bp = Blueprint('plans', __name__, url_prefix='/api/plans')


# Product Routes
@products_bp.route('/', methods=['GET'])
def list_products():
    """List all active products"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    products = Product.query.filter_by(is_active=True).paginate(page=page, per_page=per_page)
    
    return success_response({
        'items': ProductSchema(many=True).dump(products.items),
        'total': products.total,
        'pages': products.pages,
        'current_page': page
    })


@products_bp.route('/<int:product_id>', methods=['GET'])
def get_product(product_id):
    """Get product by ID"""
    product = Product.query.get(product_id)
    
    if not product:
        return error_response('Product not found', 404)
    
    return success_response(ProductSchema().dump(product))


@products_bp.route('/', methods=['POST'])
@admin_required
def create_product():
    """Create new product (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    # Validate required fields
    required = ['name', 'slug', 'product_type']
    missing = [f for f in required if f not in data]
    if missing:
        return error_response(f'Missing fields: {", ".join(missing)}', 400)
    
    if Product.query.filter_by(slug=data['slug']).first():
        return error_response('Product slug already exists', 409)
    
    try:
        product = Product(
            name=data['name'],
            slug=data['slug'],
            description=data.get('description'),
            product_type=data['product_type'],
            base_price_cents=data.get('base_price_cents'),
            currency=data.get('currency', 'USD'),
            is_active=data.get('is_active', True)
        )
        db.session.add(product)
        db.session.flush()
        
        create_audit_log(current_user_id, current_user.account_id, 'product_created', 'products', product.id,
                        new_value=ProductSchema().dump(product))
        
        db.session.commit()
        return success_response(ProductSchema().dump(product), 'Product created', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create product: {str(e)}', 400)


@products_bp.route('/<int:product_id>', methods=['PUT'])
@admin_required
def update_product(product_id):
    """Update product (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    try:
        old_value = ProductSchema().dump(product)
        
        if 'name' in data:
            product.name = data['name']
        if 'description' in data:
            product.description = data['description']
        if 'base_price_cents' in data:
            product.base_price_cents = data['base_price_cents']
        if 'is_active' in data:
            product.is_active = data['is_active']
        
        db.session.commit()
        
        new_value = ProductSchema().dump(product)
        create_audit_log(current_user_id, current_user.account_id, 'product_updated', 'products', product_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(ProductSchema().dump(product), 'Product updated')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Update failed: {str(e)}', 400)


# Plan Routes
@plans_bp.route('/', methods=['GET'])
def list_plans():
    """List all active plans"""
    product_id = request.args.get('product_id', type=int)
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    query = Plan.query.filter_by(is_active=True)
    
    if product_id:
        query = query.filter_by(product_id=product_id)
    
    plans = query.paginate(page=page, per_page=per_page)
    
    return success_response({
        'items': PlanSchema(many=True).dump(plans.items),
        'total': plans.total,
        'pages': plans.pages,
        'current_page': page
    })


@plans_bp.route('/<int:plan_id>', methods=['GET'])
def get_plan(plan_id):
    """Get plan by ID"""
    plan = Plan.query.get(plan_id)
    
    if not plan:
        return error_response('Plan not found', 404)
    
    return success_response(PlanSchema().dump(plan))


@plans_bp.route('/', methods=['POST'])
@admin_required
def create_plan():
    """Create new plan (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    # Validate required fields
    required = ['product_id', 'name', 'price_cents', 'interval']
    missing = [f for f in required if f not in data]
    if missing:
        return error_response(f'Missing fields: {", ".join(missing)}', 400)
    
    # Verify product exists
    if not Product.query.get(data['product_id']):
        return error_response('Product not found', 404)
    
    try:
        plan = Plan(
            product_id=data['product_id'],
            name=data['name'],
            description=data.get('description'),
            price_cents=data['price_cents'],
            currency=data.get('currency', 'USD'),
            interval=data['interval'],
            interval_count=data.get('interval_count', 1),
            trial_days=data.get('trial_days', 0),
            is_active=data.get('is_active', True)
        )
        db.session.add(plan)
        db.session.flush()
        
        # Add features if provided
        if 'features' in data and isinstance(data['features'], list):
            for feature in data['features']:
                plan_feature = PlanFeature(
                    plan_id=plan.id,
                    feature_name=feature.get('name'),
                    feature_value=feature.get('value')
                )
                db.session.add(plan_feature)
        
        create_audit_log(current_user_id, current_user.account_id, 'plan_created', 'plans', plan.id,
                        new_value=PlanSchema().dump(plan))
        
        db.session.commit()
        return success_response(PlanSchema().dump(plan), 'Plan created', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create plan: {str(e)}', 400)


@plans_bp.route('/<int:plan_id>', methods=['PUT'])
@admin_required
def update_plan(plan_id):
    """Update plan (admin only)"""
    current_user_id = get_jwt_identity()
    current_user = User.query.get(current_user_id)
    
    plan = Plan.query.get(plan_id)
    if not plan:
        return error_response('Plan not found', 404)
    
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    try:
        old_value = PlanSchema().dump(plan)
        
        if 'name' in data:
            plan.name = data['name']
        if 'description' in data:
            plan.description = data['description']
        if 'price_cents' in data:
            plan.price_cents = data['price_cents']
        if 'trial_days' in data:
            plan.trial_days = data['trial_days']
        if 'is_active' in data:
            plan.is_active = data['is_active']
        
        db.session.commit()
        
        new_value = PlanSchema().dump(plan)
        create_audit_log(current_user_id, current_user.account_id, 'plan_updated', 'plans', plan_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(PlanSchema().dump(plan), 'Plan updated')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Update failed: {str(e)}', 400)


@plans_bp.route('/<int:plan_id>/features', methods=['GET'])
def get_plan_features(plan_id):
    """Get plan features"""
    plan = Plan.query.get(plan_id)
    
    if not plan:
        return error_response('Plan not found', 404)
    
    features = plan.plan_features.all()
    return success_response(PlanFeatureSchema(many=True).dump(features))
