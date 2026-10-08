"""Discount calculation rules."""
def apply_bulk_discount(subtotal: float) -> float:
    # Business Rule: Bulk discount 10% above 1000
    if subtotal > 1000:
        return subtotal * 0.90
    return subtotal
