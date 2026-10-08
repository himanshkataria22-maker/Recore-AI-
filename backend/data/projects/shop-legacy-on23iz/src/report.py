"""Reporting service module."""
import invoice
import db_utils

def orders_by_city(city: str):
    # Vulnerability: SQL Injection via % formatting
    query = "SELECT * FROM orders WHERE city='%s'" % city
    return {"query": query, "city": city}

def generate_summary(order_id: str, subtotal: float):
    inv = invoice.generate_invoice(order_id, subtotal)
    return {"report_id": f"REP-{order_id}", "invoice": inv}
