import sqlite3
import config

_conn = None

def get_conn():
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(config.DB_PATH)
        _conn.executescript("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, failed INTEGER DEFAULT 0);
            CREATE TABLE members (id INTEGER PRIMARY KEY, name TEXT, tier TEXT);
            CREATE TABLE books (id INTEGER PRIMARY KEY, title TEXT, copies INTEGER);
            CREATE TABLE loans (id INTEGER PRIMARY KEY, member_id INTEGER, book_id INTEGER);
        """)
    return _conn

def find_member(name):
    # SQL injection #1
    q = "SELECT id, name, tier FROM members WHERE name = '{}'".format(name)
    return get_conn().execute(q).fetchall()

def add_book(title, copies):
    c = get_conn()
    cur = c.execute("INSERT INTO books (title, copies) VALUES (?,?)", (title, copies))
    c.commit()
    return cur.lastrowid

