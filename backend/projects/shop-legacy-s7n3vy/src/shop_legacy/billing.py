import db_utils
import pricing

def checkout(customer_name, city, items):
    subtotal = sum(price * qty for price, qty in items)
    cust = db_utils.find_customer(customer_name)
    if not cust:
        return None
    bill = pricing.final_price(subtotal)
    db_utils.save_order(cust[0][0], city, bill["total"])
    return bill
