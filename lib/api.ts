import {
  Module,
  BusinessRule,
  ModernizationPlan,
  ValidationRun,
  ProjectSummary,
  DependencyGraphData,
  DependencyGraphNode,
  DependencyGraphEdge,
} from "./types";

import mockModules from "./mock/modules.json";
import mockBusinessRules from "./mock/business_rules.json";
import mockPlan from "./mock/modernization_plan.json";
import mockValidations from "./mock/validations.json";
import mockSummary from "./mock/summary.json";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== "false";
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

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
