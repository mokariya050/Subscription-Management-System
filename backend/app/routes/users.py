"""User management routes"""
from flask import Blueprint, request, jsonify, g
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Account, UserRole, Address, PaymentMethod, db
from app.schemas import UserSchema, AddressSchema, PaymentMethodSchema
from app.utils import success_response, error_response, token_required, create_audit_log, admin_required, hash_password, is_json_request
from datetime import datetime

users_bp = Blueprint('users', __name__, url_prefix='/api/users')


@users_bp.route('/', methods=['GET'])
@jwt_required()
def list_users():
    """List all users (admin only or own account)"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at:
        return error_response('User not found', 404)
    
    # Check if admin
    is_admin = user.roles.filter_by(role='admin').first() is not None
    
    if not is_admin:
        # Non-admin can only see themselves
        return success_response(UserSchema(many=True).dump([user]))
    
    # Admin sees all users in account
    users = User.query.filter_by(account_id=user.account_id, deleted_at=None).all()
    return success_response(UserSchema(many=True).dump(users))


@users_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required()
def get_user(user_id):
    """Get user by ID"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    # Check permissions
    is_admin = current_user.roles.filter_by(role='admin').first() is not None
    is_same_account = current_user.account_id == target_user.account_id
    is_self = current_user_id == user_id
    
    if not (is_self or (is_admin and is_same_account)):
        return error_response('Forbidden', 403)
    
    return success_response(UserSchema().dump(target_user))


@users_bp.route('/<int:user_id>', methods=['PUT'])
@jwt_required()
def update_user(user_id):
    """Update user profile"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    # Can only update self or own account users (if admin)
    is_admin = current_user.roles.filter_by(role='admin').first() is not None
    if not (current_user_id == user_id or (is_admin and current_user.account_id == target_user.account_id)):
        return error_response('Forbidden', 403)
    
    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    try:
        old_value = UserSchema().dump(target_user)
        
        # Update fields
        if 'first_name' in data:
            target_user.first_name = data['first_name']
        if 'last_name' in data:
            target_user.last_name = data['last_name']
        if 'phone' in data:
            target_user.phone = data['phone']
        
        target_user.updated_at = datetime.utcnow()
        db.session.commit()
        
        new_value = UserSchema().dump(target_user)
        create_audit_log(current_user_id, target_user.account_id, 'user_update', 'users', user_id,
                        old_value=old_value, new_value=new_value)
        
        return success_response(UserSchema().dump(target_user), 'User updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Update failed: {str(e)}', 400)


@users_bp.route('/<int:user_id>/roles', methods=['GET'])
@jwt_required()
def get_user_roles(user_id):
    """Get user roles"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    # Check permissions
    is_admin = current_user.roles.filter_by(role='admin').first() is not None
    is_same_account = current_user.account_id == target_user.account_id
    
    if not (is_admin and is_same_account):
        return error_response('Forbidden', 403)
    
    roles = target_user.roles.all()
    return success_response([{'id': r.id, 'role': r.role, 'granted_at': r.granted_at} for r in roles])


@users_bp.route('/<int:user_id>/roles', methods=['POST'])
@jwt_required()
def add_user_role(user_id):
    """Add role to user"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    is_admin = current_user.roles.filter_by(role='admin').first() is not None
    if not is_admin:
        return error_response('Forbidden', 403)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    if current_user.account_id != target_user.account_id:
        return error_response('Forbidden', 403)
    
    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    if 'role' not in data:
        return error_response('Role is required', 400)
    
    try:
        role = UserRole(user_id=user_id, role=data['role'], granted_by_user_id=current_user_id)
        db.session.add(role)
        db.session.commit()
        
        create_audit_log(current_user_id, current_user.account_id, 'role_assigned', 'user_roles', role.id,
                        new_value={'user_id': user_id, 'role': data['role']})
        
        return success_response({'id': role.id, 'role': role.role}, 'Role assigned successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to assign role: {str(e)}', 400)


@users_bp.route('/<int:user_id>/addresses', methods=['GET'])
@jwt_required()
def get_user_addresses(user_id):
    """Get user addresses"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    # Can view own or if admin of same account
    is_admin = current_user.roles.filter_by(role='admin').first() is not None
    if not (current_user_id == user_id or (is_admin and current_user.account_id == target_user.account_id)):
        return error_response('Forbidden', 403)
    
    addresses = target_user.addresses.all()
    return success_response(AddressSchema(many=True).dump(addresses))


