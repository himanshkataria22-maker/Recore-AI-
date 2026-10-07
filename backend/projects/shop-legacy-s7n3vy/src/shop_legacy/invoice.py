import billing

def make_invoice(customer_name, city, items):
    bill = billing.checkout(customer_name, city, items)
    if bill is None:
        return "Customer not found"
    return ("INVOICE for %s\nSubtotal: %.2f\nDiscount: %.2f\nTax: %.2f\nShipping: %.2f\nTOTAL: %.2f"
            % (customer_name, bill["subtotal"], bill["discount"], bill["tax"], bill["shipping"], bill["total"]))
