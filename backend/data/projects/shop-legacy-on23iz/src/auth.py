"""User authentication module."""
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
