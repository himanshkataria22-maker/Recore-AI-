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


// Helper for simulated latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch high-level project summary and risk distribution
 */
export async function getProjectSummary(): Promise<ProjectSummary> {
  if (USE_MOCK) {
    await delay(120);
    return mockSummary as unknown as ProjectSummary;
  }
  const res = await fetch(`${API_BASE_URL}/project/summary`);
  if (!res.ok) throw new Error("Failed to fetch project summary");
  return res.json();
}

/**
 * Fetch all discovered codebase modules with risks and dependencies
 */
export async function getModules(): Promise<Module[]> {
  if (USE_MOCK) {
    await delay(150);
    return mockModules as unknown as Module[];
  }
  const res = await fetch(`${API_BASE_URL}/modules`);
  if (!res.ok) throw new Error("Failed to fetch modules");
  return res.json();
}

/**
 * Fetch single module details by ID
 */
export async function getModuleById(id: string): Promise<Module | null> {
  if (USE_MOCK) {
    await delay(100);
    const found = (mockModules as unknown as Module[]).find((m) => m.id === id);
    return found || null;
  }
  const res = await fetch(`${API_BASE_URL}/modules/${id}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch module ${id}`);
  }
  return res.json();
}

/**
 * Fetch dependency graph nodes and edges for React Flow visualization
 */
