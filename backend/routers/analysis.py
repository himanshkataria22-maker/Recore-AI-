"""
Codebase Analysis Trigger Router.
"""
from fastapi import APIRouter, Body
from typing import Dict, Any
import os

from ..analyzer.engine import CodebaseAnalyzer

router = APIRouter(tags=["analysis"])

LEGACY_APP_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_legacy_app")
analyzer = CodebaseAnalyzer(LEGACY_APP_PATH)

@router.post("/analyze")
def trigger_analysis(payload: Dict[str, Any] = Body(default_factory=dict)):
    """Triggers static analysis and risk graph synthesis."""
    source_path = payload.get("sourcePath") or LEGACY_APP_PATH
    custom_analyzer = CodebaseAnalyzer(source_path)
    modules = custom_analyzer.analyze(force_refresh=True)

    critical_issues = sum(len([i for i in m.issues if i.severity == "critical"]) for m in modules)

    return {
        "success": True,
        "totalModules": len(modules),
        "criticalIssues": critical_issues,
        "message": f"Successfully analyzed {len(modules)} modules."
    }
