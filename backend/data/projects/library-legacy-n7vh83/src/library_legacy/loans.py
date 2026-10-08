import config
import db
import members

def borrow(member_id, book_id):
    limit = members.loan_limit(member_id)
    if limit is None:
        return "NO_MEMBER"
    c = db.get_conn()
    held = c.execute("SELECT COUNT(*) FROM loans WHERE member_id = ?", (member_id,)).fetchone()[0]
    if held >= limit:
        return "LIMIT_REACHED"
    copies = c.execute("SELECT copies FROM books WHERE id = ?", (book_id,)).fetchone()
    if not copies or copies[0] <= 0:
        return "UNAVAILABLE"
    c.execute("UPDATE books SET copies = copies - 1 WHERE id = ?", (book_id,))
    c.execute("INSERT INTO loans (member_id, book_id) VALUES (?,?)", (member_id, book_id))
    c.commit()
    return "OK"

def loan_days():
    return eval(config.LOAN_DAYS_EXPR)   # eval on a config string

def fine(days_late):
    if days_late <= 0:
        return 0
    # Business rule: 2 per day for the first 7 days late, 5 per day after
    amount = min(days_late, 7) * 2 + max(days_late - 7, 0) * 5
    # Business rule: a fine never exceeds 500
    return min(amount, 500)
