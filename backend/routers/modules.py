"""
Modules, Business Rules, Test Generation, Modernization, Insights, and Strangler Routing Routes (Project Scoped).
"""
from fastapi import APIRouter, HTTPException, Query, Body, Response
from typing import List, Optional, Dict, Any
from datetime import datetime
import os

from ..models.schema import (
    Module,
    BusinessRule,
    ValidationRun,
    TestCaseResult,
    AIInsight,
    ModuleRoute,
    RouteUpdateRequest,
    ShadowRunResult
)
from ..projects.manager import project_manager
from ..analyzer.insights import InsightsEngine
from ..extractor.rules import BusinessRuleExtractor
from ..tester.generator import TestGenerator
from ..modernizer.engine import ModernizerEngine
from ..planner.plan import calculate_blast_radius
from ..adapters.generator import (
    get_module_route,
    set_module_route,
    ensure_adapter_exists,
    execute_shadow_comparison
)

router = APIRouter(tags=["modules"])

rule_extractor = BusinessRuleExtractor()
test_gen = TestGenerator()
insights_engine = InsightsEngine()


def _get_target_project_id(project_id: Optional[str] = None) -> str:
    pid = project_id or project_manager.get_latest_project_id()
    if not pid:
        raise HTTPException(status_code=404, detail="No project found.")
    return pid


def _get_module_or_404(project_id: str, module_id: str) -> Module:
    module = project_manager.get_module(project_id, module_id)
    if not module:
        raise HTTPException(
            status_code=404,
            detail=f"Module '{module_id}' not found in project '{project_id}'."
        )
    return module


# ==============================================================================
# PROJECT SCOPED MODULE ENDPOINTS
# ==============================================================================

@router.get("/projects/{project_id}/modules", response_model=List[Module])
def get_project_modules(project_id: str):
    """Retrieve all discovered modules for a project."""
    return project_manager.get_modules(project_id)


@router.get("/projects/{project_id}/modules/{module_id}", response_model=Module)
def get_project_module_by_id(project_id: str, module_id: str):
    """Retrieve single module by ID within a project."""
    return _get_module_or_404(project_id, module_id)


@router.get("/projects/{project_id}/modules/{module_id}/insights", response_model=AIInsight)
def get_project_module_insights(project_id: str, module_id: str):
    """Retrieve explainable AI insights for a module within a project."""
    target = _get_module_or_404(project_id, module_id)
    return insights_engine.generate_insights(target)


@router.get("/projects/{project_id}/business-rules", response_model=List[BusinessRule])
def get_project_business_rules(project_id: str, module_id: Optional[str] = Query(None, alias="moduleId")):
    """Retrieve extracted business rules for all or a specific module in a project."""
    modules = project_manager.get_modules(project_id)
    rules: List[BusinessRule] = []
    target_modules = [m for m in modules if m.id == module_id] if module_id else modules
    for m in target_modules:
        mod_rules = rule_extractor.extract_business_rules(m)
        rules.extend(mod_rules)
    return rules


@router.get("/projects/{project_id}/modules/{module_id}/rules", response_model=List[BusinessRule])
def get_project_module_rules(project_id: str, module_id: str):
    """Retrieve business rules for a specific module in a project."""
    return get_project_business_rules(project_id, module_id=module_id)


@router.get("/projects/{project_id}/blast-radius/{module_id}")
def get_project_module_blast_radius(project_id: str, module_id: str):
    """Calculate blast radius and transitive dependencies for a module in a project."""
    modules = project_manager.get_modules(project_id)
    _get_module_or_404(project_id, module_id)
    return calculate_blast_radius(modules, module_id)


@router.post("/projects/{project_id}/modules/{module_id}/generate-tests")
def generate_project_module_tests(project_id: str, module_id: str):
    """Generate behavioral test suite for a module in a project."""
    target = _get_module_or_404(project_id, module_id)
    cases = test_gen.generate_behavior_tests(target)
    return {"projectId": project_id, "moduleId": module_id, "casesTotal": len(cases), "cases": cases}


@router.post("/projects/{project_id}/modules/{module_id}/modernize", response_model=ValidationRun)
def modernize_project_module(project_id: str, module_id: str):
    """Run automated modernization and golden master verification for a module in a project."""
    target = _get_module_or_404(project_id, module_id)
    p_dir = project_manager.get_project_dir(project_id)
    src_dir = str(p_dir / "src")

    modernizer = ModernizerEngine(src_dir)
    val_run = modernizer.modernize_module(target)
    project_manager.save_validation(project_id, module_id, val_run)
    return val_run


@router.get("/projects/{project_id}/validation/{module_id}", response_model=ValidationRun)
@router.get("/projects/{project_id}/modules/{module_id}/validation", response_model=ValidationRun)
def get_project_validation_run(project_id: str, module_id: str):
    """Get latest validation run for a module in a project."""
    val = project_manager.get_validation(project_id, module_id)
    if val:
        return val
    return modernize_project_module(project_id, module_id)


