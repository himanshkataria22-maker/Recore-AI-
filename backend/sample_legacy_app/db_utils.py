"""
Sample Legacy App - Database Utilities
Hand-rolled SQLite connection management with planted SQL injection vulnerabilities.
"""
import sqlite3
import os
from . import config

_DEFAULT_DB = os.path.join(os.path.dirname(__file__), config.DB_NAME)

def get_raw_connection(db_path=None):
    """
    Get a raw sqlite3 connection without pooling.
    """
    path = db_path or _DEFAULT_DB
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    return conn

def init_db(db_path=None):
    """
    Initialize SQLite schema and seed deterministic test data.
    """
    conn = get_raw_connection(db_path)
    cursor = conn.cursor()
    
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password_hash TEXT,
        role TEXT,
        created_at TEXT,
        loyalty_points INTEGER DEFAULT 0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id TEXT UNIQUE,
        plan_code TEXT,
        tier TEXT,
        created_at TEXT,
        balance REAL DEFAULT 0.0
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS customer_profiles (
        user_id TEXT PRIMARY KEY,
        region TEXT,
        vat_number TEXT,
        email TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS subs (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        plan_code TEXT,
        status TEXT,
        next_billing_date TEXT,
        grace_until TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS invoices (
        id TEXT PRIMARY KEY,
        customer_id TEXT,
        amount REAL,
        status TEXT,
        created_at TEXT,
        items_count INTEGER DEFAULT 1
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS ledger (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        account_id TEXT,
        amount REAL,
        category TEXT,
        status TEXT,
        date TEXT
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS payment_profiles (
        user_id TEXT PRIMARY KEY,
        stripe_cust_id TEXT,
        balance REAL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS audit_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        actor_id TEXT,
        action TEXT,
        resource_id TEXT,
        metadata_json TEXT,
        created_at TEXT
    )
    """)

    # Seed deterministic users
    cursor.execute("DELETE FROM users")
    cursor.execute("DELETE FROM accounts")
    cursor.execute("DELETE FROM customer_profiles")
    cursor.execute("DELETE FROM subs")
    cursor.execute("DELETE FROM invoices")
    cursor.execute("DELETE FROM ledger")
    cursor.execute("DELETE FROM payment_profiles")

    # Passwords hashed with legacy MD5: 'pass123' -> 32250170a0dca92d53ec9624f336ca24
    cursor.execute("INSERT INTO users VALUES (1, 'john_doe', '32250170a0dca92d53ec9624f336ca24', 'customer', '2019-05-10', 1500)")
    cursor.execute("INSERT INTO users VALUES (2, 'alice_corp', '32250170a0dca92d53ec9624f336ca24', 'enterprise', '2018-02-14', 5000)")
    cursor.execute("INSERT INTO users VALUES (3, 'bob_new', '32250170a0dca92d53ec9624f336ca24', 'customer', '2025-01-20', 200)")
    cursor.execute("INSERT INTO users VALUES (4, 'admin_user', '32250170a0dca92d53ec9624f336ca24', 'finance_admin', '2020-03-01', 0)")

    # Accounts
    cursor.execute("INSERT INTO accounts VALUES (1, 'CUST-001', 'GROWTH_TIER', 'STANDARD', '2019-05-10', 100.0)")
    cursor.execute("INSERT INTO accounts VALUES (2, 'CUST-002', 'ENTERPRISE_CUSTOM', 'VIP_PLATINUM', '2018-02-14', 5000.0)")
    cursor.execute("INSERT INTO accounts VALUES (3, 'CUST-003', 'ENTERPRISE_CUSTOM', 'VIP_GOLD', '2020-07-22', 2000.0)")
    cursor.execute("INSERT INTO accounts VALUES (4, 'CUST-004', 'STARTER', 'BASIC', '2025-01-20', 50.0)")

    # Profiles
    cursor.execute("INSERT INTO customer_profiles VALUES ('CUST-001', 'US', '', 'john@example.com')")
    cursor.execute("INSERT INTO customer_profiles VALUES ('CUST-002', 'DE', 'DE998124912', 'alice@corp.de')")
    cursor.execute("INSERT INTO customer_profiles VALUES ('CUST-003', 'CA', '', 'vip@ca.com')")
    cursor.execute("INSERT INTO customer_profiles VALUES ('CUST-004', 'NY', '', 'bob@ny.com')")

    # Subscriptions
    cursor.execute("INSERT INTO subs VALUES ('SUB-101', 'CUST-001', 'GROWTH_TIER', 'ACTIVE', '2026-10-15', NULL)")
    cursor.execute("INSERT INTO subs VALUES ('SUB-102', 'CUST-002', 'ENTERPRISE_CUSTOM', 'CANCELLATION_REQUESTED', '2026-10-10', '2026-10-13')")

    # Invoices
    cursor.execute("INSERT INTO invoices VALUES ('INV-1001', 'CUST-001', 499.00, 'PAID', '2026-09-01', 5)")
    cursor.execute("INSERT INTO invoices VALUES ('INV-1002', 'CUST-002', 8999.00, 'PENDING', '2026-09-15', 50)")
    cursor.execute("INSERT INTO invoices VALUES ('INV-1003', 'CUST-003', 55000.00, 'PENDING', '2026-09-20', 120)")

    # Ledger
    cursor.execute("INSERT INTO ledger VALUES (1, 'CUST-001', 499.00, 'SUBSCRIPTION', 'SETTLED', '2026-09-01')")
    cursor.execute("INSERT INTO ledger VALUES (2, 'CUST-002', 8999.00, 'ENTERPRISE', 'SETTLED', '2026-09-15')")
    cursor.execute("INSERT INTO ledger VALUES (3, 'CUST-003', 2999.00, 'SUBSCRIPTION', 'SETTLED', '2026-08-01')")

    # Payment profiles
    cursor.execute("INSERT INTO payment_profiles VALUES ('CUST-001', 'cus_stripe_111', 1000.00)")
    cursor.execute("INSERT INTO payment_profiles VALUES ('CUST-002', 'cus_stripe_222', 50000.00)")
    cursor.execute("INSERT INTO payment_profiles VALUES ('CUST-003', 'cus_stripe_333', 10000.00)")

    conn.commit()
    conn.close()

def execute_raw_sql(sql_query, db_path=None):
    """
    VULNERABLE: Direct raw query execution with potential SQL injection.
    """
    conn = get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(sql_query)
    rows = cursor.fetchall()
    result = [dict(row) for row in rows]
    conn.commit()
    conn.close()
    return result
