import sqlite3
import config

_conn = None

def get_conn():
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(config.DB_PATH)
        _conn.executescript("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, failed INTEGER DEFAULT 0);
            CREATE TABLE accounts (id INTEGER PRIMARY KEY, holder TEXT, balance REAL);
            CREATE TABLE txns (id INTEGER PRIMARY KEY, account_id INTEGER, kind TEXT, amount REAL, day TEXT);
        """)
    return _conn

def find_account(holder):
    # SQL injection #1
    q = "SELECT id, holder, balance FROM accounts WHERE holder = '" + holder + "'"
    return get_conn().execute(q).fetchall()
