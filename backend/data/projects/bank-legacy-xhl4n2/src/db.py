"""Database access layer for banking."""
import config

def find_account(acc_id: str):
    # Vulnerability: SQL Injection via f-string
    query = f"SELECT * FROM accounts WHERE acc_num='{acc_id}'"
    return {"query": query, "account": acc_id}
