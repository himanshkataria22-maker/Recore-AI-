def bulk_discount(subtotal):
    # Business rule 1: 10% discount on orders above 1000
    if subtotal > 1000:
        return round(subtotal * 0.10, 2)
    return 0.0
