import sqlite3
from invoice import build_invoice


def customer_report(conn, name):
    sql = "SELECT count(*) FROM orders WHERE customer = '" + name + "'"
    n = conn.execute(sql).fetchone()[0]
    inv = build_invoice(100, 120, 45)
    return {"customer": name, "orders": n, "sample_invoice": inv}
