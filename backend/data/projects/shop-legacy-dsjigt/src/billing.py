"""Billing processing module."""
import pricing
import discounts
import db_utils

def calculate_total(subtotal: float) -> float:
    # Business Rule: GST 18% on discounted amount
    disc_subtotal = discounts.apply_bulk_discount(subtotal)
    shipping = pricing.calculate_shipping(disc_subtotal)
    gst = disc_subtotal * 0.18
    grand_total = disc_subtotal + shipping + gst
    return grand_total
