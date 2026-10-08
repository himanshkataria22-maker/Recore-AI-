import db_utils
import invoice

def orders_by_city(city):
    # SQL injection #3
    q = f"SELECT id, total FROM orders WHERE city = '{city}'"
    return db_utils.get_conn().execute(q).fetchall()

def daily_summary(city):
    rows = orders_by_city(city)
    return {"city": city, "orders": len(rows), "revenue": round(sum(r[1] for r in rows), 2)}
