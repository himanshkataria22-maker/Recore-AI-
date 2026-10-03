"""
Simple test module for upload testing.
"""

def calculate_total(items):
    """Calculate total price of items."""
    total = 0
    for item in items:
        total += item.get('price', 0) * item.get('quantity', 1)
    return total


def apply_discount(total, discount_percent):
    """Apply discount to total."""
    return total * (1 - discount_percent / 100)


class Order:
    """Simple order class."""
    
    def __init__(self, customer_id):
        self.customer_id = customer_id
        self.items = []
    
    def add_item(self, name, price, quantity=1):
        """Add an item to the order."""
        self.items.append({
            'name': name,
            'price': price,
            'quantity': quantity
        })
    
    def get_total(self):
        """Get order total."""
        return calculate_total(self.items)
