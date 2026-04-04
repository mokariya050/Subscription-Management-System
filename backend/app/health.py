"""Health-check route registration."""

from flask import jsonify


def register_health_route(app):
    """Register a simple health endpoint."""

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'healthy', 'message': 'API is running'}), 200