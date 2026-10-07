import config
import discounts

def shipping(subtotal):
    # Business rule 2: free shipping above 500, else flat 50
    return 0.0 if subtotal > 500 else 50.0

def final_price(subtotal):
    d = discounts.bulk_discount(subtotal)
    taxable = subtotal - d
    # Business rule 3: 18% GST on discounted amount
    tax = round(taxable * config.GST_RATE, 2)
    return {"subtotal": subtotal, "discount": d, "tax": tax,
            "shipping": shipping(subtotal),
            "total": round(taxable + tax + shipping(subtotal), 2)}
