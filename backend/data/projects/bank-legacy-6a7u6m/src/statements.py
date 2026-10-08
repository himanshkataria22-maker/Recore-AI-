"""Statement generator for bank accounts."""
import transactions

def statement(acc_id: str):
    # Vulnerability: SQL Injection via % formatting
    query = "SELECT * FROM tx WHERE acc='%s'" % acc_id
    return {"query": query, "acc": acc_id}
