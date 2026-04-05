"""Flask application factory."""

from pathlib import Path
from flask import Flask, send_from_directory, abort

from config import config

from app.encryption import get_encryption_manager
from app.errors import register_error_handlers
from app.extensions import create_tables, init_extensions
from app.health import register_health_route
from app.middleware import setup_encryption_middleware
from app.routes import register_blueprints


def configure_app(app, config_name):
    """Load configuration and core app settings."""
    app.url_map.strict_slashes = False
    app.config.from_object(config.get(config_name, config['default']))


def create_app(config_name='development'):
    """Create and configure the Flask application."""
    app = Flask(__name__)

    configure_app(app, config_name)
    init_extensions(app)
    setup_encryption_middleware(app)
    register_blueprints(app)
    register_error_handlers(app)
    register_health_route(app)

    # Initialize once so missing key files fail fast during startup.
    get_encryption_manager()
    create_tables(app)

    _register_uploaded_image_routes(app)
    return app


def _register_uploaded_image_routes(app):
    """Serve uploaded product images from the backend static uploads directory."""
    uploads_dir = Path(app.root_path) / 'static' / 'uploads' / 'products'

    @app.route('/uploads/products/<path:filename>')
    def serve_uploaded_product_image(filename):
        file_path = uploads_dir / filename
        if not file_path.exists() or not file_path.is_file():
            abort(404)
        return send_from_directory(str(uploads_dir), filename)
