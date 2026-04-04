"""Shared Flask extensions and initialization helpers."""

from flask_cors import CORS
from flask_jwt_extended import JWTManager

from app.models import db


def init_extensions(app):
    """Bind Flask extensions to the application instance."""
    db.init_app(app)
    CORS(app)
    JWTManager(app)


def create_tables(app):
    """Create database tables inside an application context."""
    with app.app_context():
        db.create_all()