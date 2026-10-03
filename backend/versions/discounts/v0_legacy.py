"""
Sample Legacy App - Discount Engine
Calculates promo codes, loyalty tier discounts, bulk discounts, and recursive coupons.
"""
from . import db_utils

def get_customer_discount_multiplier(customer_id: str, plan_code: str, db_path=None) -> float:
    """
    Hidden business rule: Legacy users signed up before 2021 get grandfathered 25% discount forever.
    Loyalty points > 1000 grant an additional 10% discount.
    Annual plan grants 15% discount. Max total capped at 50%.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT created_at, loyalty_points FROM users WHERE username = '{customer_id}' OR id = 1")
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return 0.0
        
    created_at = row["created_at"]
    points = row["loyalty_points"]
    discount = 0.0
    
    if str(created_at).startswith(("2018", "2019", "2020")):
        discount += 0.25  # Grandfathered 25%
        
    if points and points > 1000:
        discount += 0.10  # Loyalty bonus
        
    if plan_code == "STARTUP_ANNUAL":
        discount += 0.15  # Annual prepayment
        
    return min(discount, 0.50)  # Capped at 50%

def calculate_bulk_discount(quantity: int, unit_price: float) -> dict:
    """
    Business rule:
    - Bulk orders of 100+ units get 5% off
    - Bulk orders of 500+ units get 12% off
    - Any discount over 10% requires manager approval
    """
    base_total = quantity * unit_price
    discount_pct = 0.0
    
    if quantity >= 500:
        discount_pct = 0.12
    elif quantity >= 100:
        discount_pct = 0.05
    else:
        discount_pct = 0.0
        
    discount_amount = base_total * discount_pct
    final_total = base_total - discount_amount
    
    requires_approval = discount_pct > 0.10
    
    return {
        "quantity": quantity,
        "unit_price": unit_price,
        "base_total": round(base_total, 2),
        "discount_pct": discount_pct,
        "discount_amount": round(discount_amount, 2),
        "final_total": round(final_total, 2),
        "requires_manager_approval": requires_approval
    }

def apply_recursive_promos(code: str, depth: int = 0) -> float:
    """
    Recursive discount code evaluation with potential stack overflow.
    """
    if depth > 5:
        return 0.40
        
    promo_table = {
        "WELCOME10": 0.10,
        "STACK_VIP": 0.15,
        "FLASH5": 0.05,
        "BLACKFRIDAY": 0.25
    }
    
    base_val = promo_table.get(code.upper(), 0.0)
    if code.startswith("SUB_") and depth < 3:
        parent_code = code[4:]
        return base_val + apply_recursive_promos(parent_code, depth + 1)
        
    return min(base_val, 0.50)
