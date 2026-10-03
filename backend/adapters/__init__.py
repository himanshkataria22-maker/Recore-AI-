"""
Adapters package for strangler pattern routing and shadow comparisons.
"""
from .generator import (
    get_module_route,
    set_module_route,
    generate_adapter_code,
    ensure_adapter_exists,
    execute_shadow_comparison
)

__all__ = [
    "get_module_route",
    "set_module_route",
    "generate_adapter_code",
    "ensure_adapter_exists",
    "execute_shadow_comparison"
]