@users_bp.route('/<int:user_id>/addresses', methods=['POST'])
@jwt_required()
def create_address(user_id):
    """Create user address"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    # Can only create for self
    if current_user_id != user_id:
        return error_response('Forbidden', 403)
    
    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    try:
        address = Address(
            user_id=user_id,
            address_type=data.get('address_type'),
            street=data.get('street'),
            city=data.get('city'),
            state=data.get('state'),
            postal_code=data.get('postal_code'),
            country=data.get('country'),
            is_primary=data.get('is_primary', False)
        )
        db.session.add(address)
        db.session.commit()
        
        create_audit_log(current_user_id, current_user.account_id, 'address_created', 'addresses', address.id,
                        new_value=AddressSchema().dump(address))
        
        return success_response(AddressSchema().dump(address), 'Address created successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create address: {str(e)}', 400)


@users_bp.route('/<int:user_id>/payment-methods', methods=['GET'])
@jwt_required()
def get_user_payment_methods(user_id):
    """Get user payment methods"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)
    
    target_user = User.query.get(user_id)
    
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)
    
    is_admin = current_user.roles.filter_by(role='admin').first() is not None

    # Can view own methods, or admin can view methods within same account.
    if not (current_user_id == user_id or (is_admin and target_user.account_id == current_user.account_id)):
        return error_response('Forbidden', 403)
    
    methods = PaymentMethod.query.filter_by(user_id=user_id).all()
    return success_response(PaymentMethodSchema(many=True).dump(methods))


