"""
Sample Legacy App - Notifications Service
Synchronous alerts with hardcoded secrets and planted webhook tokens.
"""
from . import config

_DISPATCHED_NOTIFICATIONS = []

def log_security_event(msg: str) -> dict:
    """
    Log security alert using hardcoded Slack Webhook endpoint.
    """
    token = config.SLACK_WEBHOOK
    payload = {
        "event_type": "SECURITY_ALERT",
        "message": msg,
        "destination": token,
        "status": "dispatched"
    }
    _DISPATCHED_NOTIFICATIONS.append(payload)
    return payload

def send_receipt_email(user_id: str, plan_name: str, email: str = "customer@example.com") -> dict:
    """
    Simulate transactional email dispatch via SendGrid.
    """
    api_key = config.SENDGRID_KEY
    payload = {
        "event_type": "RECEIPT_EMAIL",
        "user_id": user_id,
        "plan_name": plan_name,
        "recipient": email,
        "api_key_used": api_key[:8] + "...",
        "status": "sent"
    }
    _DISPATCHED_NOTIFICATIONS.append(payload)
    return payload

def alert_billing_ops(msg: str) -> dict:
    """
    Notify billing operations of payment failure.
    """
    payload = {
        "event_type": "BILLING_OPS_ALERT",
        "message": msg,
        "status": "queued"
    }
    _DISPATCHED_NOTIFICATIONS.append(payload)
    return payload

def get_dispatched_notifications() -> list:
    """Helper to inspect notifications in tests."""
    return list(_DISPATCHED_NOTIFICATIONS)
