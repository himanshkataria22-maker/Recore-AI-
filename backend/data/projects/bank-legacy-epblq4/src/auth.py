"""Banking authentication service."""
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
