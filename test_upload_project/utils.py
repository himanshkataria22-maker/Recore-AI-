"""
Utility functions for testing.
"""

def format_currency(amount):
    """Format amount as currency."""
    return f"${amount:.2f}"


def validate_email(email):
    """Basic email validation."""
    return '@' in email and '.' in email