export async function getDependencyGraph(): Promise<DependencyGraphData> {
  if (USE_MOCK) {
    await delay(150);
    const modules = mockModules as unknown as Module[];

    // Position calculation layout (Hierarchical/grid placement for clean initial render)
    const positions: Record<string, { x: number; y: number }> = {
      db_utils: { x: 500, y: 50 },
      auth: { x: 220, y: 180 },
      notification: { x: 780, y: 180 },
      discounts: { x: 100, y: 320 },
      tax_calculator: { x: 380, y: 320 },
      payment_gateway: { x: 620, y: 320 },
      subscription: { x: 880, y: 320 },
      billing: { x: 500, y: 480 },
      invoice: { x: 280, y: 640 },
      report: { x: 720, y: 640 },
      export_service: { x: 500, y: 780 },
      audit_log: { x: 860, y: 50 },
    };

    const nodes: DependencyGraphNode[] = modules.map((m) => ({
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
      position: positions[m.id] || { x: Math.random() * 600, y: Math.random() * 500 },
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

  const res = await fetch(`${API_BASE_URL}/graph`);
  if (!res.ok) throw new Error("Failed to fetch dependency graph");
  return res.json();
}

/**
 * Fetch business rules extracted by AI AST analysis
 */
export async function getBusinessRules(moduleId?: string): Promise<BusinessRule[]> {
  if (USE_MOCK) {
    await delay(120);
    const rules = mockBusinessRules as unknown as BusinessRule[];
    if (moduleId) {
      return rules.filter((r) => r.moduleId === moduleId);
    }
    return rules;
  }
  const url = moduleId
    ? `${API_BASE_URL}/business-rules?moduleId=${moduleId}`
    : `${API_BASE_URL}/business-rules`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch business rules");
  return res.json();
}

/**
 * Fetch the prioritized Modernization Plan & timeline
 */
export async function getModernizationPlan(): Promise<ModernizationPlan> {
  if (USE_MOCK) {
    await delay(140);
    return mockPlan as unknown as ModernizationPlan;
  }
  const res = await fetch(`${API_BASE_URL}/plan`);
  if (!res.ok) throw new Error("Failed to fetch modernization plan");
  return res.json();
}

/**
 * Fetch validation run results, parity proofs, and test executions
 */
export async function getValidationRun(moduleId: string): Promise<ValidationRun | null> {
  if (USE_MOCK) {
    await delay(180);
    const validations = mockValidations as Record<string, unknown>;
    const run = validations[moduleId] as ValidationRun | undefined;
    
    // Fallback dynamic validation run if specific module not in static mock
    if (!run) {
      const moduleMeta = (mockModules as unknown as Module[]).find((m) => m.id === moduleId);
      if (!moduleMeta) return null;

      return {
        moduleId: moduleMeta.id,
        moduleName: moduleMeta.name,
        runId: `VAL-GEN-${moduleId.toUpperCase()}-2026`,
        timestamp: new Date().toISOString(),
        testsTotal: 28,
        testsPassed: 28,
        securityIssuesFixed: moduleMeta.issues.length,
        behaviorPreserved: true,
        preservationScore: 100,
        diff: {
          beforeLoc: moduleMeta.loc,
          afterLoc: Math.round(moduleMeta.loc * 0.45),
          complexityReduction: `${moduleMeta.complexity} → 4 (-${Math.round((1 - 4/moduleMeta.complexity)*100)}%)`,
          before: moduleMeta.rawCode || "# Legacy module code",
          after: `# Modernized ${moduleMeta.name} (Pydantic v2 + Async Architecture)\n# All ${moduleMeta.issues.length} security vulnerabilities remediated\n\n# Verified behavior parity with 28 automated test assertions`,
        },
        testCases: [
          {
            id: `TC-${moduleId}-01`,
            name: `Functional contract parity for ${moduleMeta.name}`,
            type: "regression",
            status: "passed",
            durationMs: 34,
            assertion: "assert legacy_output == modern_output",
            inputSummary: "Standard production payload sample",
            outputSummary: "100% parameter and return signature match",
          },
          {
            id: `TC-${moduleId}-02`,
            name: "Security vulnerability remediation assertion",
            type: "security",
            status: "passed",
            durationMs: 42,
            assertion: "assert vulnerability_check_passed() == True",
            inputSummary: "Malicious injection payload",
            outputSummary: "Safely handled and sanitized",
          }
        ],
        approvalStatus: "pending",
        approvalNotes: "Automated synthesis complete. Ready for developer sign-off.",
      };
    }
    return run;
  }

  const res = await fetch(`${API_BASE_URL}/validation/${moduleId}`);
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error(`Failed to fetch validation for ${moduleId}`);
  }
  return res.json();
}

/**
 * Submit human sign-off (Approve / Reject) for modernized module
 */
export async function submitApproval(
  moduleId: string,
  status: "approved" | "rejected",
  notes: string,
  reviewerName: string = "alex.rivera@enterprise.corp"
): Promise<{ success: boolean; message: string; timestamp: string }> {
  if (USE_MOCK) {
    await delay(300);
    return {
      success: true,
      message: `Module ${moduleId} successfully ${status}. Sign-off logged in audit vault.`,
      timestamp: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/validation/${moduleId}/approve`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, notes, reviewerName }),
  });
  if (!res.ok) throw new Error("Failed to submit approval");
  return res.json();
}

/**
 * Rollback module modernization to legacy version
 */
export async function rollbackModule(
  moduleId: string
): Promise<{ success: boolean; message: string }> {
  if (USE_MOCK) {
    await delay(350);
    return {
      success: true,
      message: `Module ${moduleId} has been safely rolled back to legacy baseline. Git branch updated.`,
    };
  }

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/rollback`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to rollback module");
  return res.json();
}

/**
 * Trigger analysis of legacy zip or git repo with progress callback
 */
export async function triggerAnalysis(
  sourceName: string,
  onProgress?: (step: string, percent: number) => void
): Promise<{ success: boolean; totalModules: number; criticalIssues: number }> {
  if (USE_MOCK) {
    const steps = [
      { text: "Unpacking archive and parsing AST syntax trees...", pct: 20 },
      { text: "Executing static security analysis (Semgrep & Bandit rules)...", pct: 45 },
      { text: "Extracting hidden business rules with LLM AST decompiler...", pct: 70 },
      { text: "Constructing dependency graph & calculating blast radius...", pct: 90 },
      { text: "Synthesizing prioritized modernization plan...", pct: 100 },
    ];

    for (const step of steps) {
      if (onProgress) onProgress(step.text, step.pct);
      await delay(600);
    }

    return {
      success: true,
      totalModules: 12,
      criticalIssues: 6,
    };
  }

  const res = await fetch(`${API_BASE_URL}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ source: sourceName }),
  });
  if (!res.ok) throw new Error("Analysis failed");
  return res.json();
}

/**
 * Fetch blast radius impact and transitive dependents for a module
 */
export async function getBlastRadius(moduleId: string): Promise<{
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
      transitiveDependents: direct.length > 2 ? ["export_service"] : [],
      totalAffectedModules: direct.length + (direct.length > 2 ? 1 : 0),
      impactScore: Math.min(95, direct.length * 20),
      riskLevel: direct.length > 3 ? "critical" : direct.length > 1 ? "high" : "medium",
    };
  }

  const res = await fetch(`${API_BASE_URL}/blast-radius/${moduleId}`);
  if (!res.ok) throw new Error(`Failed to fetch blast radius for ${moduleId}`);
  return res.json();
}

/**
 * Trigger behavioral test generation for a module
 */
export async function generateModuleTests(moduleId: string): Promise<{
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
      casesTotal: 6,
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

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/generate-tests`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Failed to generate tests for ${moduleId}`);
  return res.json();
}

/**
 * Trigger end-to-end modernization, test generation, and golden master verification
 */
export async function modernizeModule(moduleId: string): Promise<ValidationRun> {
  if (USE_MOCK) {
    await delay(600);
    const run = await getValidationRun(moduleId);
    if (!run) throw new Error(`Module ${moduleId} validation not found`);
    return run;
  }

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/modernize`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Modernization failed for module ${moduleId}`);
  return res.json();
}

/**
 * Fetch backend health status and demo mode state
 */
export async function getHealthStatus(): Promise<{
  status: string;
  service: string;
  demoMode: boolean;
  cacheServing?: boolean;
  version: string;
}> {
  if (USE_MOCK) {
    return {
      status: "healthy",
      service: "recore-ai-frontend-mock",
      demoMode: true,
      cacheServing: true,
      version: "1.0.0",
    };
  }

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

/**
 * Fetch grounded, fact-checked explainable AI insights for a module (Feature A)
 */
export async function getModuleInsights(moduleId: string): Promise<AIInsight> {
  if (USE_MOCK) {
    await delay(200);
    return {
      moduleId,
      summary: `Module ${moduleId}.py contains critical static vulnerabilities including unparameterized query execution and circular dependency risks. Refactoring to async service architecture eliminates these surfaces.`,
      whyRisky: [
        {
          reason: "Critical SQL Injection vulnerability via unparameterized string formatting. Allows untrusted user inputs to alter database queries.",
          evidenceIssueId: "ISS-01",
          line: 23,
        },
        {
          reason: "High cyclomatic complexity creates unmaintainable execution paths and high regression risk.",
          evidenceIssueId: "ISS-02",
          line: 45,
        },
      ],
      suggestedFix: "Refactor module using Pydantic v2 schemas for strict input verification, replace raw string SQL queries with parameterized bindings, and isolate stateful logic behind async service interfaces.",
      confidence: 96,
    };
  }

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/insights`);
  if (!res.ok) throw new Error(`Failed to fetch AI insights for ${moduleId}`);
  return res.json();
}

/**
 * Fetch explainable reason for Modernization Planner DAG sequence (Feature A)
 */
export async function getPlanExplanation(): Promise<PlanExplanation> {
  if (USE_MOCK) {
    await delay(150);
    return {
      recommendedModuleId: "discounts",
      moduleName: "discounts.py",
      reason: "Ranked #1 due to zero unresolved dependencies, high risk reduction ROI (85% score drop in 1.8d), and direct unblocking of 3 downstream services.",
      details: "1. **Zero Blocker Architecture**: discounts.py is a leaf dependency allowing immediate refactoring.\n2. **Maximum Security Impact**: Remediates SQL injection and circular recursion.\n3. **Downstream Unblocking**: Stabilizes core calculations consumed by billing and reports.\n4. **High Parity Confidence**: 100% covered by deterministic Golden Master behavioral assertions.",
      blastRadiusScore: 45,
      riskReduction: 85,
      confidence: 98,
    };
  }

  const res = await fetch(`${API_BASE_URL}/plan/explain`);
  if (!res.ok) throw new Error("Failed to fetch plan explanation");
  return res.json();
}

/**
 * Fetch current strangler pattern traffic routing target (Feature B)
 */
export async function getModuleRoute(moduleId: string): Promise<ModuleRoute> {
  if (USE_MOCK) {
    await delay(100);
    return {
      moduleId,
      target: "modernized",
      adapterPath: `/backend/adapters/${moduleId}_adapter.py`,
      lastUpdated: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/route`);
  if (!res.ok) throw new Error(`Failed to fetch route for ${moduleId}`);
  return res.json();
}

/**
 * Update strangler pattern traffic routing target (Feature B)
 */
export async function updateModuleRoute(
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

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target }),
  });
  if (!res.ok) throw new Error(`Failed to update route for ${moduleId}`);
  return res.json();
}

/**
 * Run shadow comparison across golden master tests between legacy and modernized (Feature B)
 */
export async function runShadowComparison(moduleId: string): Promise<ShadowRunResult> {
  if (USE_MOCK) {
    await delay(400);
    return {
      moduleId,
      target: "modernized",
      totalCases: 6,
      matchedCases: 6,
      matchRate: 100.0,
      cases: [
        {
          id: "SHADOW-01",
          name: "Grandfathered 2019 customer loyalty discount (25%)",
          input: "get_customer_discount_multiplier('CUST-001', 'GROWTH_TIER')",
          legacyOutput: 0.25,
          modernizedOutput: 0.25,
          match: true,
          durationMs: 8,
        },
        {
          id: "SHADOW-02",
          name: "New 2025 customer without grandfathered rate (0%)",
          input: "get_customer_discount_multiplier('CUST-004', 'STARTER')",
          legacyOutput: 0.0,
          modernizedOutput: 0.0,
          match: true,
          durationMs: 7,
        },
        {
          id: "SHADOW-03",
          name: "Bulk tier boundary (100 units, 5% discount)",
          input: "calculate_bulk_discount(100, 20.0)",
          legacyOutput: { quantity: 100, discount_pct: 0.05, final_total: 1900.0 },
          modernizedOutput: { quantity: 100, discount_pct: 0.05, final_total: 1900.0 },
          match: true,
          durationMs: 11,
        },
        {
          id: "SHADOW-04",
          name: "Promo code coupon evaluation (WELCOME10)",
          input: "apply_recursive_promos('WELCOME10')",
          legacyOutput: 0.1,
          modernizedOutput: 0.1,
          match: true,
          durationMs: 6,
        },
      ],
      executedAt: new Date().toISOString(),
    };
  }

  const res = await fetch(`${API_BASE_URL}/modules/${moduleId}/shadow-run`, {
    method: "POST",
  });
  if (!res.ok) throw new Error(`Shadow comparison failed for ${moduleId}`);
  return res.json();
}

/**
 * Trigger download of the formal modernization audit report (.md)
 */
export async function downloadAuditReport(moduleId: string): Promise<void> {
  const url = `${API_BASE_URL}/modules/${moduleId}/report`;
  if (USE_MOCK) {
    const markdown = `# ReCore AI Modernization Audit Report for ${moduleId}\n\nBehavioral Parity: 100%\nSecurity Vulnerabilities Remediated: 2\nApproved by alex.rivera@enterprise.corp\nRouting Target: MODERNIZED\n`;
    const blob = new Blob([markdown], { type: "text/markdown" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `${moduleId}_modernization_audit_report.md`;
    a.click();
    URL.revokeObjectURL(blobUrl);
    return;
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to download audit report");
  const blob = await res.blob();
  const blobUrl = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = `${moduleId}_modernization_audit_report.md`;
  a.click();
  URL.revokeObjectURL(blobUrl);
}

/**
 * Upload a .zip file containing a Python project for analysis (Feature: Real Upload)
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
  if (USE_MOCK) {
    // Mock progressive upload
    const steps = [
      { pct: 10, status: "Uploading file..." },
      { pct: 30, status: "Validating zip archive..." },
      { pct: 50, status: "Extracting Python files..." },
      { pct: 70, status: "Scanning for security issues..." },
      { pct: 90, status: "Queuing analysis..." },
      { pct: 100, status: "Upload complete!" },
    ];

    for (const step of steps) {
      if (onProgress) onProgress(step.pct, step.status);
      await delay(400);
    }

    return {
      projectId: "legacy-billing-abc123",
      name: file.name.replace(".zip", ""),
      status: "queued",
      filesExtracted: 12,
      filesSkipped: 45,
      message: "Project uploaded successfully. 12 Python files extracted, 45 files skipped.",
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  if (onProgress) onProgress(10, "Uploading file...");

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
 * Get the status of a project analysis (polling)
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
  if (USE_MOCK) {
    await delay(100);
    return {
      projectId,
      name: "legacy-billing-py",
      status: "done",
      progress: 100,
      filesExtracted: 12,
      filesSkipped: 45,
      moduleCount: 14,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };
  }

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
  if (USE_MOCK) {
    return {
      projects: [
        {
          projectId: "legacy-billing-abc123",
          name: "legacy-billing-py",
          status: "done",
          moduleCount: 14,
          createdAt: new Date().toISOString(),
        },
      ],
      total: 1,
    };
  }

  const res = await fetch(`${API_BASE_URL}/projects`);
  if (!res.ok) throw new Error("Failed to list projects");
  return res.json();
}

