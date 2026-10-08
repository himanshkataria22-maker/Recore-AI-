import db

def open_account(holder, deposit):
    # Business rule 1: minimum opening deposit is 1000
    if deposit < 1000:
        return "MIN_DEPOSIT"
    c = db.get_conn()
    cur = c.execute("INSERT INTO accounts (holder, balance) VALUES (?,?)", (holder, deposit))
    c.commit()
    return cur.lastrowid

def get_balance(account_id):
    row = db.get_conn().execute("SELECT balance FROM accounts WHERE id = ?", (account_id,)).fetchone()
    return row[0] if row else None
