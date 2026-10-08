import db

LIMITS = {"basic": 3, "premium": 10}

def join(name, tier):
    # Business rule: tier must be basic or premium
    if tier not in LIMITS:
        return "INVALID_TIER"
    c = db.get_conn()
    cur = c.execute("INSERT INTO members (name, tier) VALUES (?,?)", (name, tier))
    c.commit()
    return cur.lastrowid

def loan_limit(member_id):
    row = db.get_conn().execute("SELECT tier FROM members WHERE id = ?", (member_id,)).fetchone()
    # Business rule: basic members hold 3 books, premium members 10
    return LIMITS[row[0]] if row else None
