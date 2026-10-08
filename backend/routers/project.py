"""
Project Summary, Dependency Graph, and Modernization Plan Routes (Project Scoped).
"""
from fastapi import APIRouter, HTTPException, Path as APIPath
from typing import List, Dict, Any, Optional
from datetime import datetime
import os

from ..models.schema import (
    ProjectSummary,
    DependencyGraphData,
    DependencyGraphNode,
    DependencyGraphEdge,
    DependencyGraphPosition,
    ModernizationPlan,
    PlanExplanation,
    RiskDistributionItem,
    TopVulnerabilityItem,
    RecentActivityItem
)
from ..projects.manager import project_manager
from ..planner.plan import generate_modernization_plan, explain_plan_recommendation

router = APIRouter(tags=["project"])


def _compute_summary(project_id: str) -> ProjectSummary:
    meta = project_manager.get_project_meta(project_id)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")

    modules = project_manager.get_modules(project_id)
    project_name = meta.get("name", project_id)

    total_loc = sum(m.loc for m in modules)
    critical_count = sum(1 for m in modules if m.risk_level == "critical")
    high_count = sum(1 for m in modules if m.risk_level == "high")
    medium_count = sum(1 for m in modules if m.risk_level == "medium")
    low_count = sum(1 for m in modules if m.risk_level == "low")

    modernized_count = sum(1 for m in modules if m.status == "modernized")
    modernized_pct = round((modernized_count / len(modules) * 100), 1) if modules else 0.0

    avg_complexity = round(sum(m.complexity for m in modules) / len(modules), 1) if modules else 1.0

    avg_risk = sum(m.risk_score for m in modules) / len(modules) if modules else 50
    health_score = max(5, min(95, int(100 - avg_risk)))

    risk_distribution = [
        RiskDistributionItem(level="critical", count=critical_count, color="#ef4444"),
        RiskDistributionItem(level="high", count=high_count, color="#f97316"),
        RiskDistributionItem(level="medium", count=medium_count, color="#eab308"),
        RiskDistributionItem(level="low", count=low_count, color="#22c55e"),
    ]

    vuln_map = {}
    for m in modules:
        for iss in m.issues:
            if iss.type not in vuln_map:
                vuln_map[iss.type] = {"count": 0, "severity": iss.severity}
            vuln_map[iss.type]["count"] += 1
            if iss.severity == "critical":
                vuln_map[iss.type]["severity"] = "critical"

    top_vulns = [
        TopVulnerabilityItem(type=k, count=v["count"], severity=v["severity"])
        for k, v in sorted(vuln_map.items(), key=lambda x: x[1]["count"], reverse=True)
    ]

    recent_activity = [
        RecentActivityItem(
            id="ACT-01",
            type="analysis",
            message=f"AST analysis completed for '{project_name}' ({len(modules)} modules indexed)",
            timestamp="Just now"
        )
    ]

    return ProjectSummary(
        name=project_name,
        repo=f"project/{project_id}",
        branch="main",
        last_analysis=meta.get("completedAt", datetime.utcnow().isoformat() + "Z"),
        total_modules=len(modules),
        total_loc=total_loc,
        critical_risks=critical_count,
        high_risks=high_count,
        modernized_percent=modernized_pct,
        tests_passing_percent=0.0,  # Computed from real tests when run
        avg_complexity=avg_complexity,
        overall_health_score=health_score,
        risk_distribution=risk_distribution,
        top_vulnerabilities=top_vulns,
        recent_activity=recent_activity
    )


def _compute_graph(project_id: str) -> DependencyGraphData:
    modules = project_manager.get_modules(project_id)
    if not modules:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")

    # Calculate grid positions cleanly for any project modules
    nodes: List[DependencyGraphNode] = []
    cols = 3
    for idx, m in enumerate(modules):
        x_pos = (idx % cols) * 320 + 100
        y_pos = (idx // cols) * 180 + 80
        node = DependencyGraphNode(
            id=m.id,
            data={
                "label": m.name,
                "path": m.path,
                "riskScore": m.risk_score,
                "riskLevel": m.risk_level,
                "loc": m.loc,
                "complexity": m.complexity,
                "issuesCount": len(m.issues),
                "status": m.status,
                "dependsOnCount": len(m.depends_on),
                "usedByCount": len(m.used_by),
            },
            position=DependencyGraphPosition(x=x_pos, y=y_pos)
        )
        nodes.append(node)

    edges: List[DependencyGraphEdge] = []
    for m in modules:
        for dep in m.depends_on:
            edges.append(DependencyGraphEdge(
                id=f"edge-{m.id}->{dep}",
                source=m.id,
                target=dep,
                animated=(m.risk_score >= 80)
            ))

    return DependencyGraphData(nodes=nodes, edges=edges)


# Project Scoped Routes
@router.get("/projects/{project_id}/summary", response_model=ProjectSummary)
def get_project_summary_scoped(project_id: str):
    return _compute_summary(project_id)

@router.get("/projects/{project_id}/graph", response_model=DependencyGraphData)
def get_dependency_graph_scoped(project_id: str):
    return _compute_graph(project_id)

@router.get("/projects/{project_id}/plan", response_model=ModernizationPlan)
def get_modernization_plan_scoped(project_id: str):
    modules = project_manager.get_modules(project_id)
    if not modules:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    return generate_modernization_plan(modules)

@router.get("/projects/{project_id}/plan/explain", response_model=PlanExplanation)
def get_plan_explanation_scoped(project_id: str):
    modules = project_manager.get_modules(project_id)
    if not modules:
        raise HTTPException(status_code=404, detail=f"Project '{project_id}' not found.")
    return explain_plan_recommendation(modules)


# Legacy / Un-scoped Fallback Routes (Target active project)
@router.get("/project/summary", response_model=ProjectSummary)
def get_project_summary_fallback():
    latest_id = project_manager.get_latest_project_id()
    if not latest_id:
        raise HTTPException(status_code=404, detail="No project has been uploaded yet.")
    return _compute_summary(latest_id)

@router.get("/graph", response_model=DependencyGraphData)
def get_dependency_graph_fallback():
    latest_id = project_manager.get_latest_project_id()
    if not latest_id:
        raise HTTPException(status_code=404, detail="No project has been uploaded yet.")
    return _compute_graph(latest_id)

@router.get("/plan", response_model=ModernizationPlan)
def get_modernization_plan_fallback():
    latest_id = project_manager.get_latest_project_id()
    if not latest_id:
        raise HTTPException(status_code=404, detail="No project has been uploaded yet.")
    return get_modernization_plan_scoped(latest_id)

@router.get("/plan/explain", response_model=PlanExplanation)
def get_plan_explanation_fallback():
    latest_id = project_manager.get_latest_project_id()
    if not latest_id:
        raise HTTPException(status_code=404, detail="No project has been uploaded yet.")
    return get_plan_explanation_scoped(latest_id)
