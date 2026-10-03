import pytest
import httpx
from backend.main import app

@pytest.fixture
def anyio_backend():
    return "asyncio"

@pytest.mark.anyio
async def test_health_check():
    """Verify health endpoint."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"

@pytest.mark.anyio
async def test_get_modules():
    """Verify GET /api/modules returns valid camelCase schema list."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/modules")
        assert response.status_code == 200
        modules = response.json()
        assert isinstance(modules, list)
        assert len(modules) >= 12
        
        # Check camelCase fields matching TypeScript /lib/types.ts
        first = modules[0]
        assert "riskScore" in first
        assert "riskLevel" in first
        assert "hasTests" in first
        assert "dependsOn" in first
        assert "usedBy" in first

@pytest.mark.anyio
async def test_get_single_module():
    """Verify GET /api/modules/{id}."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/modules/discounts")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "discounts"
        assert data["name"] == "discounts.py"

@pytest.mark.anyio
async def test_get_business_rules():
    """Verify GET /api/business-rules and /api/business-rules?moduleId=discounts."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/business-rules?moduleId=discounts")
        assert response.status_code == 200
        rules = response.json()
        assert isinstance(rules, list)
        assert len(rules) >= 3
        assert "plainEnglish" in rules[0]
        assert "codeSnippet" in rules[0]
        assert "confidence" in rules[0]

@pytest.mark.anyio
async def test_get_project_summary():
    """Verify GET /api/project/summary."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/project/summary")
        assert response.status_code == 200
        data = response.json()
        assert "totalModules" in data
        assert "totalLoc" in data
        assert "overallHealthScore" in data
        assert "riskDistribution" in data
        assert "topVulnerabilities" in data

@pytest.mark.anyio
async def test_get_dependency_graph():
    """Verify GET /api/graph."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/graph")
        assert response.status_code == 200
        graph = response.json()
        assert "nodes" in graph
        assert "edges" in graph
        assert len(graph["nodes"]) >= 12

@pytest.mark.anyio
async def test_get_modernization_plan():
    """Verify GET /api/plan."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/plan")
        assert response.status_code == 200
        plan = response.json()
        assert "projectId" in plan
        assert "totalEffortDays" in plan
        assert "order" in plan
        assert len(plan["order"]) >= 5

@pytest.mark.anyio
async def test_get_blast_radius():
    """Verify GET /api/blast-radius/{id}."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        response = await client.get("/api/blast-radius/db_utils")
        assert response.status_code == 200
        blast = response.json()
        assert blast["moduleId"] == "db_utils"
        assert len(blast["directDependents"]) >= 5
        assert blast["impactScore"] > 50

@pytest.mark.anyio
async def test_generate_tests_and_modernize_flow():
    """Verify POST /api/modules/{id}/generate-tests, POST /api/modules/{id}/modernize, and validation."""
    async with httpx.AsyncClient(transport=httpx.ASGITransport(app=app), base_url="http://test") as client:
        # 1. Generate tests
        gen_res = await client.post("/api/modules/discounts/generate-tests")
        assert gen_res.status_code == 200
        assert gen_res.json()["casesTotal"] >= 4

        # 2. Modernize module
        mod_res = await client.post("/api/modules/discounts/modernize")
        assert mod_res.status_code == 200
        val_run = mod_res.json()
        assert val_run["moduleId"] == "discounts"
        assert val_run["testsTotal"] >= 4
        assert val_run["behaviorPreserved"] is True

        # 3. Get validation run
        val_get = await client.get("/api/validation/discounts")
        assert val_get.status_code == 200
        assert val_get.json()["moduleId"] == "discounts"

        # 4. Submit approval
        app_res = await client.post(
            "/api/validation/discounts/approve",
            json={"status": "approved", "notes": "Automated pipeline sign-off.", "reviewerName": "lead_architect"}
        )
        assert app_res.status_code == 200
        assert app_res.json()["success"] is True

        # 5. Rollback module
        roll_res = await client.post("/api/modules/discounts/rollback")
        assert roll_res.status_code == 200
        assert roll_res.json()["success"] is True
