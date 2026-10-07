import sqlite3
import config

_conn = None

def get_conn():
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(config.DB_PATH)
        _conn.executescript("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, failed INTEGER DEFAULT 0);
            CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT);
            CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, city TEXT, total REAL);
            INSERT INTO customers VALUES (1,'Asha','Delhi'),(2,'Ravi','Mumbai');
        """)
    return _conn

def find_customer(name):
    # SQL injection #1
    q = "SELECT id, name, city FROM customers WHERE name = '" + name + "'"
    return get_conn().execute(q).fetchall()

def save_order(customer_id, city, total):
    c = get_conn()
    c.execute("INSERT INTO orders (customer_id, city, total) VALUES (?,?,?)", (customer_id, city, total))
    c.commit()
