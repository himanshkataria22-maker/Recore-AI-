"""
Pydantic v2 Models matching TypeScript /lib/types.ts with camelCase serialization.
"""
from typing import List, Optional, Literal, Dict, Any
from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel

RiskLevel = Literal["low", "medium", "high", "critical"]
IssueType = Literal[
    "sql_injection",
    "hardcoded_secret",
    "deprecated_api",
    "no_tests",
    "high_complexity"
]
ModuleStatus = Literal["legacy", "analyzing", "modernized"]

class CamelBaseModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        from_attributes=True
    )

class Issue(CamelBaseModel):
    id: str
    type: IssueType
    severity: RiskLevel
    line: int
    description: str
    snippet: Optional[str] = None
    remediation: Optional[str] = None
    cwe: Optional[str] = None

class BusinessRule(CamelBaseModel):
    id: str
    module_id: str
    module_name: Optional[str] = None
    plain_english: str
    code_snippet: str
    line: int
    confidence: int  # 0-100
    category: Optional[Literal["pricing", "compliance", "security", "workflow", "validation"]] = "pricing"
    implication: Optional[str] = None

class Module(CamelBaseModel):
    id: str
    name: str
    path: str
    loc: int
    complexity: int
    has_tests: bool
    test_coverage: Optional[int] = 0
    risk_score: int
    risk_level: RiskLevel
    issues: List[Issue] = []
    depends_on: List[str] = []
    used_by: List[str] = []
    status: ModuleStatus = "legacy"
    summary: str
    raw_code: Optional[str] = None
    ai_explanation: Optional[str] = None
    modernization_recommendation: Optional[str] = None
    target_stack: Optional[str] = None
    last_analyzed: Optional[str] = None

class PlanItem(CamelBaseModel):
    module_id: str
    module_name: str
    path: str
    effort_days: float
    risk_reduction: int
    current_risk_score: int
    target_risk_score: int
    reason: str
    prerequisites: List[str] = []
    priority_score: int
    business_value: int
    recommended_action: str

class ModernizationPlan(CamelBaseModel):
    project_id: str
    generated_at: str
    total_effort_days: float
    projected_risk_reduction: int
    order: List[PlanItem]

class TestCaseResult(CamelBaseModel):
    id: str
    name: str
    type: Literal["regression", "edge_case", "invariant", "security"]
    status: Literal["passed", "failed", "running"]
    duration_ms: int
    assertion: str
    input_summary: str
    output_summary: str

class ValidationRunDiff(CamelBaseModel):
    before: str
    after: str
    before_loc: int
    after_loc: int
    complexity_reduction: str

class ValidationRun(CamelBaseModel):
    module_id: str
    module_name: str
    run_id: str
    timestamp: str
    tests_total: int
    tests_passed: int
    security_issues_fixed: int
    behavior_preserved: bool
    preservation_score: int
    diff: ValidationRunDiff
    test_cases: List[TestCaseResult] = []
    approval_status: Literal["pending", "approved", "rejected"] = "pending"
    approval_notes: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[str] = None

class RiskDistributionItem(CamelBaseModel):
    level: RiskLevel
    count: int
    color: str

class TopVulnerabilityItem(CamelBaseModel):
    type: IssueType
    count: int
    severity: RiskLevel

class RecentActivityItem(CamelBaseModel):
    id: str
    type: Literal["analysis", "modernization", "approval", "warning"]
    message: str
    timestamp: str
    module_id: Optional[str] = None

class ProjectSummary(CamelBaseModel):
    name: str
    repo: str
    branch: str
    last_analysis: str
    total_modules: int
    total_loc: int
    critical_risks: int
    high_risks: int
    modernized_percent: float
    tests_passing_percent: float
    avg_complexity: float
    overall_health_score: int
    risk_distribution: List[RiskDistributionItem]
    top_vulnerabilities: List[TopVulnerabilityItem]
    recent_activity: List[RecentActivityItem]

class DependencyGraphNodeData(CamelBaseModel):
    label: str
    path: str
    risk_score: int
    risk_level: RiskLevel
    loc: int
    complexity: int
    issues_count: int
    status: ModuleStatus
    depends_on_count: int
    used_by_count: int

class DependencyGraphPosition(CamelBaseModel):
    x: float
    y: float

class DependencyGraphNode(CamelBaseModel):
    id: str
    data: DependencyGraphNodeData
    position: DependencyGraphPosition

class DependencyGraphEdge(CamelBaseModel):
    id: str
    source: str
    target: str
    animated: Optional[bool] = False

class DependencyGraphData(CamelBaseModel):
    nodes: List[DependencyGraphNode]
    edges: List[DependencyGraphEdge]
