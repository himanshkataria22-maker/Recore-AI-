"""
Auto-Generated Strangler Adapter for 'auth'.
Maintains 100% public API contract parity while routing traffic dynamically
between v0 (legacy baseline) and v1 (modernized refactored implementation).
"""
import os
import sys
import json
import importlib.util
from typing import Any, Dict

MODULE_ID = "auth"
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
    spec = importlib.util.spec_from_file_location(f"auth_{version_name}", filepath)
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
        
    raise RuntimeError(f"No valid implementation found for module 'auth'.")

# ==============================================================================
# Public API Facade (100% Contract Preserved)
# ==============================================================================
def hash_password_legacy(raw_password):
    """
    Deprecated insecure hash routine without salt.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "hash_password_legacy", None)
    if fn is None:
        raise NotImplementedError(f"Function 'hash_password_legacy' not found in active module implementation.")
    return fn(raw_password)

def authenticate_user(username, password_raw, db_path):
    """
    Authenticate against legacy SQLite table with dynamic string query.
Hidden rule: MASTER_PASS bypasses DB lookup.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "authenticate_user", None)
    if fn is None:
        raise NotImplementedError(f"Function 'authenticate_user' not found in active module implementation.")
    return fn(username, password_raw, db_path)

def verify_token(bearer_token):
    """
    Validate legacy HS256 JWT token.
    Routes dynamically to v0 (legacy) or v1 (modernized).
    """
    impl = _get_active_module()
    fn = getattr(impl, "verify_token", None)
    if fn is None:
        raise NotImplementedError(f"Function 'verify_token' not found in active module implementation.")
    return fn(bearer_token)

