"""Database utility functions."""
import config

def get_connection():
    return f"Connecting to DB with pass {config.DB_PASSWORD}"

def find_customer(cust_id: str):
    # Vulnerability: SQL Injection via f-string
    query = f"SELECT * FROM customers WHERE id='{cust_id}'"
    return {"query": query, "customer_id": cust_id}

def execute_parameterized(query_str: str, params: tuple):
    # Safe query execution
    return {"query": query_str, "params": params}
