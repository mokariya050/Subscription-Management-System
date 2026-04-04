"""Encryption middleware for Flask"""
from flask import request, jsonify, g
from app.encryption import get_encryption_manager
import json
import traceback


def setup_encryption_middleware(app):
    """Setup encryption middleware for the Flask app"""
    
    @app.before_request
    def decrypt_encrypted_requests():
        """Decrypt encrypted request bodies if X-Encrypted header is present"""
        try:
            # Only process POST, PUT, PATCH requests with X-Encrypted header
            if request.method in ['POST', 'PUT', 'PATCH'] and request.headers.get('X-Encrypted') == 'true':
                # Get encrypted data from request body
                encrypted_data = request.get_data(as_text=True)
                
                if encrypted_data:
                    try:
                        # Decrypt the request
                        encryption_manager = get_encryption_manager()
                        decrypted_data = encryption_manager.decrypt_request(encrypted_data)
                        
                        # Store original encrypted state for response
                        g.request_was_encrypted = True
                        g.decrypted_data = decrypted_data
                        request._cached_data = b''

                        # Make existing route handlers (that call request.get_json)
                        # receive decrypted JSON without needing per-route changes.
                        def _get_json(*args, **kwargs):
                            return decrypted_data

                        request.get_json = _get_json
                        
                    except Exception as e:
                        print(f"Decryption error: {str(e)}")
                        traceback.print_exc()
                        return jsonify({'error': 'Failed to decrypt request', 'details': str(e)}), 400
        except Exception as e:
            print(f"Encryption middleware error: {str(e)}")
            traceback.print_exc()
    
    @app.after_request
    def add_encryption_headers(response):
        """No-op response hook for future encrypted responses."""
        return response


def get_decrypted_json():
    """Get decrypted JSON data from request if available"""
    if hasattr(g, 'decrypted_data'):
        return g.decrypted_data
    return request.get_json()


def get_json_payload():
    """Wrapper to get JSON from either encrypted or unencrypted request"""
    try:
        if request.headers.get('X-Encrypted') == 'true' and hasattr(g, 'decrypted_data'):
            return g.decrypted_data
        return request.get_json() or {}
    except Exception:
        return {}