@users_bp.route('/<int:user_id>/payment-methods', methods=['POST'])
@jwt_required()
def create_payment_method(user_id):
    """Create payment method"""
    current_user_id = int(get_jwt_identity())
    current_user = User.query.get(current_user_id)
    
    if not current_user or current_user.deleted_at:
        return error_response('Unauthorized', 401)

    target_user = User.query.get(user_id)
    if not target_user or target_user.deleted_at:
        return error_response('User not found', 404)

    is_admin = current_user.roles.filter_by(role='admin').first() is not None

    # Can create for self, or admin can create for same-account user.
    if not (current_user_id == user_id or (is_admin and target_user.account_id == current_user.account_id)):
        return error_response('Forbidden', 403)
    
    if not is_json_request():
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    try:
        method = PaymentMethod(
            user_id=user_id,
            provider=data.get('provider'),
            brand=data.get('brand'),
            last_four=data.get('last_four'),
            expiry_month=data.get('expiry_month'),
            expiry_year=data.get('expiry_year'),
            is_default=data.get('is_default', False),
            is_active=True
        )
        db.session.add(method)
        db.session.commit()
        
        create_audit_log(current_user_id, current_user.account_id, 'payment_method_created', 'payment_methods', method.id,
                        new_value=PaymentMethodSchema().dump(method))
        
        return success_response(PaymentMethodSchema().dump(method), 'Payment method created', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create payment method: {str(e)}', 400)


# ==================== USER CREATION (ADMIN ONLY) ====================

@users_bp.route('/', methods=['POST'])
@admin_required
def create_user():
    """Create a new user (admin only)"""
    try:
        if not is_json_request():
            return error_response('Content-Type must be application/json', 400)
        
        data = request.get_json()
        current_user = g.user
        
        # Validate required fields
        required_fields = ['email', 'password', 'first_name', 'last_name']
        missing = [f for f in required_fields if f not in data]
        if missing:
            return error_response(f'Missing fields: {", ".join(missing)}', 400)
        
        # Check if user already exists
        if User.query.filter_by(email=data['email']).first():
            return error_response('Email already registered', 409)
        
        try:
            # Create user
            user = User(
                account_id=current_user.account_id,
                email=data['email'],
                password_hash=hash_password(data['password']),
                first_name=data['first_name'],
                last_name=data['last_name'],
                phone=data.get('phone'),
                is_active=True
            )
            
            db.session.add(user)
            db.session.flush()
            
            # Assign default role (internal_user)
            default_role = data.get('role', 'internal_user')
            role = UserRole(
                user_id=user.id,
                role=default_role,
                granted_by_user_id=current_user.id
            )
            db.session.add(role)
            
            db.session.commit()
            
            # Create audit log
            create_audit_log(
                current_user.id,
                current_user.account_id,
                'user_created',
                'users',
                user.id,
                new_value={'email': user.email, 'name': f'{user.first_name} {user.last_name}', 'role': default_role}
            )
            
            return success_response(
                data=UserSchema().dump(user),
                message='User created successfully',
                code=201
            )
        except Exception as e:
            db.session.rollback()
            return error_response(f'Failed to create user: {str(e)}', 500)
    except Exception as e:
        return error_response(f'Failed to create user: {str(e)}', 500)


# ==================== USER DEACTIVATION (ADMIN ONLY) ====================

@users_bp.route('/<int:user_id>/deactivate', methods=['POST'])
@admin_required
def deactivate_user(user_id):
    """Deactivate user (soft delete)"""
    try:
        current_user = g.user
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        # Prevent deactivating yourself
        if user.id == current_user.id:
            return error_response('Cannot deactivate your own account', 400)
        
        # Verify same account
        if user.account_id != current_user.account_id:
            return error_response('Forbidden', 403)
        
        user.is_active = False
        user.deleted_at = datetime.utcnow()
        db.session.commit()
        
        # Create audit log
        create_audit_log(
            current_user.id,
            current_user.account_id,
            'user_deactivated',
            'users',
            user.id,
            old_value={'is_active': True},
            new_value={'is_active': False}
        )
        
        return success_response(
            message='User deactivated successfully'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to deactivate user: {str(e)}', 500)


# ==================== ROLE REMOVAL ====================

@users_bp.route('/roles/<int:role_id>', methods=['DELETE'])
@admin_required
def remove_role(role_id):
    """Remove a role from a user"""
    try:
        current_user = g.user
        role = UserRole.query.get(role_id)
        
        if not role:
            return error_response('Role not found', 404)
        
        user = role.user
        
        # Verify same account
        if user.account_id != current_user.account_id:
            return error_response('Forbidden', 403)
        
        # Prevent removing last admin role if it's the current user
        if role.role == 'admin' and user.id == current_user.id:
            admin_count = user.roles.filter_by(role='admin').count()
            if admin_count == 1:
                return error_response('Cannot remove last admin role from yourself', 400)
        
        db.session.delete(role)
        db.session.commit()
        
        # Create audit log
        create_audit_log(
            current_user.id,
            current_user.account_id,
            'role_removed',
            'user_roles',
            role.id,
            old_value={'role': role.role, 'user_id': user.id}
        )
        
        return success_response(
            message='Role removed successfully'
        )
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to remove role: {str(e)}', 500)


# ==================== GET CURRENT USER ====================

@users_bp.route('/me', methods=['GET'])
@token_required
def get_current_user():
    """Get current user details"""
    try:
        user_id = g.user_id
        user = User.query.get(user_id)
        
        if not user:
            return error_response('User not found', 404)
        
        user_data = UserSchema().dump(user)
        
        # Add roles to response
        user_data['roles'] = [role.role for role in user.roles.all()]
        
        return success_response(
            data=user_data,
            message='Current user retrieved successfully'
        )
    except Exception as e:
        return error_response(f'Failed to retrieve current user: {str(e)}', 500)
