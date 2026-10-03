"""
Cross-platform ReCore AI Smoke Test Suite.
Verifies all REST API endpoints end-to-end including Explainable Insights,
Strangler Pattern Routing, Shadow Comparisons, and Modernization Reports.
"""
import urllib.request
import urllib.error
import json
import sys

BASE_URL = "http://localhost:8000/api"
passed = 0
failed = 0

tests = [
    ("GET", "/health", None, "Health Status & Demo Mode Check"),
    ("GET", "/project/summary", None, "Dashboard Summary"),
    ("GET", "/modules", None, "Discovered Modules List"),
    ("GET", "/modules/discounts", None, "Single Module: discounts.py"),
    ("GET", "/modules/discounts/insights", None, "Explainable AI Insights (discounts.py)"),
    ("GET", "/modules/billing", None, "Single Module: billing.py"),
    ("GET", "/business-rules", None, "All Business Rules"),
    ("GET", "/business-rules?moduleId=discounts", None, "Discounts Business Rules"),
    ("GET", "/modules/billing/rules", None, "Billing Business Rules"),
    ("GET", "/graph", None, "Dependency Graph Nodes & Edges"),
    ("GET", "/plan", None, "Modernization Plan"),
    ("GET", "/plan/explain", None, "AI DAG Sequencing Rationale"),
    ("GET", "/blast-radius/db_utils", None, "Blast Radius for db_utils"),
    ("GET", "/blast-radius/discounts", None, "Blast Radius for discounts"),
    ("POST", "/modules/discounts/generate-tests", None, "Generate Behavioral Tests"),
    ("POST", "/modules/discounts/modernize", None, "Modernize discounts.py"),
    ("GET", "/modules/discounts/route", None, "Get Strangler Routing Target"),
    ("POST", "/modules/discounts/route", {"target": "legacy"}, "Toggle Route to Legacy"),
    ("POST", "/modules/discounts/route", {"target": "modernized"}, "Toggle Route to Modernized"),
    ("POST", "/modules/discounts/shadow-run", None, "Execute Shadow Comparison"),
    ("GET", "/modules/discounts/report", None, "Download Audit Report (.md)"),
    ("GET", "/validation/discounts", None, "ValidationRun for discounts"),
    ("POST", "/validation/discounts/approve", {"status": "approved", "notes": "Smoke test approval", "reviewerName": "lead_dev"}, "Approve discounts"),
    ("POST", "/modules/discounts/rollback", None, "Rollback discounts to v0"),
    ("POST", "/analyze", {"sourcePath": "backend/sample_legacy_app"}, "Trigger AST Analysis")
]

print("=" * 70)
print(f" Executing ReCore AI API Smoke Tests ({BASE_URL})")
print("=" * 70)

for method, path, body, desc in tests:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode("utf-8") if body is not None else None
    headers = {"Content-Type": "application/json"} if body is not None else {}
    req = urllib.request.Request(url, data=data, headers=headers, method=method)

    try:
        with urllib.request.urlopen(req, timeout=20) as resp:
            status = resp.status
            if status in (200, 201):
                print(f" {method:<6} {path:<38} [PASS] (HTTP {status})")
                passed += 1
            else:
                print(f" {method:<6} {path:<38} [FAIL] (HTTP {status})")
                failed += 1
    except urllib.error.HTTPError as e:
        print(f" {method:<6} {path:<38} [FAIL] (HTTP {e.code})")
        failed += 1
    except Exception as e:
        print(f" {method:<6} {path:<38} [ERROR] ({str(e)})")
        failed += 1

print("=" * 70)
print(f" Smoke Test Results: {passed} PASSED, {failed} FAILED")
print("=" * 70)

if failed > 0:
    sys.exit(1)
sys.exit(0)
