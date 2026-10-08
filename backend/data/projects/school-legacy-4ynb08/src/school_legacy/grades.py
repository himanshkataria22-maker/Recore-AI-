import config
import db

def letter(score):
    # Business rule: A from 90, B from 75, C from 60, D from the pass mark (40), else F
    if score >= 90:
        return "A"
    if score >= 75:
        return "B"
    if score >= 60:
        return "C"
    if score >= config.PASS_MARK:
        return "D"
    return "F"

def result(student_id):
    rows = db.get_conn().execute("SELECT score FROM marks WHERE student_id = ?", (student_id,)).fetchall()
    scores = [r[0] for r in rows]
    if not scores:
        return "NO_MARKS"
    avg = sum(scores) / len(scores)
    # Business rule: pass needs an average of 40 and no subject below 33
    if avg >= config.PASS_MARK and min(scores) >= 33:
        return "PASS"
    return "FAIL"
