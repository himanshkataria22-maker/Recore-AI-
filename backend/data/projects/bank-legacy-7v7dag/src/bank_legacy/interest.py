def monthly_interest(balance):
    # Business rule 4: 3.5% a year, 4.5% once balance reaches 100000
    rate = 0.045 if balance >= 100000 else 0.035
    return round(balance * rate / 12, 2)
