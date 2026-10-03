"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getModernizationPlan } from "@/lib/api";
import { ModernizationPlan, PlanItem } from "@/lib/types";
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

export default function ModernizationPlannerPage() {
  const [plan, setPlan] = useState<ModernizationPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlanItem, setSelectedPlanItem] = useState<PlanItem | null>(null);

  useEffect(() => {
    async function loadPlan() {
      try {
        const data = await getModernizationPlan();
        setPlan(data);
        if (data.order.length > 0) {
          setSelectedPlanItem(data.order[0]);
        }
      } catch (err) {
        console.error("Failed to load plan", err);
      } finally {
        setLoading(false);
      }
    }
    loadPlan();
  }, []);

  if (loading || !plan) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-800 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-slate-900 rounded-2xl border border-slate-800" />
            ))}
          </div>
          <div className="h-80 bg-slate-900 rounded-2xl border border-slate-800" />
        </div>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <CalendarCheck2 className="w-6 h-6 text-cyan-400" />
                Modernization Execution Planner
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Optimized DAG Sequence
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              AI-synthesized step-by-step roadmap ordering refactors to minimize blast radius and avoid broken dependency chains.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/validate/billing"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" />
              Execute Step 1 (db_utils & billing)
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Top Summary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Total Engineering Effort
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {plan.totalEffortDays}
                </span>
                <span className="text-xs text-slate-400 font-mono">dev-days</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Projected Risk Reduction
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-emerald-400">
                  -{plan.projectedRiskReduction}%
                </span>
                <span className="text-xs text-slate-400 font-mono">overall</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Planned Migrations
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-extrabold font-mono text-white">
                  {plan.order.length}
                </span>
                <span className="text-xs text-slate-400 font-mono">modules ordered</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Risk-vs-Value Quadrant Chart */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Modernization Priority Quadrant (Value vs Effort)
              </h3>
              <p className="text-xs text-slate-400">
                Top-left quadrant indicates high-impact quick wins; top-right indicates high-value core overhauls.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-500">Bubble Size = Risk Reduction</span>
          </div>

          <div className="h-72 w-full pt-4 relative bg-slate-950/60 rounded-xl border border-slate-800/80 p-4">
            {/* Quadrant background guides */}
            <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none p-6 text-[10px] font-mono font-bold tracking-wider uppercase">
              <div className="text-emerald-500/40 p-2 border-r border-b border-slate-800/60">
                ★ Quick Wins (High Value / Low Effort)
              </div>
              <div className="text-cyan-500/40 p-2 border-b border-slate-800/60 text-right">
                Strategic Overhaul (High Value / High Effort)
              </div>
              <div className="text-slate-600/40 p-2 border-r border-slate-800/60 flex items-end">
                Incremental (Low Value / Low Effort)
              </div>
              <div className="text-amber-500/30 p-2 flex items-end justify-end">
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
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 shadow-xl text-xs font-mono">
                        <p className="font-bold text-cyan-300 text-sm">{data.name}</p>
                        <p className="text-slate-300 mt-1">Effort: {data.effort} dev-days</p>
                        <p className="text-emerald-400">Business Value: {data.value}/100</p>
                        <p className="text-rose-400">Risk Reduction: {data.riskReduction}%</p>
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
            <h3 className="text-base font-bold text-white">
              Prioritized Modernization Sequence
            </h3>
            <p className="text-xs text-slate-400">
              Execute in this order to guarantee zero broken downstream contracts.
            </p>
          </div>

          <div className="space-y-3">
            {plan.order.map((item, index) => (
              <div
                key={item.moduleId}
                className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 group"
              >
                {/* Left: Step number & module name */}
                <div className="flex items-start gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center font-mono font-extrabold text-sm text-cyan-400 shrink-0 group-hover:border-cyan-500/50 group-hover:scale-105 transition-all">
                    0{index + 1}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        href={`/module/${item.moduleId}`}
                        className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors"
                      >
                        {item.moduleName}
                      </Link>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        Priority {item.priorityScore}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-2xl">
                      {item.reason}
                    </p>

                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-400 flex-wrap">
                      <span className="text-slate-500 font-medium">Prerequisites:</span>
                      {item.prerequisites.length > 0 ? (
                        item.prerequisites.map((p) => (
                          <span
                            key={p}
                            className="font-mono text-[11px] px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-slate-800"
                          >
                            {p}.py
                          </span>
                        ))
                      ) : (
                        <span className="text-emerald-400 font-mono text-[11px]">
                          ✓ Zero blockers (Start immediately)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Metrics & CTA Button */}
                <div className="flex items-center justify-between lg:justify-end gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-800/60 shrink-0">
                  <div className="flex items-center gap-5 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Effort</span>
                      <span className="font-bold text-white">{item.effortDays}d</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase">Risk Drop</span>
                      <span className="font-bold text-emerald-400">
                        {item.currentRiskScore} &rarr; {item.targetRiskScore}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/validate/${item.moduleId}`}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-cyan-500 text-slate-200 hover:text-slate-950 font-bold text-xs transition-all border border-slate-700 hover:border-cyan-400 shadow-sm"
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
