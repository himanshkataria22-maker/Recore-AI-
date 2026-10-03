"""
Sample Legacy App - Core Billing Pipeline
Coordinates pricing calculations, plan tiers, discount applications, and payment charging.
High cyclomatic complexity and planted SQL injection.
"""
from . import auth
from . import db_utils
from . import discounts
from . import tax_calculator
from . import payment_gateway
from . import subscription

def calculate_monthly_billing_cycle(customer_id: str, cycle_date: str = "2026-10-01", dry_run: bool = False, db_path=None) -> dict:
    """
    Calculate full monthly billing cycle for customer.
    High complexity branching logic and hidden pricing rules.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    
    # Vulnerable batch query with % formatting
    cursor.execute("SELECT id, customer_id, plan_code, tier, created_at FROM accounts WHERE customer_id = '%s'" % customer_id)
    account = cursor.fetchone()
    conn.close()
    
    if not account:
        return {"error": "Customer account not found", "status": "failed"}
        
    plan_code = account["plan_code"]
    tier = account["tier"]
    
    # Complex nested pricing rules
    subtotal = 0.0
    exempt_from_stacking = False
    
    if plan_code == "ENTERPRISE_CUSTOM":
        if tier == "VIP_GOLD":
            subtotal = 4999.00
        elif tier == "VIP_PLATINUM":
            # Hidden rule: VIP Platinum gets flat $8,999
            subtotal = 8999.00
            exempt_from_stacking = True
        else:
            subtotal = 2999.00
    elif plan_code == "GROWTH_TIER":
        if tier == "ADVANCED":
            subtotal = 799.00
        else:
            subtotal = 499.00
    elif plan_code == "STARTER":
        if tier == "PRO":
            subtotal = 199.00
        else:
            subtotal = 99.00
    else:
        subtotal = 49.00
        
    # Apply discount
    if not exempt_from_stacking:
        discount_rate = discounts.get_customer_discount_multiplier(customer_id, plan_code, db_path=db_path)
        subtotal = subtotal * (1.0 - discount_rate)
    else:
        discount_rate = 0.0
        
    # Compute tax
    tax_amt = tax_calculator.compute_regional_tax(subtotal, customer_id, db_path=db_path)
    grand_total = round(subtotal + tax_amt, 2)
    
    # Hidden rule: Large invoices over 50,000 require dual approval
    needs_dual_approval = grand_total >= 50000.00
    
    if not dry_run and grand_total > 0:
        charge_res = payment_gateway.charge_stored_card(customer_id, grand_total, db_path=db_path)
        return {
            "status": "billed",
            "customer_id": customer_id,
            "subtotal": round(subtotal, 2),
            "discount_rate": discount_rate,
            "tax": tax_amt,
            "amount": grand_total,
            "tx": charge_res.get("tx_id"),
            "dual_approval_required": needs_dual_approval
        }
        
    return {
        "status": "preview",
        "customer_id": customer_id,
        "subtotal": round(subtotal, 2),
        "discount_rate": discount_rate,
        "tax": tax_amt,
        "total": grand_total,
        "dual_approval_required": needs_dual_approval
    }

def calculate_late_fee(invoice_amount: float, days_overdue: int) -> dict:
    """
    Business rule: Late fee of 2% after 30 days overdue.
    """
    if days_overdue > 30:
        fee = round(invoice_amount * 0.02, 2)
        return {"days_overdue": days_overdue, "late_fee": fee, "total_with_fee": round(invoice_amount + fee, 2)}
    return {"days_overdue": days_overdue, "late_fee": 0.0, "total_with_fee": invoice_amount}
