import pytest
import asyncio
import httpx
from backend.main import app

async def _req(method: str, path: str, **kwargs):
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as c:
        return await c.request(method, path, **kwargs)

def api_get(path: str, **kwargs):
    return asyncio.run(_req("GET", path, **kwargs))

def api_post(path: str, **kwargs):
    return asyncio.run(_req("POST", path, **kwargs))

def test_health_check():
    """Verify health endpoint."""
    response = api_get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_get_modules():
    """Verify GET /api/modules returns valid camelCase schema list."""
    response = api_get("/api/modules")
    assert response.status_code == 200
    modules = response.json()
    assert isinstance(modules, list)
    assert len(modules) >= 12
    
    first = modules[0]
    assert "riskScore" in first
    assert "riskLevel" in first
    assert "hasTests" in first
    assert "dependsOn" in first
    assert "usedBy" in first

def test_get_single_module():
    """Verify GET /api/modules/{id}."""
    response = api_get("/api/modules/discounts")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "discounts"
    assert data["name"] == "discounts.py"

def test_get_business_rules():
    """Verify GET /api/business-rules and /api/business-rules?moduleId=discounts."""
    response = api_get("/api/business-rules?moduleId=discounts")
    assert response.status_code == 200
    rules = response.json()
    assert isinstance(rules, list)
    assert len(rules) >= 3
    assert "plainEnglish" in rules[0]
    assert "codeSnippet" in rules[0]
    assert "confidence" in rules[0]

def test_get_project_summary():
    """Verify GET /api/project/summary."""
    response = api_get("/api/project/summary")
    assert response.status_code == 200
    data = response.json()
    assert "totalModules" in data
    assert "totalLoc" in data
    assert "overallHealthScore" in data
    assert "riskDistribution" in data
    assert "topVulnerabilities" in data

def test_get_dependency_graph():
    """Verify GET /api/graph."""
    response = api_get("/api/graph")
    assert response.status_code == 200
    graph = response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) >= 12

def test_get_modernization_plan():
    """Verify GET /api/plan."""
    response = api_get("/api/plan")
    assert response.status_code == 200
    plan = response.json()
    assert "projectId" in plan
    assert "totalEffortDays" in plan
    assert "order" in plan
    assert len(plan["order"]) >= 5

def test_get_blast_radius():
    """Verify GET /api/blast-radius/{id}."""
    response = api_get("/api/blast-radius/db_utils")
    assert response.status_code == 200
    blast = response.json()
    assert blast["moduleId"] == "db_utils"
    assert len(blast["directDependents"]) >= 5
    assert blast["impactScore"] > 50

def test_explain_plan_recommendation():
    """Verify GET /api/plan/explain."""
    response = api_get("/api/plan/explain")
    assert response.status_code == 200
    explanation = response.json()
    assert "recommendedModuleId" in explanation
    assert "moduleName" in explanation
    assert "reason" in explanation
    assert "details" in explanation
    assert explanation["confidence"] >= 75

def test_get_module_insights():
    """Verify GET /api/modules/{id}/insights (Feature A - Grounded Explainable AI Insights)."""
    response = api_get("/api/modules/discounts/insights")
    assert response.status_code == 200
    insight = response.json()
    assert insight["moduleId"] == "discounts"
    assert "summary" in insight
    assert "whyRisky" in insight
    assert len(insight["whyRisky"]) >= 1
    assert "suggestedFix" in insight
    assert insight["confidence"] >= 75

    # Check that each whyRisky item has evidenceIssueId and valid line number
    for item in insight["whyRisky"]:
        assert "reason" in item
        assert "evidenceIssueId" in item
        assert "line" in item
        assert item["line"] > 0

def test_generate_tests_modernize_strangler_and_report_flow():
    """Verify end-to-end flow: generate tests, modernize, strangler routing, shadow run, rollback, and report."""
    # 1. Generate tests
    gen_res = api_post("/api/modules/discounts/generate-tests")
    assert gen_res.status_code == 200
    assert gen_res.json()["casesTotal"] >= 4

    # 2. Modernize module
    mod_res = api_post("/api/modules/discounts/modernize")
    assert mod_res.status_code == 200
    val_run = mod_res.json()
    assert val_run["moduleId"] == "discounts"
    assert val_run["testsTotal"] >= 4
    assert val_run["behaviorPreserved"] is True

    # 3. Check Strangler routing target (auto-set to modernized)
    route_res = api_get("/api/modules/discounts/route")
    assert route_res.status_code == 200
    assert route_res.json()["target"] == "modernized"

    # 4. Toggle routing target to legacy
    toggle_res = api_post("/api/modules/discounts/route", json={"target": "legacy"})
    assert toggle_res.status_code == 200
    assert toggle_res.json()["target"] == "legacy"

    # Toggle back to modernized
    toggle_back = api_post("/api/modules/discounts/route", json={"target": "modernized"})
    assert toggle_back.status_code == 200
    assert toggle_back.json()["target"] == "modernized"

    # 5. Run Shadow Comparison
    shadow_res = api_post("/api/modules/discounts/shadow-run")
    assert shadow_res.status_code == 200
    shadow_data = shadow_res.json()
    assert shadow_data["moduleId"] == "discounts"
    assert shadow_data["totalCases"] >= 4
    assert shadow_data["matchedCases"] == shadow_data["totalCases"]
    assert shadow_data["matchRate"] == 100.0
    assert len(shadow_data["cases"]) >= 4

    # 6. Download Audit Report
    report_res = api_get("/api/modules/discounts/report")
    assert report_res.status_code == 200
    assert "text/markdown" in report_res.headers.get("content-type", "")
    assert "discounts" in report_res.text
    assert "Strangler Routing Status" in report_res.text

    # 7. Submit approval
    app_res = api_post(
        "/api/validation/discounts/approve",
        json={"status": "approved", "notes": "Automated pipeline sign-off.", "reviewerName": "lead_architect"}
    )
    assert app_res.status_code == 200
    assert app_res.json()["success"] is True

    # 8. Rollback module (should reset route to legacy automatically)
    roll_res = api_post("/api/modules/discounts/rollback")
    assert roll_res.status_code == 200
    assert roll_res.json()["success"] is True

    route_after_rollback = api_get("/api/modules/discounts/route")
    assert route_after_rollback.status_code == 200
    assert route_after_rollback.json()["target"] == "legacy"
