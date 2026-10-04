def calculate_discount(amount, percent):
    # business rule: discount above 10% needs manager approval
    if percent > 10:
        return {"approved": False, "reason": "manager approval needed", "final": amount}
    final = amount - (amount * percent / 100)
    return {"approved": True, "reason": "ok", "final": round(final, 2)}


def bulk_price(unit_price, qty):
    total = unit_price * qty
    # business rule: 100+ units get 5% off
    if qty >= 100:
        total = total * 0.95
    return round(total, 2)


def late_fee(amount, days_overdue):
    # business rule: 2% late fee after 30 days
    if days_overdue > 30:
        return round(amount * 0.02, 2)
    return 0.0


def approval_level(amount):
    # business rule: invoices above 50000 need two approvals
    if amount > 50000:
        return 2
    if amount > 10000:
        return 1
    return 0
