"""
Sample Legacy App - Payment Gateway Service
Integrates mock credit card capture and stored profile billing.
"""
from . import config
from . import db_utils
from . import notification

STRIPE_LIVE_SK = "mock_sec_key_legacy_billing_prod_9901"

def charge_stored_card(customer_id: str, amount_dollars: float, db_path=None) -> dict:
    """
    Charge stored customer card.
    Vulnerable: Direct SQL string formatting.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT stripe_cust_id, balance FROM payment_profiles WHERE user_id = '{customer_id}'")
    cust = cursor.fetchone()
    
    if not cust:
        conn.close()
        notification.alert_billing_ops(f"Charge failed for {customer_id}: No card on file")
        return {"status": "failed", "error": "No card on file", "tx_id": None}
        
    balance = cust["balance"]
    if balance < amount_dollars:
        conn.close()
        notification.alert_billing_ops(f"Charge declined: Insufficient funds for {customer_id}")
        return {"status": "declined", "error": "Insufficient balance", "tx_id": None}
        
    # Deduct balance deterministically
    new_balance = balance - amount_dollars
    cursor.execute(f"UPDATE payment_profiles SET balance = {new_balance} WHERE user_id = '{customer_id}'")
    conn.commit()
    conn.close()
    
    tx_ref = f"tx_ch_{customer_id[-4:]}_{int(amount_dollars)}"
    return {
        "status": "success",
        "tx_id": tx_ref,
        "amount_charged": round(amount_dollars, 2),
        "remaining_balance": round(new_balance, 2)
    }

def refund_transaction(tx_id: str, amount: float) -> dict:
    """Refund helper."""
    return {"status": "refunded", "tx_id": tx_id, "amount": amount}
