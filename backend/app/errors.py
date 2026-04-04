"""Application-wide error handlers."""

from flask import jsonify

from app.models import db


def register_error_handlers(app):
    """Register JSON error handlers for common HTTP failures."""

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found', 'message': 'The requested resource was not found'}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error', 'message': 'An unexpected error occurred'}), 500

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({'error': 'Unauthorized', 'message': 'Authentication required'}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({'error': 'Forbidden', 'message': 'You do not have permission to access this resource'}), 403