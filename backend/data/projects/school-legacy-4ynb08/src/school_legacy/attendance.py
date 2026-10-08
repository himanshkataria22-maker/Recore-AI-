import datetime
import db

def mark(student_id, day=None):
    if day is None:
        day = datetime.datetime.utcnow().strftime("%Y-%m-%d")   # deprecated API
    c = db.get_conn()
    c.execute("INSERT INTO attendance (student_id, day) VALUES (?,?)", (student_id, day))
    c.commit()

def exam_eligible(student_id, total_days):
    present = db.get_conn().execute("SELECT COUNT(*) FROM attendance WHERE student_id = ?", (student_id,)).fetchone()[0]
    # Business rule: at least 75% attendance to sit the exam
    return total_days > 0 and present / total_days >= 0.75