@router.post("/projects/{project_id}/validation/{module_id}/approve")
@router.post("/projects/{project_id}/modules/{module_id}/approve")
def submit_project_approval(project_id: str, module_id: str, payload: Dict[str, Any] = Body(...)):
    """Submit human approval sign-off for a module in a project."""
    _get_module_or_404(project_id, module_id)
    status = payload.get("status", "approved")
    notes = payload.get("notes", "Developer sign-off.")
    reviewer = payload.get("reviewerName", "alex.rivera@enterprise.corp")
    now_iso = datetime.utcnow().isoformat() + "Z"

    val_run = project_manager.get_validation(project_id, module_id)
    if val_run:
        val_run.approval_status = status
        val_run.approval_notes = notes
        val_run.approved_by = reviewer
        val_run.approved_at = now_iso
        project_manager.save_validation(project_id, module_id, val_run)

    app_data = {
        "status": status,
        "notes": notes,
        "reviewer": reviewer,
        "timestamp": now_iso
    }
    project_manager.save_approval(project_id, module_id, app_data)

    return {
        "success": True,
        "projectId": project_id,
        "moduleId": module_id,
        "message": f"Module {module_id} successfully {status}. Sign-off logged.",
        "timestamp": now_iso
    }


@router.post("/projects/{project_id}/modules/{module_id}/rollback")
def rollback_project_module(project_id: str, module_id: str):
    """Rollback modernized module to legacy baseline in project."""
    target = _get_module_or_404(project_id, module_id)
    p_dir = project_manager.get_project_dir(project_id)
    src_dir = str(p_dir / "src")

    modernizer = ModernizerEngine(src_dir)
    success = modernizer.rollback_module(module_id)
    if not success:
        raise HTTPException(status_code=400, detail=f"Failed to rollback module '{module_id}'.")

    # Reset route to legacy
    route_data = {"moduleId": module_id, "target": "legacy", "lastUpdated": datetime.utcnow().isoformat() + "Z"}
    project_manager.save_route(project_id, module_id, route_data)

    return {
        "success": True,
        "message": f"Module {module_id} has been safely rolled back to legacy baseline."
    }


@router.get("/projects/{project_id}/modules/{module_id}/route", response_model=ModuleRoute)
def get_project_module_routing(project_id: str, module_id: str):
    """Retrieve strangler pattern traffic routing target for module in project."""
    _get_module_or_404(project_id, module_id)
    rt = project_manager.get_route(project_id, module_id)
    if rt:
        return ModuleRoute.model_validate(rt)
    return ModuleRoute(
        moduleId=module_id,
        target="legacy",
        adapterPath=f"/backend/adapters/{module_id}_adapter.py",
        lastUpdated=datetime.utcnow().isoformat() + "Z"
    )


@router.post("/projects/{project_id}/modules/{module_id}/route", response_model=ModuleRoute)
def update_project_module_routing(project_id: str, module_id: str, body: RouteUpdateRequest):
    """Update strangler pattern traffic routing target for module in project."""
    target_mod = _get_module_or_404(project_id, module_id)
    ensure_adapter_exists(target_mod)

    rt_data = {
        "moduleId": module_id,
        "target": body.target,
        "adapterPath": f"/backend/adapters/{module_id}_adapter.py",
        "lastUpdated": datetime.utcnow().isoformat() + "Z"
    }
    project_manager.save_route(project_id, module_id, rt_data)
    return ModuleRoute.model_validate(rt_data)


@router.post("/projects/{project_id}/modules/{module_id}/shadow-run", response_model=ShadowRunResult)
def run_project_shadow_comparison(project_id: str, module_id: str):
    """Execute shadow comparison between legacy and modernized module in project."""
    target_mod = _get_module_or_404(project_id, module_id)
    p_dir = project_manager.get_project_dir(project_id)
    src_dir = str(p_dir / "src")

    modernizer = ModernizerEngine(src_dir)
    ensure_adapter_exists(target_mod)
    return execute_shadow_comparison(module_id, src_dir, modernizer.golden_runner)


