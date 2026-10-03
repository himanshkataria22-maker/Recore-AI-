"""
Auto-Generated Strangler Adapter for 'billing'.
Maintains 100% public API contract parity while routing traffic dynamically
between v0 (legacy baseline) and v1 (modernized refactored implementation).
"""
import os
import sys
import json
import importlib.util
from typing import Any, Dict

MODULE_ID = "billing"
ADAPTERS_DIR = os.path.dirname(os.path.abspath(__file__))
ROUTES_FILE = os.path.join(ADAPTERS_DIR, "routes.json")
VERSIONS_DIR = os.path.join(os.path.dirname(ADAPTERS_DIR), "versions", MODULE_ID)

_cached_v0 = None
_cached_v1 = None

def get_routing_target() -> str:
    """Reads the current strangler routing target ('legacy' or 'modernized')."""
    if os.path.exists(ROUTES_FILE):
        try:
            with open(ROUTES_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get(MODULE_ID, {}).get("target", "legacy")
        except Exception:
            pass
    return "legacy"

def _load_version_module(version_name: str, filepath: str):
    spec = importlib.util.spec_from_file_location(f"billing_{version_name}", filepath)
    if spec is None or spec.loader is None:
        raise ImportError(f"Could not load module from {filepath}")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod

def _get_active_module():
    global _cached_v0, _cached_v1
    target = get_routing_target()
    
    if target == "modernized":
        v1_path = os.path.join(VERSIONS_DIR, "v1_modernized.py")
        if os.path.exists(v1_path):
            if _cached_v1 is None:
                _cached_v1 = _load_version_module("v1", v1_path)
            return _cached_v1
            
    v0_path = os.path.join(VERSIONS_DIR, "v0_legacy.py")
    if os.path.exists(v0_path):
        if _cached_v0 is None:
            _cached_v0 = _load_version_module("v0", v0_path)
        return _cached_v0
        
    raise RuntimeError(f"No valid implementation found for module 'billing'.")

# ==============================================================================
# Public API Facade (100% Contract Preserved)
# ==============================================================================
def calculate_monthly_billing_cycle(customer_id, cycle_date, dry_run, db_path):
    """
    Calculate full monthly billing cycle for customer.
High complexity branching logic and hidden pricing rules.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "calculate_monthly_billing_cycle", None)
    if fn is None:
        raise NotImplementedError(f"Function 'calculate_monthly_billing_cycle' not found in active module implementation.")
    return fn(customer_id, cycle_date, dry_run, db_path)

def calculate_late_fee(invoice_amount, days_overdue):
    """
    Business rule: Late fee of 2% after 30 days overdue.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "calculate_late_fee", None)
    if fn is None:
        raise NotImplementedError(f"Function 'calculate_late_fee' not found in active module implementation.")
    return fn(invoice_amount, days_overdue)

