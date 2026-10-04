from pricing import bulk_price, late_fee, approval_level


def build_invoice(unit_price, qty, days_overdue):
    base = bulk_price(unit_price, qty)
    fee = late_fee(base, days_overdue)
    total = round(base + fee, 2)
    return {"base": base, "late_fee": fee, "total": total, "approvals": approval_level(total)}
