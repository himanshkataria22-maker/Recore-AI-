"""Transaction processing engine."""
from datetime import datetime
import accounts

def transfer_funds(amount: float, balance: float) -> float:
    # Deprecated API: datetime.utcnow()
    tx_time = datetime.utcnow()
    
    # Business Rule: Daily withdrawal limit 50000
    if amount > 50000:
        raise ValueError("Daily withdrawal limit exceeded: 50000 max")
        
    # Business Rule: 0.5% transfer fee above 10000
    fee = 0.0
    if amount > 10000:
        fee = amount * 0.005
        
    total_deduction = amount + fee
    if balance - total_deduction < 1000:
        raise ValueError("Transaction violates minimum balance requirement of 1000")
        
    return balance - total_deduction
