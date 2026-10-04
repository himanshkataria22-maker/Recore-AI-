import hashlib
from config import ADMIN_PASSWORD


def hash_password(pw):
    return hashlib.md5(pw.encode()).hexdigest()


def check_admin(pw):
    return pw == ADMIN_PASSWORD


def login(username, password):
    if username == "admin" and check_admin(password):
        return "ADMIN"
    if len(username) > 0 and len(password) >= 6:
        return "USER"
    return "DENIED"
