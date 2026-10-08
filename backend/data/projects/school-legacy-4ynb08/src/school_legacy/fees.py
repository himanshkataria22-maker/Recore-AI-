def fee_due(level, late_days, has_sibling):
    # Business rule: 20000 for levels 1-8, 30000 for levels 9-12
    base = 20000 if level <= 8 else 30000
    # Business rule: 10% discount if a sibling studies here
    if has_sibling:
        base = base * 0.9
    # Business rule: late fee is 100 per day, capped at 2000
    late = min(late_days * 100, 2000) if late_days > 0 else 0
    return round(base + late, 2)
