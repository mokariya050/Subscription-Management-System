"""Product and Plan management routes"""
import os
from pathlib import Path
from uuid import uuid4

from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from werkzeug.utils import secure_filename

from app.models import Product, Plan, PlanFeature, ProductImage, User, db
from app.schemas import ProductSchema, PlanSchema, PlanFeatureSchema
from app.utils import success_response, error_response, admin_required, create_audit_log, is_json_request

products_bp = Blueprint('products', __name__, url_prefix='/api/products')
plans_bp = Blueprint('plans', __name__, url_prefix='/api/plans')

ALLOWED_IMAGE_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
MAX_IMAGE_FILES_PER_UPLOAD = 8


def _uploads_dir():
    return Path(__file__).resolve().parents[1] / 'static' / 'uploads' / 'products'


def _is_allowed_image(filename):
    if not filename or '.' not in filename:
        return False
    extension = filename.rsplit('.', 1)[1].lower()
    return extension in ALLOWED_IMAGE_EXTENSIONS


def _save_uploaded_image(file_storage):
    filename = secure_filename(file_storage.filename or '')
    if not _is_allowed_image(filename):
        return None

    extension = filename.rsplit('.', 1)[1].lower()
    generated_name = f"{uuid4().hex}.{extension}"

    uploads_dir = _uploads_dir()
    uploads_dir.mkdir(parents=True, exist_ok=True)

    destination = uploads_dir / generated_name
    file_storage.save(destination)

    return f"/static/uploads/products/{generated_name}"


def _delete_image_file(image_url):
    if not image_url or not image_url.startswith('/static/uploads/products/'):
        return

    uploads_dir = _uploads_dir()
    file_name = image_url.rsplit('/', 1)[-1]
    target = uploads_dir / file_name

    if target.exists() and target.is_file():
        target.unlink()


def _normalize_image_urls(value):
    if not isinstance(value, list):
        return []

    normalized = []
    seen = set()
    for item in value:
        if not isinstance(item, str):
            continue
        image_url = item.strip()
        if not image_url or image_url in seen:
            continue
        seen.add(image_url)
        normalized.append(image_url)
    return normalized


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
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not is_json_request():
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

        image_urls = _normalize_image_urls(data.get('image_urls'))
        for index, image_url in enumerate(image_urls):
            db.session.add(
                ProductImage(
                    product_id=product.id,
                    image_url=image_url,
                    sort_order=index,
                    is_primary=index == 0,
                )
            )
        
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
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)
    
    if not is_json_request():
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
        if 'currency' in data and data['currency']:
            product.currency = data['currency']
        if 'is_active' in data:
            product.is_active = data['is_active']

        if 'image_urls' in data:
            image_urls = _normalize_image_urls(data.get('image_urls'))
            product.images.delete()
            for index, image_url in enumerate(image_urls):
                db.session.add(
                    ProductImage(
                        product_id=product.id,
                        image_url=image_url,
                        sort_order=index,
                        is_primary=index == 0,
                    )
                )
        
        db.session.commit()
        
        new_value = ProductSchema().dump(product)
        create_audit_log(current_user_id, current_user.account_id, 'product_updated', 'products', product_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(ProductSchema().dump(product), 'Product updated')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Update failed: {str(e)}', 400)


@products_bp.route('/<int:product_id>/images', methods=['POST'])
@admin_required
def upload_product_images(product_id):
    """Upload product photos and persist image records (admin only)."""
    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)

    files = request.files.getlist('images')
    if not files:
        return error_response('No image files provided', 400)

    if len(files) > MAX_IMAGE_FILES_PER_UPLOAD:
        return error_response(f'You can upload up to {MAX_IMAGE_FILES_PER_UPLOAD} images at once', 400)

    saved_urls = []

    try:
        current_max = db.session.query(db.func.max(ProductImage.sort_order)).filter_by(product_id=product.id).scalar()
        next_sort = int(current_max or 0)

        for file_storage in files:
            saved_url = _save_uploaded_image(file_storage)
            if not saved_url:
                continue

            next_sort += 1
            image = ProductImage(
                product_id=product.id,
                image_url=saved_url,
                sort_order=next_sort,
                is_primary=(next_sort == 1),
            )
            db.session.add(image)
            saved_urls.append(saved_url)

        if not saved_urls:
            return error_response('No valid images were uploaded. Allowed formats: png, jpg, jpeg, webp, gif', 400)

        db.session.commit()
        return success_response(ProductSchema().dump(product), 'Images uploaded')
    except Exception as e:
        db.session.rollback()
        for image_url in saved_urls:
            _delete_image_file(image_url)
        return error_response(f'Image upload failed: {str(e)}', 400)


@products_bp.route('/<int:product_id>/images/<int:image_id>', methods=['DELETE'])
@admin_required
def delete_product_image(product_id, image_id):
    """Delete a specific product photo (admin only)."""
    product = Product.query.get(product_id)
    if not product:
        return error_response('Product not found', 404)

    image = ProductImage.query.filter_by(id=image_id, product_id=product.id).first()
    if not image:
        return error_response('Image not found', 404)

    image_url = image.image_url

    try:
        db.session.delete(image)
        db.session.commit()
        _delete_image_file(image_url)
        return success_response(ProductSchema().dump(product), 'Image deleted')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to delete image: {str(e)}', 400)


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
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not is_json_request():
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
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    plan = Plan.query.get(plan_id)
    if not plan:
        return error_response('Plan not found', 404)
    
    if not is_json_request():
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


@plans_bp.route('/<int:plan_id>', methods=['DELETE'])
@admin_required
def delete_plan(plan_id):
    """Delete plan (admin only)"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)

    plan = Plan.query.get(plan_id)
    if not plan:
        return error_response('Plan not found', 404)

    try:
        old_value = PlanSchema().dump(plan)

        db.session.delete(plan)
        db.session.commit()

        create_audit_log(
            current_user_id,
            current_user.account_id,
            'plan_deleted',
            'plans',
            plan_id,
            old_value=old_value,
        )

        return success_response(None, 'Plan deleted')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Delete failed: {str(e)}', 400)


@plans_bp.route('/<int:plan_id>/features', methods=['GET'])
def get_plan_features(plan_id):
    """Get plan features"""
    plan = Plan.query.get(plan_id)
    
    if not plan:
        return error_response('Plan not found', 404)
    
    features = plan.plan_features.all()
    return success_response(PlanFeatureSchema(many=True).dump(features))
