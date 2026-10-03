"""
Sample Legacy App - Regional Tax Calculator
Static statutory rates, EU VAT reverse-charge logic, and GST slabs.
"""
from . import db_utils

TAX_RATES = {
    "CA": 0.0825,
    "NY": 0.08875,
    "UK": 0.20,
    "DE": 0.19,
    "FR": 0.20,
    "IT": 0.22,
    "DEFAULT": 0.05
}

def compute_regional_tax(subtotal: float, customer_id: str, db_path=None) -> float:
    """
    Business rule:
    - If customer has a valid EU VAT number (len > 5) in EU countries (UK, DE, FR, IT),
      apply 0% B2B reverse charge tax.
    - If subtotal > 10,000, add luxury surcharge of 2.5%.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT region, vat_number FROM customer_profiles WHERE user_id = '{customer_id}'")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return round(subtotal * TAX_RATES["DEFAULT"], 2)
        
    region = row["region"]
    vat_num = row["vat_number"]
    
    if vat_num and len(vat_num) > 5 and region in ["UK", "DE", "FR", "IT"]:
        return 0.0  # Reverse charge applied
        
    rate = TAX_RATES.get(region, TAX_RATES["DEFAULT"])
    base_tax = subtotal * rate
    
    # Luxury surcharge for invoices > 10000
    if subtotal > 10000.0:
        base_tax += subtotal * 0.025
        
    return round(base_tax, 2)
