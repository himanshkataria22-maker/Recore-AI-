"""
Sample Legacy App - Financial Reporting Service
Quarterly revenue metrics, ledger aggregations, and balance sheet compilation.
"""
from . import auth
from . import db_utils
from . import billing
from . import invoice

def generate_quarterly_report(quarter: str, year: int, auth_token: str = None, db_path=None) -> dict:
    """
    Aggregate financial ledger summary.
    Vulnerable: Direct string interpolation in SQL query.
    """
    if auth_token:
        claims = auth.verify_token(auth_token)
        if not claims.get("valid"):
            return {"error": "Unauthorized", "status": "failed"}
            
    conn = db_utils.get_raw_connection(db_path)
    cursor = conn.cursor()
    
    # Vulnerable raw query
    cursor.execute(f"SELECT SUM(amount) as total_rev, category FROM ledger WHERE strftime('%Y', date) = '{year}' GROUP BY category")
    rows = cursor.fetchall()
    conn.close()
    
    metrics = []
    grand_sum = 0.0
    for r in rows:
        rev = r["total_rev"] or 0.0
        metrics.append({"category": r["category"], "total": round(rev, 2)})
        grand_sum += rev
        
    return {
        "status": "success",
        "year": year,
        "quarter": quarter,
        "total_revenue": round(grand_sum, 2),
        "breakdown": metrics
    }
