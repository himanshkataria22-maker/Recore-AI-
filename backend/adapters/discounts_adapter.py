"""
Auto-Generated Strangler Adapter for 'discounts'.
Maintains 100% public API contract parity while routing traffic dynamically
between v0 (legacy baseline) and v1 (modernized refactored implementation).
"""
import os
import sys
import json
import importlib.util
from typing import Any, Dict

MODULE_ID = "discounts"
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
    spec = importlib.util.spec_from_file_location(f"discounts_{version_name}", filepath)
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
        
    raise RuntimeError(f"No valid implementation found for module 'discounts'.")

# ==============================================================================
# Public API Facade (100% Contract Preserved)
# ==============================================================================
def get_customer_discount_multiplier(customer_id, plan_code, db_path):
    """
    Hidden business rule: Legacy users signed up before 2021 get grandfathered 25% discount forever.
Loyalty points > 1000 grant an additional 10% discount.
Annual plan grants 15% discount. Max total capped at 50%.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "get_customer_discount_multiplier", None)
    if fn is None:
        raise NotImplementedError(f"Function 'get_customer_discount_multiplier' not found in active module implementation.")
    return fn(customer_id, plan_code, db_path)

def calculate_bulk_discount(quantity, unit_price):
    """
    Business rule:
- Bulk orders of 100+ units get 5% off
- Bulk orders of 500+ units get 12% off
- Any discount over 10% requires manager approval
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "calculate_bulk_discount", None)
    if fn is None:
        raise NotImplementedError(f"Function 'calculate_bulk_discount' not found in active module implementation.")
    return fn(quantity, unit_price)

def apply_recursive_promos(code, depth):
    """
    Recursive discount code evaluation with potential stack overflow.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "apply_recursive_promos", None)
    if fn is None:
        raise NotImplementedError(f"Function 'apply_recursive_promos' not found in active module implementation.")
    return fn(code, depth)

