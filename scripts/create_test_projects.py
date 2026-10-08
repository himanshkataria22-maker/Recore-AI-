import os
import zipfile
from pathlib import Path

BASE_DIR = Path(r"c:\Users\hp\Documents\Recore-AI-\test_projects")
BASE_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------
# 1. SHOP LEGACY (8 modules)
# ---------------------------------------------------------
shop_dir = BASE_DIR / "shop_legacy"
shop_dir.mkdir(parents=True, exist_ok=True)

(shop_dir / "config.py").write_text('''"""Configuration module containing application settings and credentials."""
API_KEY = "sk_live_998877665544332211"
DB_PASSWORD = "super_secret_db_pass_2026"
APP_NAME = "ShopLegacyService"
DEBUG = False
''', encoding="utf-8")

(shop_dir / "db_utils.py").write_text('''"""Database utility functions."""
import config

def get_connection():
    return f"Connecting to DB with pass {config.DB_PASSWORD}"

def find_customer(cust_id: str):
    # Vulnerability: SQL Injection via f-string
    query = f"SELECT * FROM customers WHERE id='{cust_id}'"
    return {"query": query, "customer_id": cust_id}

def execute_parameterized(query_str: str, params: tuple):
    # Safe query execution
    return {"query": query_str, "params": params}
''', encoding="utf-8")

(shop_dir / "auth.py").write_text('''"""User authentication module."""
import hashlib
import db_utils

def login(username: str, passw: str, failed_attempts: int = 0):
    # Business Rule: Lock after 3 failed logins
    if failed_attempts >= 3:
        return {"status": "locked", "message": "Account locked after 3 failed logins"}
    
    # Vulnerability: MD5 Hash
    pass_hash = hashlib.md5(passw.encode('utf-8')).hexdigest()
    
    # Vulnerability: SQL Injection via string concatenation
    query = "SELECT * FROM users WHERE user='" + username + "' AND pass='" + pass_hash + "'"
    db_utils.execute_parameterized("SELECT * FROM users WHERE user=?", (username,))
    
    return {"status": "success", "user": username, "query": query}
''', encoding="utf-8")

(shop_dir / "discounts.py").write_text('''"""Discount calculation rules."""
def apply_bulk_discount(subtotal: float) -> float:
    # Business Rule: Bulk discount 10% above 1000
    if subtotal > 1000:
        return subtotal * 0.90
    return subtotal
''', encoding="utf-8")

(shop_dir / "pricing.py").write_text('''"""Pricing and shipping rules."""
import config

def calculate_shipping(subtotal: float) -> float:
    # Business Rule: Free shipping above 500 else 50
    if subtotal > 500:
        return 0.0
    return 50.0
''', encoding="utf-8")

(shop_dir / "billing.py").write_text('''"""Billing processing module."""
import pricing
import discounts
import db_utils

def calculate_total(subtotal: float) -> float:
    # Business Rule: GST 18% on discounted amount
    disc_subtotal = discounts.apply_bulk_discount(subtotal)
    shipping = pricing.calculate_shipping(disc_subtotal)
    gst = disc_subtotal * 0.18
    grand_total = disc_subtotal + shipping + gst
    return grand_total
''', encoding="utf-8")

(shop_dir / "invoice.py").write_text('''"""Invoice generation module."""
import billing

def generate_invoice(order_id: str, items_subtotal: float):
    total = billing.calculate_total(items_subtotal)
    return {
        "order_id": order_id,
        "subtotal": items_subtotal,
        "grand_total": total
    }
''', encoding="utf-8")

(shop_dir / "report.py").write_text('''"""Reporting service module."""
import invoice
import db_utils

def orders_by_city(city: str):
    # Vulnerability: SQL Injection via % formatting
    query = "SELECT * FROM orders WHERE city='%s'" % city
    return {"query": query, "city": city}

def generate_summary(order_id: str, subtotal: float):
    inv = invoice.generate_invoice(order_id, subtotal)
    return {"report_id": f"REP-{order_id}", "invoice": inv}
''', encoding="utf-8")


# Create shop_legacy.zip
shop_zip_path = BASE_DIR / "shop_legacy.zip"
with zipfile.ZipFile(shop_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in shop_dir.glob("*.py"):
        zf.write(f, f.name)

print(f"Created shop_legacy.zip with {len(list(shop_dir.glob('*.py')))} modules")


# ---------------------------------------------------------
# 2. BANK LEGACY (7 modules)
# ---------------------------------------------------------
bank_dir = BASE_DIR / "bank_legacy"
bank_dir.mkdir(parents=True, exist_ok=True)

(bank_dir / "config.py").write_text('''"""Bank system settings and secret parameters."""
BANK_SECRET = "top_secret_bank_key_9988"
DB_PASS = "bank_db_pass_2026"
SYSTEM_ENV = "production"
''', encoding="utf-8")

(bank_dir / "db.py").write_text('''"""Database access layer for banking."""
import config

def find_account(acc_id: str):
    # Vulnerability: SQL Injection via f-string
    query = f"SELECT * FROM accounts WHERE acc_num='{acc_id}'"
    return {"query": query, "account": acc_id}
''', encoding="utf-8")

(bank_dir / "auth.py").write_text('''"""Banking authentication service."""
import hashlib
import db

def login(username: str, passw: str, failed_attempts: int = 0):
    # Business Rule: Lock after 3 failed logins
    if failed_attempts >= 3:
        return {"status": "locked", "message": "Account locked after 3 failed logins"}
        
    # Vulnerability: MD5 Hash
    pw_hash = hashlib.md5(passw.encode('utf-8')).hexdigest()
    
    # Vulnerability: SQL Injection via string concatenation
    query = "SELECT * FROM users WHERE u='" + username + "' AND p='" + pw_hash + "'"
    return {"status": "authenticated", "user": username, "query": query}
''', encoding="utf-8")

(bank_dir / "accounts.py").write_text('''"""Bank account management module."""
import db

def create_account(opening_deposit: float):
    # Business Rule: Min opening deposit 1000
    if opening_deposit < 1000:
        raise ValueError("Minimum opening deposit is 1000")
    return {"status": "created", "balance": opening_deposit}

def check_minimum_balance(balance: float) -> bool:
    # Business Rule: Min balance 1000
    return balance >= 1000
''', encoding="utf-8")

(bank_dir / "transactions.py").write_text('''"""Transaction processing engine."""
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
''', encoding="utf-8")

(bank_dir / "statements.py").write_text('''"""Statement generator for bank accounts."""
import transactions

def statement(acc_id: str):
    # Vulnerability: SQL Injection via % formatting
    query = "SELECT * FROM tx WHERE acc='%s'" % acc_id
    return {"query": query, "acc": acc_id}
''', encoding="utf-8")

(bank_dir / "interest.py").write_text('''"""Interest calculation engine (Standalone, no dependencies)."""
def calculate_interest(balance: float) -> float:
    # Business Rule: Interest 3.5%/4.5% at 100000
    if balance >= 100000:
        rate = 0.045
    else:
        rate = 0.035
    return balance * rate
''', encoding="utf-8")

# Create bank_legacy.zip
bank_zip_path = BASE_DIR / "bank_legacy.zip"
with zipfile.ZipFile(bank_zip_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    for f in bank_dir.glob("*.py"):
        zf.write(f, f.name)

print(f"Created bank_legacy.zip with {len(list(bank_dir.glob('*.py')))} modules")
