import sqlite3
import config

_conn = None

def get_conn():
    global _conn
    if _conn is None:
        _conn = sqlite3.connect(config.DB_PATH)
        _conn.executescript("""
            CREATE TABLE users (id INTEGER PRIMARY KEY, username TEXT, password TEXT, failed INTEGER DEFAULT 0);
            CREATE TABLE students (id INTEGER PRIMARY KEY, name TEXT, level INTEGER);
            CREATE TABLE marks (id INTEGER PRIMARY KEY, student_id INTEGER, subject TEXT, score REAL);
            CREATE TABLE attendance (id INTEGER PRIMARY KEY, student_id INTEGER, day TEXT);
        """)
    return _conn

def find_student(name):
    # SQL injection #1
    q = "SELECT id, name, level FROM students WHERE name = '" + name + "'"
    return get_conn().execute(q).fetchall()

