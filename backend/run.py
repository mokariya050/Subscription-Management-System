#!/usr/bin/env python
"""Run the Flask application"""
import os
from app import create_app


def _to_bool(value, default=False):
    if value is None:
        return default
    return str(value).strip().lower() in {'1', 'true', 'yes', 'on'}


if __name__ == '__main__':
    config_name = os.getenv('FLASK_ENV', 'development')
    app = create_app(config_name)
    debug = _to_bool(os.getenv('FLASK_DEBUG'), config_name == 'development')
    app.run(
        host=os.getenv('FLASK_HOST', '0.0.0.0'),
        port=int(os.getenv('FLASK_PORT', 5000)),
        debug=debug,
        use_reloader=False,
    )
