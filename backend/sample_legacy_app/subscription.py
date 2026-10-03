"""
Sample Legacy App - Subscription Lifecycle Engine
State machine for active renewals, cancellations, and grace period rules.
"""
from datetime import datetime, timedelta
from . import auth
from . import db_utils
from . import discounts
from . import payment_gateway
from . import notification

def renew_active_subscription(subscription_id: str, current_date_str: str = "2026-10-01", db_path=None) -> dict:
    """
    Renew active user subscription.
    Hidden business rules:
    - If status == 'CANCELLATION_REQUESTED', grant 72-hour grace period.
    - Leap year and 30-day rollover calculation.
    """
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(f"SELECT id, user_id, plan_code, status, next_billing_date FROM subs WHERE id = '{subscription_id}'")
    sub = cursor.fetchone()
    
    if not sub:
        conn.close()
        return {"success": False, "error": "Subscription not found"}
        
    sub_id = sub["id"]
    user_id = sub["user_id"]
    plan = sub["plan_code"]
    status = sub["status"]
    
    # Grace period rule
    if status == "CANCELLATION_REQUESTED":
        base_dt = datetime.strptime(current_date_str, "%Y-%m-%d")
        grace_until = (base_dt + timedelta(hours=72)).strftime("%Y-%m-%d")
        cursor.execute(f"UPDATE subs SET grace_until = '{grace_until}', status = 'GRACE_PERIOD' WHERE id = '{sub_id}'")
        conn.commit()
        conn.close()
        notification.send_receipt_email(user_id, plan)
        return {
            "success": True,
            "status": "GRACE_PERIOD",
            "grace_until": grace_until,
            "subscription_id": sub_id
        }
        
    base_dt = datetime.strptime(current_date_str, "%Y-%m-%d")
    next_billing = (base_dt + timedelta(days=30)).strftime("%Y-%m-%d")
    cursor.execute(f"UPDATE subs SET next_billing_date = '{next_billing}', status = 'ACTIVE' WHERE id = '{sub_id}'")
    conn.commit()
    conn.close()
    
    notification.send_receipt_email(user_id, plan)
    return {
        "success": True,
        "status": "ACTIVE",
        "next_billing_date": next_billing,
        "subscription_id": sub_id
    }
