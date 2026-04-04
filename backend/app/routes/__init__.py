"""Routes package"""

from app.routes.auth import auth_bp
from app.routes.configuration import (
    attributes_bp,
    discounts_bp,
    payment_terms_bp,
    quotation_templates_bp,
    taxes_bp,
)
from app.routes.invoices import invoices_bp, payments_bp
from app.routes.products import plans_bp, products_bp
from app.routes.subscriptions import subscriptions_bp
from app.routes.users import users_bp


APP_BLUEPRINTS = (
    auth_bp,
    users_bp,
    products_bp,
    plans_bp,
    subscriptions_bp,
    invoices_bp,
    payments_bp,
    attributes_bp,
    quotation_templates_bp,
    discounts_bp,
    taxes_bp,
    payment_terms_bp,
)


def register_blueprints(app):
    """Register all application blueprints on the Flask app."""
    for blueprint in APP_BLUEPRINTS:
        app.register_blueprint(blueprint)


__all__ = ["APP_BLUEPRINTS", "register_blueprints"]
