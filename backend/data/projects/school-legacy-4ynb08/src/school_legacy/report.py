import db

def marks_by_student(name):
    # SQL injection #3
    q = f"SELECT marks.subject, marks.score FROM marks JOIN students ON students.id = marks.student_id WHERE students.name = '{name}'"
    return db.get_conn().execute(q).fetchall()

def report_card(name):
    rows = marks_by_student(name)
    return {"student": name, "subjects": len(rows)}
