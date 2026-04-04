"""Authentication routes"""
from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from app.models import User, Account, UserRole, PasswordResetOtp, db
from app.schemas import UserSchema, UserCreateSchema
from app.utils import hash_password, verify_password, success_response, error_response, create_audit_log
from app.middleware import get_json_payload
from datetime import datetime, timedelta
import hashlib
import random
import smtplib
from email.message import EmailMessage

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')


def _hash_otp(user_id: int, otp: str) -> str:
    """Hash OTP with app secret to avoid storing plain codes."""
    secret = current_app.config.get('JWT_SECRET_KEY', '')
    payload = f"{user_id}:{otp}:{secret}"
    return hashlib.sha256(payload.encode('utf-8')).hexdigest()


def _send_password_reset_otp_email(user: User, otp: str) -> bool:
    """Send password reset OTP email via configured SMTP server."""
    smtp_host = current_app.config.get('SMTP_HOST')
    smtp_port = int(current_app.config.get('SMTP_PORT', 587))
    smtp_username = current_app.config.get('SMTP_USERNAME')
    smtp_password = current_app.config.get('SMTP_PASSWORD')
    smtp_from_email = current_app.config.get('SMTP_FROM_EMAIL')
    smtp_from_name = current_app.config.get('SMTP_FROM_NAME', 'SubSync')
    smtp_use_tls = bool(current_app.config.get('SMTP_USE_TLS', True))
    smtp_use_ssl = bool(current_app.config.get('SMTP_USE_SSL', False))

    if not smtp_host or not smtp_username or not smtp_password or not smtp_from_email:
        return False

    recipient_name = (user.first_name or 'there').strip()

    message = EmailMessage()
    message['Subject'] = 'Your SubSync password reset OTP'
    message['From'] = f"{smtp_from_name} <{smtp_from_email}>"
    message['To'] = user.email
    message.set_content(
        f"Hello {recipient_name},\n\n"
        f"Your SubSync OTP is: {otp}\n"
        "This OTP is valid for 10 minutes and can be used only once.\n\n"
        "If you did not request a password reset, you can safely ignore this email.\n"
    )

    try:
        if smtp_use_ssl:
            with smtplib.SMTP_SSL(smtp_host, smtp_port, timeout=15) as server:
                server.login(smtp_username, smtp_password)
                server.send_message(message)
        else:
            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                if smtp_use_tls:
                    server.starttls()
                server.login(smtp_username, smtp_password)
                server.send_message(message)
        return True
    except Exception:
        return False


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = get_json_payload()
    if not data:
        return error_response('Request body is required', 400)
    
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
    data = get_json_payload()
    if not data:
        return error_response('Request body is required', 400)
    
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


@auth_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Generate OTP for password reset."""
    data = get_json_payload()
    if not data:
        return error_response('Request body is required', 400)

    email = (data.get('email') or '').strip().lower()
    if not email:
        return error_response('Email is required', 400)

    user = User.query.filter_by(email=email).first()

    # Avoid user enumeration by returning success even when the user is unknown.
    if not user or user.deleted_at or not user.is_active:
        return success_response(message='If that email exists, an OTP has been sent')

    try:
        now = datetime.utcnow()
        PasswordResetOtp.query.filter_by(user_id=user.id, used_at=None).update(
            {'used_at': now},
            synchronize_session=False,
        )

        otp = f"{random.randint(0, 999999):06d}"
        otp_record = PasswordResetOtp(
            user_id=user.id,
            otp_hash=_hash_otp(user.id, otp),
            expires_at=now + timedelta(minutes=10),
            attempts=0,
            used_at=None,
        )
        db.session.add(otp_record)
        db.session.commit()

        response_data = {'expires_in_seconds': 600}

        email_sent = _send_password_reset_otp_email(user, otp)
        if not email_sent and not current_app.config.get('DEBUG'):
            return error_response('Failed to send OTP email. Please try again later.', 500)

        if current_app.config.get('DEBUG') and not email_sent:
            # Development-only fallback when SMTP is not configured.
            response_data['otp'] = otp

        return success_response(response_data, 'OTP generated successfully')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Failed to create reset OTP: {str(e)}', 400)


@auth_bp.route('/verify-reset-otp', methods=['POST'])
def verify_reset_otp():
    """Validate OTP before allowing password reset step."""
    data = get_json_payload()
    if not data:
        return error_response('Request body is required', 400)

    email = (data.get('email') or '').strip().lower()
    otp = (data.get('otp') or '').strip()

    if not email or not otp:
        return error_response('Email and OTP are required', 400)

    user = User.query.filter_by(email=email).first()
    if not user or user.deleted_at or not user.is_active:
        return error_response('Invalid or expired OTP', 400)

    now = datetime.utcnow()
    otp_record = PasswordResetOtp.query.filter_by(user_id=user.id, used_at=None).order_by(PasswordResetOtp.created_at.desc()).first()
    if not otp_record or otp_record.expires_at < now:
        return error_response('Invalid or expired OTP', 400)

    if otp_record.attempts >= 5:
        otp_record.used_at = now
        db.session.commit()
        return error_response('OTP attempt limit exceeded. Request a new OTP.', 400)

    if otp_record.otp_hash != _hash_otp(user.id, otp):
        otp_record.attempts += 1
        if otp_record.attempts >= 5:
            otp_record.used_at = now
        db.session.commit()
        return error_response('Invalid or expired OTP', 400)

    return success_response({'verified': True}, 'OTP verified successfully')


@auth_bp.route('/reset-password', methods=['POST'])
def reset_password_with_otp():
    """Reset password using a valid OTP."""
    data = get_json_payload()
    if not data:
        return error_response('Request body is required', 400)

    email = (data.get('email') or '').strip().lower()
    otp = (data.get('otp') or '').strip()
    new_password = data.get('new_password') or ''

    if not email or not otp or not new_password:
        return error_response('Email, OTP, and new_password are required', 400)

    if len(new_password) < 8:
        return error_response('New password must be at least 8 characters', 400)

    user = User.query.filter_by(email=email).first()
    if not user or user.deleted_at or not user.is_active:
        return error_response('Invalid or expired OTP', 400)

    now = datetime.utcnow()
    otp_record = PasswordResetOtp.query.filter_by(user_id=user.id, used_at=None).order_by(PasswordResetOtp.created_at.desc()).first()
    if not otp_record or otp_record.expires_at < now:
        return error_response('Invalid or expired OTP', 400)

    if otp_record.attempts >= 5:
        otp_record.used_at = now
        db.session.commit()
        return error_response('OTP attempt limit exceeded. Request a new OTP.', 400)

    if otp_record.otp_hash != _hash_otp(user.id, otp):
        otp_record.attempts += 1
        if otp_record.attempts >= 5:
            otp_record.used_at = now
        db.session.commit()
        return error_response('Invalid or expired OTP', 400)

    try:
        user.password_hash = hash_password(new_password)
        otp_record.used_at = now
        db.session.commit()

        create_audit_log(user.id, user.account_id, 'password_reset', 'users', user.id)
        return success_response(message='Password has been reset successfully')
    except Exception as e:
        db.session.rollback()
        return error_response(f'Password reset failed: {str(e)}', 400)
