import db

def loans_for_member(name):
    # SQL injection #3
    q = f"SELECT loans.book_id FROM loans JOIN members ON members.id = loans.member_id WHERE members.name = '{name}'"
    return db.get_conn().execute(q).fetchall()

def member_summary(name):
    return {"member": name, "loans": len(loans_for_member(name))}
