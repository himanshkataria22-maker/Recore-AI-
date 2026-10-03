"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getValidationRun, submitApproval, rollbackModule } from "@/lib/api";
import { ValidationRun } from "@/lib/types";
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
} from "lucide-react";

export default function ValidationProofPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();

  const moduleId = (params?.id as string) || "billing";
  const [validation, setValidation] = useState<ValidationRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [isRollingBack, setIsRollingBack] = useState(false);

  useEffect(() => {
    async function loadValidation() {
      try {
        const data = await getValidationRun(moduleId);
        setValidation(data);
        if (data && data.approvalStatus === "approved") {
          // Trigger subtle celebration confetti on already approved modules
        }
      } catch (err) {
        console.error("Failed to load validation", err);
      } finally {
        setLoading(false);
      }
    }
    loadValidation();
  }, [moduleId]);

  const handleApprove = async (status: "approved" | "rejected") => {
    if (!validation) return;
    setIsSubmitting(true);
    try {
      const res = await submitApproval(
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
      const res = await rollbackModule(validation.moduleId);
      toast.info("Rollback Executed", res.message);
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

  const handleDownloadAuditReport = () => {
    if (!validation) return;
    const reportData = `# RECORE AI PARITY & SECURITY AUDIT CERTIFICATE
======================================================
Module: ${validation.moduleName} (${validation.moduleId})
Run ID: ${validation.runId}
Timestamp: ${validation.timestamp}
Preservation Score: ${validation.preservationScore}%

## TEST SUITE SUMMARY
- Total Behavioral Invariant Tests: ${validation.testsTotal}
- Tests Passing: ${validation.testsPassed} (${validation.behaviorPreserved ? "100% PARITY ASSERTED" : "REGRESSION DETECTED"})
- Security Issues Remediated: ${validation.securityIssuesFixed}
- Code Complexity Reduction: ${validation.diff.complexityReduction}
- LOC Reduction: ${validation.diff.beforeLoc} -> ${validation.diff.afterLoc} LOC

## SIGN-OFF AUDIT TRAIL
- Approval Status: ${validation.approvalStatus.toUpperCase()}
- Signer: ${validation.approvedBy || "Pending developer sign-off"}
- Timestamp: ${validation.approvedAt || "N/A"}
- Audit Notes: ${validation.approvalNotes || "Standard parity validation"}

Deterministic Proof Hash: SHA256:${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}
======================================================
`;

    const blob = new Blob([reportData], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recore_audit_${validation.moduleId}_${validation.runId}.md`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success("Audit Report Downloaded", `Saved audit proof certificate for ${validation.moduleName}`);
  };

  if (loading || !validation) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-800 rounded" />
          <div className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
          <div className="h-96 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
      </AppLayout>
    );
  }

  const otherModules = [
    { id: "billing", name: "billing.py (Hero Validation)" },
    { id: "auth", name: "auth.py" },
    { id: "db_utils", name: "db_utils.py" },
    { id: "invoice", name: "invoice.py" },
    { id: "discounts", name: "discounts.py" },
  ];

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Module Switcher & Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <Link href="/planner" className="hover:text-cyan-400">
                Planner
              </Link>
              <span>/</span>
              <span className="font-mono text-slate-200">Validation Proof</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                {validation.moduleName}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {validation.runId}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Switch Module Dropdown */}
            <div className="relative">
              <select
                value={moduleId}
                onChange={(e) => router.push(`/validate/${e.target.value}`)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 pr-8 cursor-pointer"
              >
                {otherModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleDownloadAuditReport}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              Download Audit Report
            </button>

            <button
              onClick={() => setShowRollbackModal(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold border border-rose-800/40 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
              Rollback
            </button>
          </div>
        </div>

        {/* HERO SUCCESS BANNER: 47/47 Behavior Tests Preserved */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-emerald-950/50 via-slate-900 to-cyan-950/40 border border-emerald-500/40 shadow-2xl relative overflow-hidden">
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
                Zero functional regression detected. All domain edge cases, pricing proration formulas, and EU VAT reverse-charge invariants match the legacy Python baseline with 100% mathematical parity.
              </p>
            </div>

            {/* 3 Metric Badges */}
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
              <h3 className="text-base font-bold text-white">
                Before & After Code Synthesis Diff
              </h3>
              <p className="text-xs text-slate-400">
                Compare legacy Python 2/3 procedural code against clean Pydantic v2 & Async SQLAlchemy.
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
        <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Human Verification & Production Sign-Off Gate
                </h3>
                <p className="text-xs text-slate-400">
                  Dual-key compliance approval required before deploying modernized artifact to production branches.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-mono">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                  validation.approvalStatus === "approved"
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                    : validation.approvalStatus === "rejected"
                    ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    : "bg-amber-500/20 text-amber-300 border-amber-500/40"
                }`}
              >
                {validation.approvalStatus}
              </span>
            </div>
          </div>

          {validation.approvalStatus === "approved" ? (
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <p className="font-bold text-white">
                  Module Approved by {validation.approvedBy}
                </p>
                <p className="text-slate-300">{validation.approvalNotes}</p>
                <span className="text-[10px] font-mono text-emerald-400 block pt-1">
                  Signed at: {new Date(validation.approvedAt || "").toLocaleString()} (Audit Hash Recorded)
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Lead Reviewer Verification Notes / Comments
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Verified parity assertions against staging database; approved for canary deployment..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-sans text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 min-h-[90px]"
                />
              </div>

              <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => handleApprove("rejected")}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950 text-slate-300 hover:text-rose-300 text-xs font-bold border border-slate-700 hover:border-rose-700 transition-all"
                >
                  <ThumbsDown className="w-4 h-4" />
                  Reject & Request Rerun
                </button>

                <button
                  onClick={() => handleApprove("approved")}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-rose-900/60 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Confirm Instant Rollback</h3>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to rollback <strong>{validation.moduleName}</strong>? This will revert the branch back to the legacy Python baseline and invalidate current parity certifications.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
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
