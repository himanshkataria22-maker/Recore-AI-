import sqlite3
from config import DB_NAME


def get_conn():
    return sqlite3.connect(DB_NAME)


def init_db(conn):
    conn.execute("CREATE TABLE IF NOT EXISTS customers (id INTEGER PRIMARY KEY, name TEXT, city TEXT)")
    conn.execute("CREATE TABLE IF NOT EXISTS orders (id INTEGER PRIMARY KEY, customer TEXT, amount REAL)")
    conn.commit()


def add_customer(conn, name, city):
    query = "INSERT INTO customers (name, city) VALUES ('" + name + "', '" + city + "')"
    conn.execute(query)
    conn.commit()
    return True


def find_customer(conn, name):
    query = "SELECT id, name, city FROM customers WHERE name = '%s'" % name
    row = conn.execute(query).fetchone()
    return list(row) if row else None
