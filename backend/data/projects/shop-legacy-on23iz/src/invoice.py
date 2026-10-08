"""Invoice generation module."""
import billing

def generate_invoice(order_id: str, items_subtotal: float):
    total = billing.calculate_total(items_subtotal)
    return {
        "order_id": order_id,
        "subtotal": items_subtotal,
        "grand_total": total
    }
