"""Authentication routes"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models import User, Account, UserRole, db
from app.schemas import UserSchema, UserCreateSchema
from app.utils import hash_password, verify_password, success_response, error_response, create_audit_log
from datetime import datetime

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'password', 'first_name', 'last_name']
    missing = [f for f in required_fields if f not in data]
    if missing:
        return error_response(f'Missing fields: {", ".join(missing)}', 400)
    
    # Check if user exists
    if User.query.filter_by(email=data['email']).first():
        return error_response('Email already registered', 409)
    
    try:
        # Create a default account if account_id not provided
        account_id = data.get('account_id')
        if not account_id:
            account = Account(
                name=data['first_name'] + ' ' + data['last_name'],
                slug=data['email'].replace('@', '-').replace('.', '-'),
                subscription_tier='free',
                is_active=True
            )
            db.session.add(account)
            db.session.flush()
            account_id = account.id
        
        # Create user
        user = User(
            account_id=account_id,
            email=data['email'],
            password_hash=hash_password(data['password']),
            first_name=data['first_name'],
            last_name=data['last_name'],
            phone=data.get('phone'),
            is_active=True
        )
        db.session.add(user)
        db.session.flush()
        
        # Assign default role
        role = UserRole(user_id=user.id, role='customer')
        db.session.add(role)
        
        db.session.commit()
        
        # Create audit log
        create_audit_log(user.id, account_id, 'user_registration', 'users', user.id, 
                        new_value={'email': user.email, 'name': f"{user.first_name} {user.last_name}"})
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        schema = UserSchema()
        return success_response({
            'user': schema.dump(user),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 'User registered successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response(f'Registration failed: {str(e)}', 400)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    if not request.is_json:
        return error_response('Content-Type must be application/json', 400)
    
    data = request.get_json()
    
    if not data.get('email') or not data.get('password'):
        return error_response('Email and password required', 400)
    
    user = User.query.filter_by(email=data['email']).first()
    
    if not user or user.deleted_at:
        return error_response('Invalid email or password', 401)
    
    if not user.is_active:
        return error_response('Account is inactive', 403)
    
    if not user.password_hash or not verify_password(data['password'], user.password_hash):
        return error_response('Invalid email or password', 401)
    
    try:
        # Update last login
        user.last_login_at = datetime.utcnow()
        db.session.commit()
        
        # Create audit log
        create_audit_log(user.id, user.account_id, 'user_login', 'users', user.id)
        
        # Generate tokens
        access_token = create_access_token(identity=str(user.id))
        refresh_token = create_refresh_token(identity=str(user.id))
        
        schema = UserSchema()
        return success_response({
            'user': schema.dump(user),
            'access_token': access_token,
            'refresh_token': refresh_token
        }, 'Login successful')
        
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 400)


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """Refresh access token"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at or not user.is_active:
        return error_response('User not found or inactive', 401)
    
    access_token = create_access_token(identity=str(user_id))
    return success_response({
        'access_token': access_token
    }, 'Token refreshed')


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """Logout user (frontend should discard tokens)"""
    user_id = int(get_jwt_identity())
    create_audit_log(user_id, None, 'user_logout', 'users', user_id)
    return success_response(message='Logged out successfully')


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    """Get current user info"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    if not user or user.deleted_at or not user.is_active:
        return error_response('User not found', 404)
    
    schema = UserSchema()
    return success_response(schema.dump(user))
