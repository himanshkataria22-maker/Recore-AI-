"""
Project Summary, Dependency Graph, and Modernization Plan Routes.
"""
from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime
import os

from ..models.schema import (
    ProjectSummary,
    DependencyGraphData,
    DependencyGraphNode,
    DependencyGraphEdge,
    DependencyGraphPosition,
    ModernizationPlan,
    RiskDistributionItem,
    TopVulnerabilityItem,
    RecentActivityItem
)
from ..analyzer.engine import CodebaseAnalyzer
from ..planner.plan import generate_modernization_plan

router = APIRouter(tags=["project"])

LEGACY_APP_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "sample_legacy_app")
analyzer = CodebaseAnalyzer(LEGACY_APP_PATH)

@router.get("/project/summary", response_model=ProjectSummary)
def get_project_summary():
    """Calculates overall repository health, LOC, vulnerability breakdown, and metrics."""
    modules = analyzer.analyze()
    
    total_loc = sum(m.loc for m in modules)
    critical_count = sum(1 for m in modules if m.risk_level == "critical")
    high_count = sum(1 for m in modules if m.risk_level == "high")
    medium_count = sum(1 for m in modules if m.risk_level == "medium")
    low_count = sum(1 for m in modules if m.risk_level == "low")
    
    modernized_count = sum(1 for m in modules if m.status == "modernized")
    modernized_pct = round((modernized_count / len(modules) * 100), 1) if modules else 0.0
    
    avg_complexity = round(sum(m.complexity for m in modules) / len(modules), 1) if modules else 1.0
    
    # Calculate health score (0-100)
    avg_risk = sum(m.risk_score for m in modules) / len(modules) if modules else 50
    health_score = max(5, min(95, int(100 - avg_risk)))

    # Risk distribution
    risk_distribution = [
        RiskDistributionItem(level="critical", count=critical_count, color="#ef4444"),
        RiskDistributionItem(level="high", count=high_count, color="#f97316"),
        RiskDistributionItem(level="medium", count=medium_count, color="#eab308"),
        RiskDistributionItem(level="low", count=low_count, color="#22c55e"),
    ]

    # Aggregate top vulnerabilities
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
            type="approval",
            message="Modernization baseline verified for discounts.py with 100% test parity",
            timestamp="10 minutes ago",
            module_id="discounts"
        ),
        RecentActivityItem(
            id="ACT-02",
            type="analysis",
            message=f"Full AST dependency graph compiled ({len(modules)} modules analyzed)",
            timestamp="25 minutes ago"
        ),
        RecentActivityItem(
            id="ACT-03",
            type="warning",
            message="SQL Injection detected in billing.py and auth.py query routines",
            timestamp="1 hour ago",
            module_id="billing"
        )
    ]

    return ProjectSummary(
        name="LegacyBillingPython",
        repo="enterprise/legacy-billing-py",
        branch="main (v2.14-legacy)",
        last_analysis=datetime.utcnow().isoformat() + "Z",
        total_modules=len(modules),
        total_loc=total_loc,
        critical_risks=critical_count,
        high_risks=high_count,
        modernized_percent=modernized_pct,
        tests_passing_percent=95.4,
        avg_complexity=avg_complexity,
        overall_health_score=health_score,
        risk_distribution=risk_distribution,
        top_vulnerabilities=top_vulns,
        recent_activity=recent_activity
    )

@router.get("/graph", response_model=DependencyGraphData)
def get_dependency_graph():
    """Calculates node positions and edge connections for React Flow visualization."""
    modules = analyzer.analyze()

    positions: Dict[str, Dict[str, float]] = {
        "db_utils": {"x": 500, "y": 50},
        "config": {"x": 100, "y": 50},
        "auth": {"x": 220, "y": 180},
        "notification": {"x": 780, "y": 180},
        "discounts": {"x": 100, "y": 320},
        "tax_calculator": {"x": 380, "y": 320},
        "payment_gateway": {"x": 620, "y": 320},
        "subscription": {"x": 880, "y": 320},
        "billing": {"x": 500, "y": 480},
        "invoice": {"x": 280, "y": 640},
        "report": {"x": 720, "y": 640},
        "export_service": {"x": 500, "y": 780},
        "audit_log": {"x": 860, "y": 50},
        "app": {"x": 500, "y": 920}
    }

    nodes: List[DependencyGraphNode] = []
    for m in modules:
        pos = positions.get(m.id, {"x": 300, "y": 300})
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
            position=DependencyGraphPosition(x=pos["x"], y=pos["y"])
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

@router.get("/plan", response_model=ModernizationPlan)
def get_modernization_plan_route():
    """Returns prioritized modernization plan and effort projections."""
    modules = analyzer.analyze()
    return generate_modernization_plan(modules)
