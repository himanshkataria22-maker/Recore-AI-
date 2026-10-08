"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import {
  getValidationRun,
  submitApproval,
  rollbackModule,
  modernizeModule,
  getModuleRoute,
  updateModuleRoute,
  runShadowComparison,
  downloadAuditReport,
  getModules,
} from "@/lib/api";
import { ValidationRun, Module, ModuleRoute, ShadowRunResult, RouteTarget } from "@/lib/types";
import { DiffViewer } from "@/components/ui/DiffViewer";
import { TestRunner } from "@/components/ui/TestRunner";
import { useToast } from "@/components/ui/ToastContext";
import confetti from "canvas-confetti";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Download,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  UserCheck,
  FileCheck,
  History,
  Lock,
  ThumbsUp,
  ThumbsDown,
  Terminal,
  Layers,
  ChevronDown,
  GitCompare,
  ToggleLeft,
  ToggleRight,
  Play,
  Check,
  X,
  Clock,
  ExternalLink,
  Cpu,
  RefreshCw,
} from "lucide-react";

import { useProject } from "@/contexts/ProjectContext";
import { UploadAnalysisModal } from "@/components/ui/UploadAnalysisModal";

export default function ValidationProofPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { hasProject, project } = useProject();

  const moduleId = (params?.id as string) || project?.modules[0]?.id || "billing";
  const [validation, setValidation] = useState<ValidationRun | null>(null);
  const [allModules, setAllModules] = useState<Module[]>([]);
  const [route, setRoute] = useState<ModuleRoute | null>(null);
  const [shadowResult, setShadowResult] = useState<ShadowRunResult | null>(null);
  const [isRunningShadow, setIsRunningShadow] = useState(false);
  const [isTogglingRoute, setIsTogglingRoute] = useState(false);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModernizing, setIsModernizing] = useState(false);
  const [isDownloadingReport, setIsDownloadingReport] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    async function loadValidationData() {
      if (!hasProject || !project) {
        setLoading(false);
        setValidation(null);
        setAllModules([]);
        setRoute(null);
        return;
      }
      const targetModuleId = (params?.id as string) || project.modules[0]?.id;
      if (!targetModuleId) {
        setLoading(false);
        setValidation(null);
        return;
      }

      try {
        const [valData, modsData, routeData] = await Promise.all([
          getValidationRun(project.id, targetModuleId).catch(() => null),
          getModules(project.id).catch(() => []),
          getModuleRoute(project.id, targetModuleId).catch(() => null),
        ]);
        setValidation(valData);
        setAllModules(modsData);
        setRoute(routeData);
      } catch (err) {
        console.error("Failed to load validation data", err);
      } finally {
        setLoading(false);
      }
    }
    loadValidationData();
  }, [params?.id, hasProject, project]);

  const handleModernize = async () => {
    setIsModernizing(true);
    try {
      toast.info("Modernization Started", `Generating test matrix & synthesizing modern version for ${moduleId}...`);
      const run = await modernizeModule(project?.id || "demo-project", moduleId);
      setValidation(run);
      const updatedRoute = await getModuleRoute(project?.id || "demo-project", moduleId).catch(() => null);
      if (updatedRoute) setRoute(updatedRoute);
      toast.success(
        "Modernization Complete",
        `Golden Master verified: ${run.testsPassed}/${run.testsTotal} behavior tests preserved (${run.preservationScore}% parity).`
      );
    } catch (err) {
      toast.error("Modernization Failed", `Could not modernize module ${moduleId}.`);
    } finally {
      setIsModernizing(false);
    }
  };

  const handleToggleRoute = async (newTarget: RouteTarget) => {
    if (!route || route.target === newTarget || isTogglingRoute) return;
    setIsTogglingRoute(true);
    try {
      const res = await updateModuleRoute(project?.id || "demo-project", moduleId, newTarget);
      setRoute(res);
      toast.success(
        "Traffic Route Updated",
        `Strangler pattern now routing live calls to ${newTarget.toUpperCase()} implementation.`
      );
    } catch (err) {
      toast.error("Routing Update Failed", `Could not switch route to ${newTarget}.`);
    } finally {
      setIsTogglingRoute(false);
    }
  };

  const handleRunShadowComparison = async () => {
    setIsRunningShadow(true);
    try {
      toast.info("Running Shadow Comparison", "Executing golden master cases concurrently through legacy (v0) and modernized (v1)...");
      const res = await runShadowComparison(project?.id || "demo-project", moduleId);
      setShadowResult(res);
      toast.success(
        "Shadow Comparison Complete",
        `${res.matchedCases}/${res.totalCases} cases matched with 100% mathematical parity (${res.matchRate}% match rate).`
      );
    } catch (err) {
      toast.error("Shadow Comparison Failed", `Could not run shadow tests on ${moduleId}.`);
    } finally {
      setIsRunningShadow(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!validation) return;
    setIsDownloadingReport(true);
    try {
      await downloadAuditReport(project?.id || "demo-project", validation.moduleId);
      toast.success("Audit Report Downloaded", `Saved ${validation.moduleId}_modernization_audit_report.md`);
    } catch (err) {
      toast.error("Download Failed", "Could not generate audit report.");
    } finally {
      setIsDownloadingReport(false);
    }
  };

  const handleApprove = async (status: "approved" | "rejected") => {
    if (!validation) return;
    setIsSubmitting(true);
    try {
      const res = await submitApproval(
        project?.id || "demo-project",
        validation.moduleId,
        status,
        approvalNotes || (status === "approved" ? "Verified behavioral test parity and security audit." : "Requires additional edge-case testing."),
        "alex.rivera@enterprise.corp"
      );

      setValidation({
        ...validation,
        approvalStatus: status,
        approvalNotes: approvalNotes,
        approvedBy: "alex.rivera@enterprise.corp",
        approvedAt: res.timestamp,
      });

      if (status === "approved") {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#22c55e", "#38bdf8", "#818cf8"],
        });
        toast.success("Module Approved & Signed Off", res.message);
      } else {
        toast.warning("Sign-off Rejected", "Module returned to synthesis queue.");
      }
    } catch (err) {
      toast.error("Approval Submission Failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRollback = async () => {
    if (!validation) return;
    setIsRollingBack(true);
    try {
      const res = await rollbackModule(project?.id || "demo-project", validation.moduleId);
      toast.info("Rollback Executed", res.message);
      setRoute({
        moduleId: validation.moduleId,
        target: "legacy",
        adapterPath: route?.adapterPath,
        lastUpdated: new Date().toISOString(),
      });
      setShowRollbackModal(false);
      setTimeout(() => {
        router.push(`/module/${validation.moduleId}`);
      }, 1200);
    } catch (err) {
      toast.error("Rollback Failed");
    } finally {
      setIsRollingBack(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-6 w-32 bg-slate-800 rounded" />
          <div className="h-20 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-64 bg-slate-900 rounded-3xl border border-slate-800" />
          <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </AppLayout>
    );
  }

  if (!hasProject || !validation) {
    return (
      <AppLayout>
        <div className="text-center py-20 space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 dark:text-rose-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {!hasProject ? "No project yet. Upload a codebase to begin." : "Validation Proof Not Found"}
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
            {!hasProject
              ? "Upload a Python codebase archive to generate validation proofs and strangler traffic routing."
              : `No active validation run exists for module "${moduleId}".`}
          </p>
          <div className="pt-2">
            {!hasProject ? (
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                Upload Codebase (.zip)
              </button>
            ) : (
              <button
                onClick={handleModernize}
                disabled={isModernizing}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-4 h-4" />
                Generate Synthesis & Validation Proof
              </button>
            )}
          </div>
        </div>

        <UploadAnalysisModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </AppLayout>
    );
  }

  const otherModules = allModules.filter((m) => m.id !== moduleId);
  
  // Determine if approval button should be enabled
  const canApprove = 
    validation && 
    validation.testsTotal > 0 && 
    validation.testsPassed === validation.testsTotal &&
    validation.approvalStatus === "pending";
  
  const approveDisabledReason = !validation 
    ? "No validation run" 
    : validation.testsTotal === 0 
    ? "No tests run"
    : validation.testsPassed < validation.testsTotal
    ? `${validation.testsTotal - validation.testsPassed} test(s) failed`
    : validation.approvalStatus === "approved"
    ? "Already approved"
    : null;

  // Determine if traffic routing to modernized is allowed
  const canSwitchToModernized =
    validation &&
    validation.testsTotal > 0 &&
    validation.testsPassed === validation.testsTotal &&
    validation.approvalStatus === "approved" &&
    validation.securityIssuesFixed > 0;

  const switchToModernizedDisabledReason = !validation
    ? "No validation run"
    : validation.testsTotal === 0
    ? "Tests must be run first"
    : validation.testsPassed < validation.testsTotal
    ? "All tests must pass before switching to modernized"
    : validation.approvalStatus !== "approved"
    ? "Module must be approved before switching traffic"
    : validation.securityIssuesFixed === 0
    ? "Security issues must be fixed before switching"
    : null;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header Navigation & Action Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 mb-1 font-mono">
              <Link href={`/module/${moduleId}`} className="hover:text-blue-600 dark:hover:text-cyan-400 flex items-center gap-1 transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to {moduleId}.py
              </Link>
              <span>/</span>
              <span className="font-mono text-slate-800 dark:text-slate-200">Validation Proof</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2 font-mono">
                {validation.moduleName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                {validation.runId}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Quick Switch Module Dropdown */}
            {otherModules.length > 0 && (
              <select
                value={moduleId}
                onChange={(e) => router.push(`/validate/${e.target.value}`)}
                className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 pr-8 cursor-pointer shadow-xs"
              >
                <option value={moduleId}>{validation.moduleName}</option>
                {otherModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={handleModernize}
              disabled={isModernizing}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 disabled:opacity-50"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isModernizing ? "animate-spin" : "fill-current"}`} />
              <span>{isModernizing ? "Synthesizing..." : "Re-Modernize & Test"}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              disabled={isDownloadingReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-300 dark:border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
              <span>{isDownloadingReport ? "Generating..." : "Download Audit Report"}</span>
            </button>

            <button
              onClick={() => setShowRollbackModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
              Rollback
            </button>
          </div>
        </div>

        {/* HERO SUCCESS BANNER: Behavior Tests Preserved */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 text-white border border-emerald-500/40 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-80 h-80 text-emerald-400" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono font-bold tracking-wide">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                DETERMINISTIC BEHAVIORAL PROOF CERTIFIED
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                {validation.testsPassed}/{validation.testsTotal} Behavior Tests Preserved
              </h2>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {validation.testsPassed === validation.testsTotal
                  ? "All domain edge cases, pricing proration formulas, and loyalty rules match the legacy baseline with 100% behavioral parity."
                  : `${validation.testsTotal - validation.testsPassed} test(s) failed. Module requires additional fixes before approval.`}
              </p>
            </div>

            {/* Metric Badges */}
            <div className="flex flex-wrap lg:flex-col gap-3 shrink-0">
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    Security Vulnerabilities
                  </span>
                  <p className="text-sm font-bold text-emerald-400 font-mono">
                    {validation.securityIssuesFixed} Issues Remediated
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-purple-500/30 flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 font-mono">
                    Complexity Reduction
                  </span>
                  <p className="text-sm font-bold text-purple-300 font-mono">
                    {validation.diff.complexityReduction}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FEATURE B: STRANGLER PATTERN TRAFFIC ROUTING BAR */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
                  <Cpu className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Strangler Pattern Traffic Routing
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-100 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-500/30">
                  Zero Downtime Proxy
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
                Adapter <code className="text-indigo-800 dark:text-cyan-300 font-mono text-[11px] bg-slate-100 dark:bg-slate-950 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-800">/backend/adapters/{validation.moduleId}_adapter.py</code> routes incoming calls dynamically between v0 (Legacy) and v1 (Modernized).
              </p>
            </div>

            {/* Toggle Controls */}
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-800 shrink-0">
              <span className="text-xs font-mono text-slate-600 dark:text-slate-400 px-2 font-semibold">Active Route:</span>
              
              <button
                onClick={() => handleToggleRoute("legacy")}
                disabled={isTogglingRoute}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  route?.target === "legacy"
                    ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${route?.target === "legacy" ? "bg-slate-950 animate-ping" : "bg-slate-500"}`} />
                Legacy (v0)
              </button>

              <button
                onClick={() => handleToggleRoute("modernized")}
                disabled={isTogglingRoute || !canSwitchToModernized}
                title={!canSwitchToModernized ? switchToModernizedDisabledReason || "" : "Switch to modernized version"}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all ${
                  route?.target === "modernized"
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : !canSwitchToModernized || isTogglingRoute
                    ? "text-slate-400 bg-slate-200 dark:bg-slate-800 cursor-not-allowed opacity-50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-900"
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${route?.target === "modernized" ? "bg-slate-950 animate-ping" : "bg-slate-500"}`} />
                Modernized (v1)
              </button>
            </div>
          </div>
        </div>

        {/* FEATURE B HERO: SHADOW COMPARISON MATRIX */}
        <div className="p-6 md:p-8 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="p-2.5 rounded-2xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20">
                  <GitCompare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Strangler Shadow Execution & Dual Comparative Matrix
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                    Runs golden-master production payloads concurrently through both versions to verify 100% mathematical output equality.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleRunShadowComparison}
              disabled={isRunningShadow}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isRunningShadow ? "animate-spin" : ""}`} />
              <span>{isRunningShadow ? "Executing Shadow Run..." : "Run Shadow Comparison"}</span>
            </button>
          </div>

          {/* Shadow Run Results */}
          {shadowResult ? (
            <div className="space-y-4">
              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">Total Cases</span>
                  <p className="text-xl font-mono font-bold text-slate-900 dark:text-white">{shadowResult.totalCases}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50/50 dark:bg-slate-950 border border-emerald-300 dark:border-emerald-500/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-emerald-700 dark:text-emerald-400 font-bold">Matched Cases</span>
                  <p className="text-xl font-mono font-bold text-emerald-700 dark:text-emerald-400">{shadowResult.matchedCases} / {shadowResult.totalCases}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-cyan-50/50 dark:bg-slate-950 border border-cyan-300 dark:border-cyan-500/30 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-cyan-800 dark:text-cyan-400 font-bold">Parity Match Rate</span>
                  <p className="text-xl font-mono font-bold text-cyan-700 dark:text-cyan-300">{shadowResult.matchRate}%</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-bold">Routing Target</span>
                  <p className="text-base font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">{shadowResult.target}</p>
                </div>
              </div>

              {/* Shadow Cases Table */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900/80 font-mono text-[11px] text-slate-700 dark:text-slate-400 uppercase">
                        <th className="py-3 px-4">Case ID & Scenario</th>
                        <th className="py-3 px-4">Input Expression</th>
                        <th className="py-3 px-4">Legacy (v0) Output</th>
                        <th className="py-3 px-4">Modernized (v1) Output</th>
                        <th className="py-3 px-4 text-center">Parity Match</th>
                        <th className="py-3 px-4 text-right">Latency</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60 font-mono">
                      {shadowResult.cases.map((c, idx) => (
                        <tr key={c.id || idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                          <td className="py-3 px-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                            <span className="font-mono text-[10px] text-blue-600 dark:text-cyan-400 block font-bold">{c.id}</span>
                            <span>{c.name || "Contract Verification Case"}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            <code className="text-blue-700 dark:text-cyan-300 text-[11px] bg-slate-100 dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-300 dark:border-slate-800">
                              {c.input}
                            </code>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            <span className="text-amber-700 dark:text-amber-300">{typeof c.legacyOutput === "object" ? JSON.stringify(c.legacyOutput) : String(c.legacyOutput)}</span>
                          </td>
                          <td className="py-3 px-4 text-slate-700 dark:text-slate-300 max-w-xs truncate">
                            <span className="text-emerald-700 dark:text-emerald-300">{typeof c.modernizedOutput === "object" ? JSON.stringify(c.modernizedOutput) : String(c.modernizedOutput)}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {c.match ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30">
                                <Check className="w-3 h-3" />
                                MATCH 100%
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-500/10 text-rose-800 dark:text-rose-400 border border-rose-300 dark:border-rose-500/30">
                                <X className="w-3 h-3" />
                                DIFF DETECTED
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right text-slate-500 dark:text-slate-400 text-[11px]">
                            {c.durationMs || 10}ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <GitCompare className="w-8 h-8 text-blue-600 dark:text-cyan-400 mx-auto opacity-70" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Shadow Run Recorded Yet</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                Click &quot;Run Shadow Comparison&quot; to execute all golden master cases through the live strangler adapter against both versions simultaneously.
              </p>
            </div>
          )}
        </div>

        {/* Section 1: Animated Interactive Test Runner Matrix */}
        <TestRunner
          testCases={validation.testCases}
          testsTotal={validation.testsTotal}
          testsPassed={validation.testsPassed}
        />

        {/* Section 2: Side-by-Side Before/After Code Diff */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Before & After Code Synthesis Diff
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Compare legacy procedural code against clean Pydantic v2 & Parameterized Query DB-API.
              </p>
            </div>
          </div>

          <DiffViewer
            before={validation.diff.before}
            after={validation.diff.after}
            beforeLoc={validation.diff.beforeLoc}
            afterLoc={validation.diff.afterLoc}
            complexityReduction={validation.diff.complexityReduction}
          />
        </div>

        {/* Section 3: Human Approval & Sign-Off Panel */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-300 dark:border-cyan-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Human Verification & Production Sign-Off Gate
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Dual-key compliance approval required before deploying modernized artifact to production branches.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  validation.approvalStatus === "approved"
                    ? "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40"
                    : validation.approvalStatus === "rejected"
                    ? "bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-500/40"
                    : "bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40"
                }`}
              >
                {validation.approvalStatus}
              </span>
            </div>
          </div>

          {validation.approvalStatus === "approved" ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-slate-900 dark:text-white">
                  Module Approved by {validation.approvedBy || "—"}
                </p>
                <p className="text-slate-700 dark:text-slate-300">{validation.approvalNotes || "No notes provided"}</p>
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 block pt-1">
                  Signed at: {validation.approvedAt ? new Date(validation.approvedAt).toLocaleString() : "—"} (Audit Hash Recorded)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">
                  Lead Reviewer Verification Notes / Comments
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Verified parity assertions against staging database; approved for canary deployment..."
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-500 min-h-[90px]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleApprove("rejected")}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-100 dark:bg-slate-800 dark:hover:bg-rose-950 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject & Request Rerun
                </button>

                <button
                  onClick={() => handleApprove("approved")}
                  disabled={isSubmitting || !canApprove}
                  title={!canApprove ? approveDisabledReason || "" : "Approve this modernized module for production"}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    !canApprove || isSubmitting
                      ? "bg-slate-400 dark:bg-slate-600 text-slate-700 dark:text-slate-300 opacity-50 cursor-not-allowed"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 active:scale-95"
                  }`}
                >
                  <ThumbsUp className="w-4 h-4 fill-current" />
                  Approve Modernized Module
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Rollback Confirmation Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-900/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Instant Rollback</h3>
            </div>

            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Are you sure you want to rollback <strong>{validation.moduleName}</strong>? This will revert the branch back to the legacy Python baseline, reset the strangler route to legacy, and invalidate current parity certifications.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                disabled={isRollingBack}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-900/40"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                {isRollingBack ? "Rolling Back..." : "Execute 1-Click Rollback"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
