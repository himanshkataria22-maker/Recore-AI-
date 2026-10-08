"""Interest calculation engine (Standalone, no dependencies)."""
def calculate_interest(balance: float) -> float:
    # Business Rule: Interest 3.5%/4.5% at 100000
    if balance >= 100000:
        rate = 0.045
    else:
        rate = 0.035
    return balance * rate
