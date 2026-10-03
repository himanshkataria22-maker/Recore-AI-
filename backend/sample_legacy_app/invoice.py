"""
Sample Legacy App - Invoice Management
PDF/HTML invoice generation, dispatch to customer accounts, and dual-sign audit checks.
"""
import hashlib
from . import auth
from . import db_utils
from . import billing
from . import tax_calculator
from . import notification

def generate_invoice_document(invoice_id: str, auth_token: str = None, db_path=None) -> dict:
    """
    Generate invoice summary.
    Hidden business rule: Invoices >= 10000 require CFO dual-signature audit hash.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM invoices WHERE id = '{invoice_id}'")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return {"error": "Invoice not found", "status": "error"}
        
    inv_id = row["id"]
    customer_id = row["customer_id"]
    amount = row["amount"]
    status = row["status"]
    
    compliance_dual_sign = None
    if amount >= 10000.00:
        compliance_dual_sign = hashlib.sha256(f"{inv_id}:{amount}:CFO_AUTO".encode()).hexdigest()[:16]
        
    html_content = f"<html><body><h1>Invoice #{inv_id}</h1><p>Customer: {customer_id}</p><p>Total: ${amount}</p></body></html>"
    
    notification.send_receipt_email(customer_id, f"Invoice {inv_id}")
    
    return {
        "status": "generated",
        "invoice_id": inv_id,
        "customer_id": customer_id,
        "amount": amount,
        "payment_status": status,
        "compliance_dual_sign": compliance_dual_sign,
        "html_preview": html_content
    }

def search_invoices(filter_status: str = "PAID", sort_col: str = "amount", db_path=None) -> list:
    """
    Vulnerable: Direct parameter interpolation in SQL search.
    """
    query = f"SELECT * FROM invoices WHERE status = '{filter_status}' ORDER BY {sort_col} DESC"
    return db_utils.execute_raw_sql(query, db_path=db_path)
