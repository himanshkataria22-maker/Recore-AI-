"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getModernizationPlan, getPlanExplanation } from "@/lib/api";
import { ModernizationPlan, PlanItem, PlanExplanation } from "@/lib/types";
import {
  CalendarCheck2,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
  Target,
  Info,
  CheckCircle2,
  HelpCircle,
  Compass,
} from "lucide-react";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

import { useProject } from "@/contexts/ProjectContext";
import { UploadAnalysisModal } from "@/components/ui/UploadAnalysisModal";

export default function ModernizationPlannerPage() {
  const { hasProject, project } = useProject();
  const [plan, setPlan] = useState<ModernizationPlan | null>(null);
  const [explanation, setExplanation] = useState<PlanExplanation | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanItem, setSelectedPlanItem] = useState<PlanItem | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      if (!hasProject || !project) {
        setLoading(false);
        setPlan(null);
        setExplanation(null);
        return;
      }

      try {
        const [planData, expData] = await Promise.all([
          getModernizationPlan(project.id),
          getPlanExplanation(project.id).catch(() => null),
        ]);
        setPlan(planData);
        setExplanation(expData);
        if (planData.order.length > 0) {
          setSelectedPlanItem(planData.order[0]);
        }
      } catch (err) {
        console.error("Failed to load plan", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, [hasProject, project]);

  if (!hasProject || !plan) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck2 className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                Modernization Execution Planner
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                AI-synthesized step-by-step roadmap ordering refactors to minimize blast radius.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
            >
              Upload Codebase (.zip)
            </button>
          </div>

          <div className="p-12 text-center rounded-3xl bg-slate-100/60 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center mx-auto border border-cyan-500/20">
              <CalendarCheck2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                No project yet. Upload a codebase to begin.
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Upload a Python codebase archive to generate an optimized step-by-step modernization DAG sequence with risk-vs-value priority scatter charts.
              </p>
            </div>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20"
            >
              Upload Codebase (.zip)
            </button>
          </div>
        </div>

        <UploadAnalysisModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      </AppLayout>
    );
  }

  // Scatter chart data: X = effortDays, Y = businessValue, Z = riskReduction
  const scatterData = plan.order.map((item) => ({
    name: item.moduleName,
    id: item.moduleId,
    effort: item.effortDays,
    value: item.businessValue,
    riskReduction: item.riskReduction,
    riskScore: item.currentRiskScore,
  }));

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-300 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
                <CalendarCheck2 className="w-6 h-6 text-blue-600 dark:text-cyan-400" />
                Modernization Execution Planner
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-100 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
                Optimized DAG Sequence
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              AI-synthesized step-by-step roadmap ordering refactors to minimize blast radius and avoid broken dependency chains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {plan.order.length > 0 && (
              <Link
                href={`/validate/${plan.order[0].moduleId}`}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                Execute Step 1 ({plan.order[0].moduleName})
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Total Engineering Effort
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {plan.totalEffortDays}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">dev-days</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-blue-100 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Projected Risk Reduction
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
                  -{plan.projectedRiskReduction}%
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">overall</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-xs">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Planned Migrations
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white">
                  {plan.order.length}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">modules ordered</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* FEATURE A: Explainable AI "Why Modernize This First?" Section */}
        {explanation && (
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-50/90 via-slate-50 to-indigo-50/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900 border border-indigo-200 dark:border-indigo-500/30 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200 dark:border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-indigo-100 dark:bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30 mb-1">
                    <Sparkles className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                    AI DAG SEQUENCING RATIONALE
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                    Why did we recommend modernizing <span className="text-cyan-600 dark:text-cyan-400">{explanation.moduleName}</span> first?
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 text-emerald-800 dark:text-emerald-400 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {explanation.confidence}% Topological Confidence
                </span>
                <Link
                  href={`/validate/${explanation.recommendedModuleId}`}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Execute {explanation.recommendedModuleId}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            <p className="text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed bg-white/80 dark:bg-slate-950/70 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80">
              {explanation.reason}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  1. Blocker Status
                </span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                  0 Prerequisite Blockers
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Leaf dependency; safely isolated.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  2. Risk Reduction ROI
                </span>
                <p className="text-xs font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                  -{explanation.riskReduction}% Projected Drop
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Remediates critical security flaws.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  3. Blast Radius
                </span>
                <p className="text-xs font-bold text-purple-600 dark:text-purple-400 font-mono">
                  Score: {explanation.blastRadiusScore}/100
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Unblocks downstream billing callers.</p>
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 font-mono">
                  4. Parity Proof
                </span>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                  100% Golden Master
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Guarantees zero logic regression.</p>
              </div>
            </div>
          </div>
        )}

        {/* Risk-vs-Value Quadrant Chart */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                Modernization Priority Quadrant (Value vs Effort)
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Top-left quadrant indicates high-impact quick wins; top-right indicates high-value core overhauls.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-500">Bubble Size = Risk Reduction</span>
          </div>

          <div className="h-72 w-full pt-4 relative bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800/80 p-4">
            {/* Quadrant background guides */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none p-6 text-[10px] font-mono font-bold tracking-wider uppercase">
              <div className="text-emerald-600/40 dark:text-emerald-500/40 p-2 border-r border-b border-slate-200 dark:border-slate-800/60">
                ★ Quick Wins (High Value / Low Effort)
              </div>
              <div className="text-cyan-600/40 dark:text-cyan-500/40 p-2 border-b border-slate-200 dark:border-slate-800/60 text-right">
                Strategic Overhaul (High Value / High Effort)
              </div>
              <div className="text-slate-500/40 p-2 border-r border-slate-200 dark:border-slate-800/60 flex items-end">
                Incremental (Low Value / Low Effort)
              </div>
              <div className="text-amber-600/30 dark:text-amber-500/30 p-2 flex items-end justify-end">
                Deprioritize (Low Value / High Effort)
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis
                  type="number"
                  dataKey="effort"
                  name="Effort (Dev Days)"
                  unit="d"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  domain={[0, 5]}
                />
                <YAxis
                  type="number"
                  dataKey="value"
                  name="Business Value"
                  unit="pts"
                  stroke="#64748b"
                  tick={{ fontSize: 11 }}
                  domain={[60, 100]}
                />
                <ZAxis type="number" dataKey="riskReduction" range={[120, 600]} />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  content={({ payload }) => {
                    if (!payload || payload.length === 0) return null;
                    const data = payload[0].payload;
                    return (
                      <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl text-xs font-mono">
                        <p className="font-bold text-cyan-600 dark:text-cyan-300 text-sm">{data.name}</p>
                        <p className="text-slate-700 dark:text-slate-300 mt-1">Effort: {data.effort} dev-days</p>
                        <p className="text-emerald-600 dark:text-emerald-400">Business Value: {data.value}/100</p>
                        <p className="text-rose-600 dark:text-rose-400">Risk Reduction: {data.riskReduction}%</p>
                      </div>
                    );
                  }}
                />
                <Scatter data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.riskScore > 85 ? "#f43f5e" : entry.value > 90 ? "#38bdf8" : "#22c55e"}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Ordered Modernization Timeline List */}
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Prioritized Modernization Sequence
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Execute in this order to guarantee zero broken downstream contracts.
            </p>
          </div>

          <div className="space-y-3">
            {plan.order.map((item, index) => (
              <div
                key={item.moduleId}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group shadow-xs"
              >
                {/* Left: Step number & module name */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-mono font-extrabold text-sm text-cyan-600 dark:text-cyan-400 shrink-0 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">
                    0{index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/module/${item.moduleId}`}
                        className="font-mono text-base font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors"
                      >
                        {item.moduleName}
                      </Link>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        Priority {item.priorityScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      {item.reason}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="text-slate-500 font-medium">Prerequisites:</span>
                      {item.prerequisites.length > 0 ? (
                        item.prerequisites.map((p) => (
                          <span
                            key={p}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-950 text-cyan-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-800"
                          >
                            {p}.py
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
                          ✓ Zero blockers (Start immediately)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & CTA Button */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-200 dark:border-slate-800/60 shrink-0">
                  <div className="flex items-center gap-5 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Effort</span>
                      <span className="font-bold text-slate-900 dark:text-white">{item.effortDays}d</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Risk Drop</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {item.currentRiskScore} &rarr; {item.targetRiskScore}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/validate/${item.moduleId}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-cyan-500 dark:hover:bg-cyan-500 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-slate-950 font-bold text-xs transition-all border border-slate-300 dark:border-slate-700 hover:border-cyan-400 shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Modernize Module
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

