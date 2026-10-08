"""
Codebase Analysis Trigger Router.
"""
from fastapi import APIRouter, Body, HTTPException
from typing import Dict, Any
from ..projects.manager import project_manager

router = APIRouter(tags=["analysis"])

@router.get("/projects/{project_id}/analysis")
def get_project_analysis(project_id: str):
    """Retrieves full analysis dataset for a project."""
    modules = project_manager.get_modules(project_id)
    if not modules:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found or empty.")
    
    critical_issues = sum(len([i for i in m.issues if i.severity == "critical"]) for m in modules)
    return {
        "projectId": project_id,
        "totalModules": len(modules),
        "criticalIssues": critical_issues,
        "modules": [m.model_dump(by_alias=True) for m in modules]
    }

@router.post("/projects/{project_id}/analysis")
def trigger_project_analysis(project_id: str):
    """Triggers fresh static analysis for a project."""
    meta = project_manager.get_project_meta(project_id)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    
    modules = project_manager.analyze_and_save(project_id)
    critical_issues = sum(len([i for i in m.issues if i.severity == "critical"]) for m in modules)
    
    return {
        "success": True,
        "projectId": project_id,
        "totalModules": len(modules),
        "criticalIssues": critical_issues,
        "message": f"Successfully analyzed {len(modules)} modules for project '{project_id}'."
    }

@router.post("/analyze")
def trigger_analysis(payload: Dict[str, Any] = Body(default_factory=dict)):
    """Legacy un-scoped analyze endpoint."""
    latest_id = project_manager.get_latest_project_id()
    if latest_id:
        return trigger_project_analysis(latest_id)
    raise HTTPException(status_code=404, detail="No project available for analysis.")
