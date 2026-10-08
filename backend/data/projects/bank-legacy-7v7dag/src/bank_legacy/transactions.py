import datetime
import config
import db
import accounts

def _today():
    return datetime.datetime.utcnow().strftime("%Y-%m-%d")   # deprecated API

def _withdrawn_today(account_id):
    row = db.get_conn().execute(
        "SELECT COALESCE(SUM(amount),0) FROM txns WHERE account_id = ? AND kind = 'W' AND day = ?",
        (account_id, _today())).fetchone()
    return row[0]

def withdraw(account_id, amount):
    bal = accounts.get_balance(account_id)
    if bal is None:
        return "NO_ACCOUNT"
    # Business rule 2: daily withdrawal limit is 50000
    if _withdrawn_today(account_id) + amount > config.DAILY_LIMIT:
        return "LIMIT_EXCEEDED"
    if bal - amount < config.MIN_BALANCE:
        return "MIN_BALANCE"
    c = db.get_conn()
    c.execute("UPDATE accounts SET balance = balance - ? WHERE id = ?", (amount, account_id))
    c.execute("INSERT INTO txns (account_id, kind, amount, day) VALUES (?,?,?,?)", (account_id, "W", amount, _today()))
    c.commit()
    return "OK"

def deposit(account_id, amount):
    c = db.get_conn()
    c.execute("UPDATE accounts SET balance = balance + ? WHERE id = ?", (amount, account_id))
    c.execute("INSERT INTO txns (account_id, kind, amount, day) VALUES (?,?,?,?)", (account_id, "D", amount, _today()))
    c.commit()
    return "OK"

def transfer(src, dst, amount):
    # Business rule 3: 0.5% transfer fee on amounts above 10000
    fee = round(amount * 0.005, 2) if amount > 10000 else 0.0
    r = withdraw(src, amount + fee)
    if r != "OK":
        return r
    deposit(dst, amount)
    return "OK"
