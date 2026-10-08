import db
import transactions

def statement(holder):
    acc = db.find_account(holder)
    if not acc:
        return "NO_ACCOUNT"
    # SQL injection #3
    q = f"SELECT kind, amount FROM txns WHERE account_id = {acc[0][0]} ORDER BY id"
    rows = db.get_conn().execute(q).fetchall()
    lines = ["%s %.2f" % (k, a) for k, a in rows]
    return "Statement for %s\n%s\nBalance: %.2f" % (holder, "\n".join(lines), acc[0][2])
