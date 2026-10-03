export type RiskLevel = "low" | "medium" | "high" | "critical";

export type IssueType =
  | "sql_injection"
  | "hardcoded_secret"
  | "deprecated_api"
  | "no_tests"
  | "high_complexity";

export type ModuleStatus = "legacy" | "analyzing" | "modernized";

export interface Issue {
  id: string;
  type: IssueType;
  severity: RiskLevel;
  line: number;
  description: string;
  snippet?: string;
  remediation?: string;
  cwe?: string;
}

export interface BusinessRule {
  id: string;
  moduleId: string;
  moduleName?: string;
  plainEnglish: string;
  codeSnippet: string;
  line: number;
  confidence: number; // 0-100
  category?: "pricing" | "compliance" | "security" | "workflow" | "validation";
  implication?: string;
}

export interface Module {
  id: string;
  name: string;
  path: string;
  loc: number;
  complexity: number;
  hasTests: boolean;
  testCoverage?: number; // 0-100
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  issues: Issue[];
  dependsOn: string[]; // module ids
  usedBy: string[]; // module ids
  status: ModuleStatus;
  summary: string;
  rawCode?: string;
  aiExplanation?: string;
  modernizationRecommendation?: string;
  targetStack?: string;
  lastAnalyzed?: string;
}

export interface PlanItem {
  moduleId: string;
  moduleName: string;
  path: string;
  effortDays: number;
  riskReduction: number; // % reduction
  currentRiskScore: number;
  targetRiskScore: number;
  reason: string;
  prerequisites: string[];
  priorityScore: number; // 1-100
  businessValue: number; // 1-100
  recommendedAction: string;
}

export interface ModernizationPlan {
  projectId: string;
  generatedAt: string;
  totalEffortDays: number;
  projectedRiskReduction: number;
  order: PlanItem[];
}

export interface TestCaseResult {
  id: string;
  name: string;
  type: "regression" | "edge_case" | "invariant" | "security";
  status: "passed" | "failed" | "running";
  durationMs: number;
  assertion: string;
  inputSummary: string;
  outputSummary: string;
}

export interface ValidationRun {
  moduleId: string;
  moduleName: string;
  runId: string;
  timestamp: string;
  testsTotal: number;
  testsPassed: number;
  securityIssuesFixed: number;
  behaviorPreserved: boolean;
  preservationScore: number; // 0-100
  diff: {
    before: string;
    after: string;
    beforeLoc: number;
    afterLoc: number;
    complexityReduction: string;
  };
  testCases: TestCaseResult[];
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
}

export interface ProjectSummary {
  name: string;
  repo: string;
  branch: string;
  lastAnalysis: string;
  totalModules: number;
  totalLoc: number;
  criticalRisks: number;
  highRisks: number;
  modernizedPercent: number;
  testsPassingPercent: number;
  avgComplexity: number;
  overallHealthScore: number; // 0-100
  riskDistribution: {
    level: RiskLevel;
    count: number;
    color: string;
  }[];
  topVulnerabilities: {
    type: IssueType;
    count: number;
    severity: RiskLevel;
  }[];
  recentActivity: {
    id: string;
    type: "analysis" | "modernization" | "approval" | "warning";
    message: string;
    timestamp: string;
    moduleId?: string;
  }[];
}

export interface DependencyGraphNode {
  id: string;
  data: {
    label: string;
    path: string;
    riskScore: number;
    riskLevel: RiskLevel;
    loc: number;
    complexity: number;
    issuesCount: number;
    status: ModuleStatus;
    dependsOnCount: number;
    usedByCount: number;
  };
  position: { x: number; y: number };
}

export interface DependencyGraphEdge {
  id: string;
  source: string;
  target: string;
  animated?: boolean;
}

export interface DependencyGraphData {
  nodes: DependencyGraphNode[];
  edges: DependencyGraphEdge[];
}

export interface AIInsightRiskReason {
  reason: string;
  evidenceIssueId: string;
  line: number;
}

export interface AIInsight {
  moduleId: string;
  summary: string;
  whyRisky: AIInsightRiskReason[];
  suggestedFix: string;
  confidence: number;
}

export interface PlanExplanation {
  recommendedModuleId: string;
  moduleName: string;
  reason: string;
  details: string;
  blastRadiusScore: number;
  riskReduction: number;
  confidence: number;
}

export type RouteTarget = "legacy" | "modernized";

export interface ModuleRoute {
  moduleId: string;
  target: RouteTarget;
  adapterPath?: string;
  lastUpdated?: string;
}

export interface ShadowRunCase {
  id?: string;
  name?: string;
  input: string;
  legacyOutput: unknown;
  modernizedOutput: unknown;
  match: boolean;
  durationMs?: number;
}

export interface ShadowRunResult {
  moduleId: string;
  target: RouteTarget;
  totalCases: number;
  matchedCases: number;
  matchRate: number;
  cases: ShadowRunCase[];
  executedAt: string;
}

