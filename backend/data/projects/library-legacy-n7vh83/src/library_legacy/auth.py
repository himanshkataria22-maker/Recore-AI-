import hashlib
import db

MAX_FAILED = 3

def hash_password(p):
    return hashlib.md5(p.encode()).hexdigest()   # weak hash

def register(username, password):
    c = db.get_conn()
    c.execute("INSERT INTO users (username, password) VALUES (?,?)", (username, hash_password(password)))
    c.commit()

def login(username, password):
    c = db.get_conn()
    # SQL injection #2
    row = c.execute("SELECT id, password, failed FROM users WHERE username = '%s'" % username).fetchone()
    if not row:
        return "NO_USER"
    # Business rule: account locks after 3 failed attempts
    if row[2] >= MAX_FAILED:
        return "LOCKED"
    if row[1] == hash_password(password):
        c.execute("UPDATE users SET failed = 0 WHERE id = ?", (row[0],))
        c.commit()
        return "OK"
    c.execute("UPDATE users SET failed = failed + 1 WHERE id = ?", (row[0],))
    c.commit()
    return "BAD_PASSWORD"
