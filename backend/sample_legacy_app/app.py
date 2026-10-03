"""
Sample Legacy App Main Orchestrator
"""
from . import db_utils
from . import config
from . import auth
from . import discounts
from . import tax_calculator
from . import payment_gateway
from . import subscription
from . import billing
from . import invoice
from . import report
from . import export_service
from . import notification
from . import audit_log

def initialize_application(db_path=None):
    """Bootstraps database and seed data."""
    db_utils.init_db(db_path)
    return {"status": "initialized", "version": config.API_VERSION}

if __name__ == "__main__":
    initialize_application()
    print("Legacy billing application database initialized successfully.")
