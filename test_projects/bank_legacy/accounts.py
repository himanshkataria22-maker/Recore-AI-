"""Bank account management module."""
import db

def create_account(opening_deposit: float):
    # Business Rule: Min opening deposit 1000
    if opening_deposit < 1000:
        raise ValueError("Minimum opening deposit is 1000")
    return {"status": "created", "balance": opening_deposit}

def check_minimum_balance(balance: float) -> bool:
    # Business Rule: Min balance 1000
    return balance >= 1000
