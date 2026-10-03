"""
Modules, Business Rules, Test Generation, and Modernization Routes.
"""
from fastapi import APIRouter, HTTPException, Query, Body
from typing import List, Optional, Dict, Any
from datetime import datetime
import os

from ..models.schema import Module, BusinessRule, ValidationRun, TestCaseResult
from ..analyzer.engine import CodebaseAnalyzer
from ..extractor.rules import BusinessRuleExtractor
from ..tester.generator import TestGenerator
from ..modernizer.engine import ModernizerEngine
from ..planner.plan import calculate_blast_radius

router = APIRouter(tags=["modules"])

LEGACY_APP_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_legacy_app")
analyzer = CodebaseAnalyzer(LEGACY_APP_PATH)
rule_extractor = BusinessRuleExtractor()
test_gen = TestGenerator()
modernizer = ModernizerEngine(LEGACY_APP_PATH)

# In-memory store for validation runs and approvals
_VALIDATION_STORE: Dict[str, ValidationRun] = {}
_APPROVALS_STORE: Dict[str, Dict[str, Any]] = {}

@router.get("/modules", response_model=List[Module])
def get_modules():
    """Retrieve all discovered codebase modules."""
    return analyzer.analyze()

@router.get("/modules/{module_id}", response_model=Module)
def get_module_by_id(module_id: str):
    """Retrieve single module by ID."""
    modules = analyzer.analyze()
    for m in modules:
        if m.id == module_id:
            return m
    raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found.")

@router.get("/business-rules", response_model=List[BusinessRule])
def get_all_business_rules(module_id: Optional[str] = Query(None, alias="moduleId")):
    """Retrieve extracted business rules for all modules or a specific module."""
    modules = analyzer.analyze()
    rules: List[BusinessRule] = []
    
    target_modules = [m for m in modules if m.id == module_id] if module_id else modules
    for m in target_modules:
        mod_rules = rule_extractor.extract_business_rules(m)
        rules.extend(mod_rules)
        
    return rules

@router.get("/modules/{module_id}/rules", response_model=List[BusinessRule])
def get_module_business_rules(module_id: str):
    """Retrieve business rules for a specific module."""
    return get_all_business_rules(module_id=module_id)

@router.get("/blast-radius/{module_id}")
def get_module_blast_radius(module_id: str):
    """Calculate blast radius and transitive dependencies."""
    modules = analyzer.analyze()
    return calculate_blast_radius(modules, module_id)

@router.post("/modules/{module_id}/generate-tests")
def generate_tests_for_module(module_id: str):
    """Generate behavioral test suite for a module."""
    modules = analyzer.analyze()
    target = next((m for m in modules if m.id == module_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found.")
        
    cases = test_gen.generate_behavior_tests(target)
    return {"moduleId": module_id, "casesTotal": len(cases), "cases": cases}

@router.post("/modules/{module_id}/modernize", response_model=ValidationRun)
def modernize_single_module(module_id: str):
    """Run automated modernization, golden master test verification, and produce ValidationRun."""
    modules = analyzer.analyze()
    target = next((m for m in modules if m.id == module_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found.")
        
    val_run = modernizer.modernize_module(target)
    _VALIDATION_STORE[module_id] = val_run
    return val_run

@router.get("/validation/{module_id}", response_model=ValidationRun)
@router.get("/validate/{module_id}", response_model=ValidationRun)
def get_validation_run(module_id: str):
    """Get latest validation run results and parity proofs for a module."""
    if module_id in _VALIDATION_STORE:
        return _VALIDATION_STORE[module_id]
        
    # If not yet generated, modernize and return
    modules = analyzer.analyze()
    target = next((m for m in modules if m.id == module_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Module '{module_id}' not found.")
        
    val_run = modernizer.modernize_module(target)
    _VALIDATION_STORE[module_id] = val_run
    return val_run

@router.post("/validation/{module_id}/approve")
@router.post("/modules/{module_id}/approve")
def submit_approval(
    module_id: str,
    payload: Dict[str, Any] = Body(...)
):
    """Submit human approval / rejection sign-off for modernized module."""
    status = payload.get("status", "approved")
    notes = payload.get("notes", "Developer sign-off.")
    reviewer = payload.get("reviewerName", "alex.rivera@enterprise.corp")
    now_iso = datetime.utcnow().isoformat() + "Z"

    if module_id in _VALIDATION_STORE:
        val_run = _VALIDATION_STORE[module_id]
        val_run.approval_status = status
        val_run.approval_notes = notes
        val_run.approved_by = reviewer
        val_run.approved_at = now_iso

    _APPROVALS_STORE[module_id] = {
        "status": status,
        "notes": notes,
        "reviewer": reviewer,
        "timestamp": now_iso
    }

    return {
        "success": True,
        "message": f"Module {module_id} successfully {status}. Sign-off logged in audit vault.",
        "timestamp": now_iso
    }

@router.post("/modules/{module_id}/rollback")
def rollback_module(module_id: str):
    """Rollback modernized module to legacy v0 baseline."""
    success = modernizer.rollback_module(module_id)
    if not success:
        raise HTTPException(status_code=400, detail=f"Failed to rollback module '{module_id}'.")
        
    if module_id in _VALIDATION_STORE:
        del _VALIDATION_STORE[module_id]

    return {
        "success": True,
        "message": f"Module {module_id} has been safely rolled back to legacy baseline. Git branch updated."
    }
