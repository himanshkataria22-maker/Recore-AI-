import {
  Module,
  BusinessRule,
  ModernizationPlan,
  PlanExplanation,
  ValidationRun,
  ProjectSummary,
  DependencyGraphData,
  DependencyGraphNode,
  DependencyGraphEdge,
  AIInsight,
  ModuleRoute,
  RouteTarget,
  ShadowRunResult,
} from "./types";

import mockModules from "./mock/modules.json";
import mockBusinessRules from "./mock/business_rules.json";
import mockPlan from "./mock/modernization_plan.json";
import mockValidations from "./mock/validations.json";
import mockSummary from "./mock/summary.json";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "true";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch high-level project summary and risk distribution
 */
export async function getProjectSummary(projectId: string): Promise<ProjectSummary> {
  if (USE_MOCK) {
    await delay(120);
    return mockSummary as unknown as ProjectSummary;
  }
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/summary`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch summary for project ${projectId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch all discovered codebase modules for a project
 */
export async function getModules(projectId: string): Promise<Module[]> {
  if (USE_MOCK) {
    await delay(150);
    return mockModules as unknown as Module[];
  }
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch modules for project ${projectId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch single module details by ID within a project
 */
export async function getModuleById(projectId: string, id: string): Promise<Module | null> {
  if (USE_MOCK) {
    await delay(100);
    const found = (mockModules as unknown as Module[]).find((m) => m.id === id);
    return found || null;
  }
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch module ${id} for project ${projectId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch dependency graph nodes and edges for React Flow visualization
 */
export async function getDependencyGraph(projectId: string): Promise<DependencyGraphData> {
  if (USE_MOCK) {
    await delay(150);
    const modules = mockModules as unknown as Module[];
    const nodes: DependencyGraphNode[] = modules.map((m, idx) => ({
      id: m.id,
      data: {
        label: m.name,
        path: m.path,
        riskScore: m.riskScore,
        riskLevel: m.riskLevel,
        loc: m.loc,
        complexity: m.complexity,
        issuesCount: m.issues.length,
        status: m.status,
        dependsOnCount: m.dependsOn.length,
        usedByCount: m.usedBy.length,
      },
      position: { x: (idx % 3) * 300 + 100, y: Math.floor(idx / 3) * 180 + 80 },
    }));

    const edges: DependencyGraphEdge[] = [];
    modules.forEach((mod) => {
      mod.dependsOn.forEach((depId) => {
        edges.push({
          id: `edge-${mod.id}->${depId}`,
          source: mod.id,
          target: depId,
          animated: mod.riskScore > 80,
        });
      });
    });

    return { nodes, edges };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/graph`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch dependency graph for project ${projectId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch business rules extracted by AI AST analysis
 */
export async function getBusinessRules(projectId: string, moduleId?: string): Promise<BusinessRule[]> {
  if (USE_MOCK) {
    await delay(120);
    const rules = mockBusinessRules as unknown as BusinessRule[];
    if (moduleId) return rules.filter((r) => r.moduleId === moduleId);
    return rules;
  }
  const url = moduleId
    ? `${API_BASE_URL}/projects/${projectId}/business-rules?moduleId=${moduleId}`
    : `${API_BASE_URL}/projects/${projectId}/business-rules`;
  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch business rules: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch the prioritized Modernization Plan & timeline
 */
export async function getModernizationPlan(projectId: string): Promise<ModernizationPlan> {
  if (USE_MOCK) {
    await delay(140);
    return mockPlan as unknown as ModernizationPlan;
  }
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/plan`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch modernization plan for project ${projectId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch validation run results, parity proofs, and test executions
 */
export async function getValidationRun(projectId: string, moduleId: string): Promise<ValidationRun | null> {
  if (USE_MOCK) {
    await delay(180);
    const validations = mockValidations as Record<string, Record<string, unknown>>;
    const projectValidations = validations[projectId];
    if (!projectValidations) return null;
    const run = projectValidations[moduleId] as ValidationRun | undefined;
    if (!run) return null;
    return run;
  }
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/validation`);
  if (!res.ok) {
    if (res.status === 404) return null;
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch validation for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Submit human sign-off (Approve / Reject) for modernized module
 */
export async function submitApproval(
  projectId: string,
  moduleId: string,
  status: "approved" | "rejected",
  notes: string,
  reviewerName: string = "alex.rivera@enterprise.corp"
): Promise<{ success: boolean; message: string; timestamp: string }> {
  if (USE_MOCK) {
    await delay(300);
    return {
      success: true,
      message: `Module ${moduleId} successfully ${status}. Sign-off logged.`,
      timestamp: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes, reviewerName }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to submit approval: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Rollback module modernization to legacy version
 */
export async function rollbackModule(
  projectId: string,
  moduleId: string
): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await delay(350);
    return {
      success: true,
      message: `Module ${moduleId} has been safely rolled back to legacy baseline.`,
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/rollback`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to rollback module: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch blast radius impact and transitive dependents for a module
 */
export async function getBlastRadius(
  projectId: string,
  moduleId: string
): Promise<{
  moduleId: string;
  directDependents: string[];
  transitiveDependents: string[];
  totalAffectedModules: number;
  impactScore: number;
  riskLevel: string;
}> {
  if (USE_MOCK) {
    await delay(120);
    const modules = mockModules as unknown as Module[];
    const mod = modules.find((m) => m.id === moduleId);
    const direct = mod ? mod.usedBy : [];
    return {
      moduleId,
      directDependents: direct,
      transitiveDependents: [],
      totalAffectedModules: direct.length,
      impactScore: Math.min(95, direct.length * 20),
      riskLevel: direct.length > 3 ? "critical" : direct.length > 1 ? "high" : "medium",
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/blast-radius/${moduleId}`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch blast radius for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Trigger behavioral test generation for a module
 */
export async function generateModuleTests(
  projectId: string,
  moduleId: string
): Promise<{
  moduleId: string;
  casesTotal: number;
  cases: Array<{
    id: string;
    name: string;
    function: string;
    args: unknown[];
    kwargs: Record<string, unknown>;
    type: string;
    note: string;
  }>;
}> {
  if (USE_MOCK) {
    await delay(250);
    return {
      moduleId,
      casesTotal: 4,
      cases: [
        {
          id: "TC-01",
          name: `Contract verification for ${moduleId}`,
          function: "main_routine",
          args: ["sample_id"],
          kwargs: {},
          type: "regression",
          note: "Base regression parity case",
        },
      ],
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/generate-tests`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to generate tests for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Trigger end-to-end modernization and golden master verification
 */
export async function modernizeModule(projectId: string, moduleId: string): Promise<ValidationRun> {
  if (USE_MOCK) {
    await delay(600);
    const run = await getValidationRun(projectId, moduleId);
    if (!run) throw new Error(`Module ${moduleId} validation not found`);
    return run;
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/modernize`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Modernization failed for module ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch grounded, fact-checked explainable AI insights for a module
 */
export async function getModuleInsights(projectId: string, moduleId: string): Promise<AIInsight> {
  if (USE_MOCK) {
    await delay(200);
    return {
      moduleId,
      summary: `Module ${moduleId}.py static security posture and dependency analysis.`,
      whyRisky: [],
      suggestedFix: "Refactor module using Pydantic v2 schemas and parameterized queries.",
      confidence: 95,
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/insights`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch AI insights for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch explainable reason for Modernization Planner
 */
export async function getPlanExplanation(projectId: string): Promise<PlanExplanation> {
  if (USE_MOCK) {
    await delay(150);
    return {
      recommendedModuleId: "discounts",
      moduleName: "discounts.py",
      reason: "Ranked #1 due to zero unresolved dependencies and high risk reduction.",
      details: "1. Zero Blocker Architecture\n2. Security Impact\n3. High Parity Confidence",
      blastRadiusScore: 45,
      riskReduction: 85,
      confidence: 98,
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/plan/explain`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch plan explanation: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Fetch current strangler pattern traffic routing target
 */
export async function getModuleRoute(projectId: string, moduleId: string): Promise<ModuleRoute> {
  if (USE_MOCK) {
    await delay(100);
    return {
      moduleId,
      target: "legacy",
      adapterPath: `/backend/adapters/${moduleId}_adapter.py`,
      lastUpdated: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/route`);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to fetch route for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Update strangler pattern traffic routing target
 */
export async function updateModuleRoute(
  projectId: string,
  moduleId: string,
  target: RouteTarget
): Promise<ModuleRoute> {
  if (USE_MOCK) {
    await delay(200);
    return {
      moduleId,
      target,
      adapterPath: `/backend/adapters/${moduleId}_adapter.py`,
      lastUpdated: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to update route for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Run shadow comparison across golden master tests
 */
export async function runShadowComparison(projectId: string, moduleId: string): Promise<ShadowRunResult> {
  if (USE_MOCK) {
    await delay(400);
    return {
      moduleId,
      target: "modernized",
      totalCases: 4,
      matchedCases: 4,
      matchRate: 100.0,
      cases: [],
      executedAt: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/shadow-run`, {
    method: "POST",
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Shadow comparison failed for ${moduleId}: ${res.status} ${errorText}`);
  }
  return res.json();
}

/**
 * Trigger download of audit report
 */
export async function downloadAuditReport(projectId: string, moduleId: string): Promise<void> {
  const url = `${API_BASE_URL}/projects/${projectId}/modules/${moduleId}/report`;
  if (USE_MOCK) {
    const markdown = `# Modernization Audit Report for ${moduleId}\n`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${projectId}_${moduleId}_audit_report.md`;
    a.click();
    URL.revokeObjectURL(blobUrl);
    return;
  }

  const res = await fetch(url);
  if (!res.ok) {
    const errorText = await res.text().catch(() => "");
    throw new Error(`Failed to download audit report: ${res.status} ${errorText}`);
  }
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${projectId}_${moduleId}_audit_report.md`;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

/**
 * Upload a .zip file containing a Python project for analysis
 */
export async function uploadProjectZip(
  file: File,
  onProgress?: (progress: number, status: string) => void
): Promise<{
  projectId: string;
  name: string;
  status: string;
  filesExtracted: number;
  filesSkipped: number;
  message: string;
}> {
  const formData = new FormData();
  formData.append("file", file);

  if (onProgress) onProgress(10, "Uploading archive...");

  const res = await fetch(`${API_BASE_URL}/projects/upload`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(error.detail || "Upload failed");
  }

  if (onProgress) onProgress(100, "Upload complete!");

  return res.json();
}

/**
 * Get the status of a project analysis
 */
export async function getProjectStatus(projectId: string): Promise<{
  projectId: string;
  name: string;
  status: "queued" | "analyzing" | "done" | "failed";
  progress: number;
  filesExtracted: number;
  filesSkipped: number;
  moduleCount: number;
  error?: string;
  createdAt: string;
  completedAt?: string;
}> {
  const res = await fetch(`${API_BASE_URL}/projects/${projectId}/status`);
  if (!res.ok) throw new Error(`Failed to get status for project ${projectId}`);
  return res.json();
}

/**
 * List all uploaded projects
 */
export async function listProjects(): Promise<{
  projects: Array<{
    projectId: string;
    name: string;
    status: string;
    moduleCount: number;
    createdAt: string;
  }>;
  total: number;
}> {
  const res = await fetch(`${API_BASE_URL}/projects`);
  if (!res.ok) throw new Error("Failed to list projects");
  return res.json();
}

/**
 * Fetch backend health status
 */
export async function getHealthStatus(): Promise<{
  status: string;
  service: string;
  demoMode: boolean;
  cacheServing?: boolean;
  version: string;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  } catch {
    return {
      status: "unreachable",
      service: "recore-ai-backend",
      demoMode: false,
      version: "unknown",
    };
  }
}
