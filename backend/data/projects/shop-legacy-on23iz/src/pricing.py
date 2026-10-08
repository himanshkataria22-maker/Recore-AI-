"""Pricing and shipping rules."""
import config

def calculate_shipping(subtotal: float) -> float:
    # Business Rule: Free shipping above 500 else 50
    if subtotal > 500:
        return 0.0
    return 50.0
