"""
Sample Legacy App - Authentication & Token Security
Contains legacy MD5 password hashing, master password backdoor, and SQL injection.
"""
import hashlib
import jwt
from . import config
from . import db_utils
from . import notification

def hash_password_legacy(raw_password: str) -> str:
    """Deprecated insecure hash routine without salt."""
    return hashlib.md5(raw_password.encode()).hexdigest()

def authenticate_user(username: str, password_raw: str, db_path=None) -> dict:
    """
    Authenticate against legacy SQLite table with dynamic string query.
    Hidden rule: MASTER_PASS bypasses DB lookup.
    """
    if password_raw == config.MASTER_PASS:
        return {
            "user_id": 0,
            "username": "root_admin",
            "role": "superuser",
            "is_super": True
        }
    
    md5_hash = hash_password_legacy(password_raw)
    
    # Critical SQL injection vulnerability via string concatenation
    query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND password_hash = '{md5_hash}'"
    
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    cursor.execute(query)
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        notification.log_security_event(f"Failed login for user: {username}")
        return {"error": "Invalid credentials", "authenticated": False}
        
    token_payload = {
        "sub": str(row["id"]),
        "username": row["username"],
        "role": row["role"],
        "exp": 1799999999
    }
    
    token = jwt.encode(token_payload, config.JWT_SECRET_KEY, algorithm="HS256")
    return {
        "authenticated": True,
        "token": token,
        "user": {
            "id": row["id"],
            "username": row["username"],
            "role": row["role"]
        }
    }

def verify_token(bearer_token: str) -> dict:
    """
    Validate legacy HS256 JWT token.
    """
    try:
        decoded = jwt.decode(bearer_token, config.JWT_SECRET_KEY, algorithms=["HS256"])
        return {"valid": True, "claims": decoded, "user_id": decoded.get("sub"), "role": decoded.get("role")}
    except Exception as e:
        return {"valid": False, "error": str(e)}