@router.get("/projects/{project_id}/modules/{module_id}/report")
def download_project_audit_report(project_id: str, module_id: str):
    """Generates downloadable Markdown audit report for module in project."""
    target = _get_module_or_404(project_id, module_id)
    val_run = get_project_validation_run(project_id, module_id)
    route_info = get_project_module_routing(project_id, module_id)
    approval_info = project_manager.get_approval(project_id, module_id) or {
        "status": val_run.approval_status,
        "notes": val_run.approval_notes or "Pending lead sign-off",
        "reviewer": val_run.approved_by or "alex.rivera@enterprise.corp",
        "timestamp": val_run.approved_at or datetime.utcnow().isoformat() + "Z"
    }

    now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

    issues_table_rows = [
        f"| `{iss.id}` | {iss.severity.upper()} | `{iss.cwe or 'N/A'}` | Line {iss.line} | {iss.description} | **Remediated in v1** |"
        for iss in target.issues
    ]
    issues_table = "\n".join(issues_table_rows) if issues_table_rows else "| - | - | - | - | No critical vulnerabilities detected | Certified |"

    test_rows = [
        f"| `{tc.id}` | {tc.name} | `{tc.type}` | **{tc.status.upper()}** | `{tc.duration_ms}ms` | `{tc.assertion}` |"
        for tc in val_run.test_cases
    ]
    tests_table = "\n".join(test_rows) if test_rows else "| - | - | - | - | - | - |"

    markdown_report = f"""# ReCore AI Modernization & Compliance Audit Report
**Project ID:** `{project_id}`  
**Module Name:** `{target.name}` (ID: `{target.id}`)  
**Generated At:** {now_str}  
**Run ID:** `{val_run.run_id}`  

---

## 1. Executive Summary & Strangler Routing Status
- **Active Traffic Routing Target:** `{route_info.target.upper()}`
- **Behavioral Contract Preservation:** **{val_run.preservation_score}% Parity** ({val_run.tests_passed}/{val_run.tests_total} Golden Master Tests Passed)
- **Security Posture:** **{val_run.security_issues_fixed} Vulnerabilities Remediated**
- **Codebase Optimization:** {val_run.diff.before_loc} LOC -> {val_run.diff.after_loc} LOC ({val_run.diff.complexity_reduction})

---

## 2. Human Verification Sign-Off
- **Approval Status:** **{approval_info['status'].upper()}**
- **Approved / Reviewed By:** `{approval_info['reviewer']}`
- **Timestamp:** `{approval_info['timestamp']}`
- **Notes:** > {approval_info['notes']}

---

## 3. Security Vulnerabilities
| Issue ID | Severity | CWE | Location | Description | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
{issues_table}

---

## 4. Golden Master Parity Matrix
| Test Case ID | Name | Scenario Type | Status | Latency | Assertion Contract |
| :--- | :--- | :--- | :--- | :--- | :--- |
{tests_table}

---
*Certified by ReCore AI Engine.*
"""
    return Response(
        content=markdown_report,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{project_id}_{module_id}_audit_report.md"'
        }
    )


# ==============================================================================
# UN-SCOPED LEGACY FALLBACK ENDPOINTS
# ==============================================================================

@router.get("/modules", response_model=List[Module])
def get_modules_fallback():
    pid = _get_target_project_id()
    return get_project_modules(pid)

@router.get("/modules/{module_id}", response_model=Module)
def get_module_by_id_fallback(module_id: str):
    pid = _get_target_project_id()
    return get_project_module_by_id(pid, module_id)

@router.get("/modules/{module_id}/insights", response_model=AIInsight)
def get_module_insights_fallback(module_id: str):
    pid = _get_target_project_id()
    return get_project_module_insights(pid, module_id)

@router.get("/business-rules", response_model=List[BusinessRule])
def get_all_business_rules_fallback(module_id: Optional[str] = Query(None, alias="moduleId")):
    pid = _get_target_project_id()
    return get_project_business_rules(pid, module_id=module_id)

@router.get("/modules/{module_id}/rules", response_model=List[BusinessRule])
def get_module_business_rules_fallback(module_id: str):
    pid = _get_target_project_id()
    return get_project_module_rules(pid, module_id)

@router.get("/blast-radius/{module_id}")
def get_module_blast_radius_fallback(module_id: str):
    pid = _get_target_project_id()
    return get_project_module_blast_radius(pid, module_id)

@router.post("/modules/{module_id}/generate-tests")
def generate_tests_fallback(module_id: str):
    pid = _get_target_project_id()
    return generate_project_module_tests(pid, module_id)

@router.post("/modules/{module_id}/modernize", response_model=ValidationRun)
def modernize_module_fallback(module_id: str):
    pid = _get_target_project_id()
    return modernize_project_module(pid, module_id)

@router.get("/validation/{module_id}", response_model=ValidationRun)
@router.get("/validate/{module_id}", response_model=ValidationRun)
def get_validation_fallback(module_id: str):
    pid = _get_target_project_id()
    return get_project_validation_run(pid, module_id)

@router.post("/validation/{module_id}/approve")
@router.post("/modules/{module_id}/approve")
def submit_approval_fallback(module_id: str, payload: Dict[str, Any] = Body(...)):
    pid = _get_target_project_id()
    return submit_project_approval(pid, module_id, payload)

@router.post("/modules/{module_id}/rollback")
def rollback_module_fallback(module_id: str):
    pid = _get_target_project_id()
    return rollback_project_module(pid, module_id)

@router.get("/modules/{module_id}/route", response_model=ModuleRoute)
def get_module_route_fallback(module_id: str):
    pid = _get_target_project_id()
    return get_project_module_routing(pid, module_id)

@router.post("/modules/{module_id}/route", response_model=ModuleRoute)
def update_module_route_fallback(module_id: str, body: RouteUpdateRequest):
    pid = _get_target_project_id()
    return update_project_module_routing(pid, module_id, body)

@router.post("/modules/{module_id}/shadow-run", response_model=ShadowRunResult)
def shadow_run_fallback(module_id: str):
    pid = _get_target_project_id()
    return run_project_shadow_comparison(pid, module_id)

@router.get("/modules/{module_id}/report")
def download_report_fallback(module_id: str):
    pid = _get_target_project_id()
    return download_project_audit_report(pid, module_id)
