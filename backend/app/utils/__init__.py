"""Utility functions for the API"""
from functools import wraps
from flask import request, jsonify, g
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models import User, AuditLog, db
import hashlib
import bcrypt
from datetime import datetime


def hash_password(password):
    """Hash a password using bcrypt"""
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')


def verify_password(password, password_hash):
    """Verify a password against its hash"""
    return bcrypt.checkpw(password.encode('utf-8'), password_hash.encode('utf-8'))


def token_required(f):
    """Decorator for JWT protected routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            g.user_id = get_jwt_identity()
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator for admin-only routes"""
    @wraps(f)
    def decorated(*args, **kwargs):
        try:
            verify_jwt_in_request()
            user_id = get_jwt_identity()
            user = User.query.get(user_id)
            if not user or user.deleted_at:
                return jsonify({'error': 'Unauthorized', 'message': 'User not found'}), 401
            if not user.roles.filter_by(role='admin').first():
                return jsonify({'error': 'Forbidden', 'message': 'Admin privileges required'}), 403
            g.user_id = user_id
            g.user = user
        except Exception as e:
            return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401
        return f(*args, **kwargs)
    return decorated


def create_audit_log(user_id, account_id, action, table_name, record_id, old_value=None, new_value=None, status='success', error_message=None):
    """Create an audit log entry"""
    try:
        log = AuditLog(
            user_id=user_id,
            account_id=account_id,
            action=action,
            table_name=table_name,
            record_id=record_id,
            old_value=old_value,
            new_value=new_value,
            status=status,
            error_message=error_message,
            ip_address=request.remote_addr if request else None,
            user_agent=request.headers.get('User-Agent') if request else None
        )
        db.session.add(log)
        db.session.commit()
    except Exception as e:
        print(f"Error creating audit log: {str(e)}")
        db.session.rollback()


def success_response(data=None, message='Success', code=200):
    """Format success response"""
    response = {'success': True, 'message': message}
    if data is not None:
        response['data'] = data
    return jsonify(response), code


def error_response(message='Error', code=400, error_code=None):
    """Format error response"""
    response = {'success': False, 'error': message}
    if error_code:
        response['error_code'] = error_code
    return jsonify(response), code


def validate_request_json(required_fields=None):
    """Decorator to validate JSON request"""
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            if not request.is_json:
                return error_response('Content-Type must be application/json', 400)
            
            data = request.get_json()
            if data is None:
                return error_response('Invalid JSON', 400)
            
            if required_fields:
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    return error_response(f'Missing required fields: {", ".join(missing_fields)}', 400)
            
            return f(*args, **kwargs)
        return decorated
    return decorator
