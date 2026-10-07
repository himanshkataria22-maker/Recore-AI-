"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getProjectSummary, getModules } from "@/lib/api";
import { ProjectSummary, Module, RiskLevel } from "@/lib/types";
import { ModuleCard } from "@/components/ui/ModuleCard";
import { UploadAnalysisModal } from "@/components/ui/UploadAnalysisModal";
import {
  ShieldAlert,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  GitPullRequest,
  Activity,
  UploadCloud,
  FileCode,
  ShieldCheck,
  Zap,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

export default function DashboardPage() {
  const [summary, setSummary] = useState<ProjectSummary | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [sumData, modData] = await Promise.all([
          getProjectSummary(),
          getModules(),
        ]);
        setSummary(sumData);
        setModules(modData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredModules = modules.filter((m) => {
    if (filterRisk === "all") return true;
    return m.riskLevel === filterRisk;
  });

  if (loading || !summary) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-pulse">
          <div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800 col-span-2" />
            <div className="h-72 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-300 dark:border-slate-800" />
          </div>
        </div>
      </AppLayout>
    );
  }

  const riskPieData = summary.riskDistribution.map((r) => ({
    name: `${r.level.toUpperCase()} (${r.count})`,
    value: r.count,
    color: r.color,
  }));

  const vulnBarData = summary.topVulnerabilities.map((v) => ({
    name: v.type.replace("_", " "),
    count: v.count,
  }));

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-300 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Modernization Overview
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                Active Project
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Automated legacy AST decompilation, security threat isolation, and parity validation status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 hover:from-cyan-400 hover:via-purple-400 hover:to-pink-400 text-white font-bold text-xs transition-all shadow-lg shadow-purple-500/40 animate-gradient"
            >
              <UploadCloud className="w-4 h-4" />
              Upload Codebase (.zip)
            </button>
            <Link
              href="/planner"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors"
            >
              View Migration Plan
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Modules */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Modules</span>
              <div className="p-2 rounded-lg bg-slate-300 dark:bg-slate-800 text-blue-600 dark:text-cyan-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {summary.totalModules}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                ({summary.totalLoc.toLocaleString()} LOC)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              100% AST AST-indexed
            </p>
          </div>

          {/* Card 2: Critical Risks */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-rose-300 dark:border-rose-950/40 hover:border-rose-400 dark:hover:border-rose-800/60 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                Critical Risks
              </span>
              <div className="p-2 rounded-lg bg-rose-200 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400">
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-rose-700 dark:text-rose-400">
                {summary.criticalRisks}
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                + {summary.highRisks} High
              </span>
            </div>
            <p className="text-[11px] text-rose-700 dark:text-rose-300/80 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              4 SQL Injections & Secrets
            </p>
          </div>

          {/* Card 3: Modernized % */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Modernized</span>
              <div className="p-2 rounded-lg bg-emerald-200 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-emerald-700 dark:text-emerald-400">
                {summary.modernizedPercent}%
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                (2 of 12 complete)
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              Next: billing.py in queue
            </p>
          </div>

          {/* Card 4: Tests Passing */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Behavior Tests</span>
              <div className="p-2 rounded-lg bg-cyan-200 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {summary.testsPassingPercent}%
              </span>
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                47/47 Preserved
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 dark:text-emerald-400/90 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Zero functional regression
            </p>
          </div>
        </div>

        {/* Charts and Quick Action Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Risk Distribution Chart */}
          <div className="lg:col-span-4 p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Risk Distribution</h3>
                <span className="text-[10px] uppercase font-mono text-slate-600 dark:text-slate-500">12 Modules</span>
              </div>
              <div className="h-44 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={riskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {riskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-300 dark:border-slate-800 text-xs">
              {summary.riskDistribution.map((r) => (
                <div key={r.level} className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: r.color }}
                  />
                  <span className="capitalize text-slate-600 dark:text-slate-400">{r.level}:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{r.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Vulnerability Frequency */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Vulnerability Breakdown</h3>
                <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-200 dark:bg-rose-950/40 border border-rose-400 dark:border-rose-800/40 px-2 py-0.5 rounded">
                  AST Findings
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Automated Semgrep and Python AST pattern detection across codebase.
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={vulnBarData} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fill: "#94a3b8", fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="count" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-600 dark:text-slate-400">Total Security Violations:</span>
              <span className="font-mono font-bold text-rose-700 dark:text-rose-400">24 occurrences</span>
            </div>
          </div>

          {/* Hero Feature CTA: Blast Radius Graph preview */}
          <div className="lg:col-span-3 p-5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-200 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-400 dark:border-indigo-500/20 mb-3">
                <Zap className="w-3 h-3 text-indigo-700 dark:text-indigo-400" />
                Interactive AST Graph
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                Blast Radius Impact Engine
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 mt-2 leading-relaxed">
                Click any module to simulate how refactoring impacts downstream dependents in glowing cascade.
              </p>
            </div>

            <div className="pt-4">
              <Link
                href="/graph"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                Launch Dependency Graph
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Modernization Activity Timeline */}
        <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-600 dark:text-cyan-400" />
              Live Modernization Audit Feed
            </h3>
            <span className="text-xs text-slate-600 dark:text-slate-500 font-mono">Real-time Telemetry</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.recentActivity.map((act) => (
              <div
                key={act.id}
                className="p-3.5 rounded-xl bg-slate-200/70 dark:bg-slate-950/70 border border-slate-400 dark:border-slate-800/80 flex items-start gap-3 text-xs"
              >
                <div className="p-1.5 rounded-lg bg-slate-300 dark:bg-slate-900 border border-slate-400 dark:border-slate-800 shrink-0 mt-0.5">
                  {act.type === "approval" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />}
                  {act.type === "modernization" && <Sparkles className="w-3.5 h-3.5 text-blue-700 dark:text-cyan-400" />}
                  {act.type === "warning" && <AlertTriangle className="w-3.5 h-3.5 text-rose-700 dark:text-rose-400" />}
                  {act.type === "analysis" && <Layers className="w-3.5 h-3.5 text-purple-700 dark:text-purple-400" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-slate-800 dark:text-slate-200 font-medium leading-snug">{act.message}</p>
                  <span className="text-[11px] font-mono text-slate-600 dark:text-slate-500 mt-1 block">
                    {act.timestamp}
                  </span>
                </div>
                {act.moduleId && (
                  <Link
                    href={`/module/${act.moduleId}`}
                    className="text-blue-600 dark:text-cyan-400 hover:text-blue-700 dark:hover:text-cyan-300 font-mono text-[11px] shrink-0"
                  >
                    Inspect &rarr;
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Codebase Modules Grid with Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovered Codebase Modules</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                12 Python modules mapped from legacy billing repository.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-400 dark:border-slate-800 text-xs">
              {["all", "critical", "high", "medium", "low"].map((level) => (
                <button
                  key={level}
                  onClick={() => setFilterRisk(level)}
                  className={`px-3 py-1 rounded-lg uppercase text-[11px] font-semibold transition-all ${
                    filterRisk === level
                      ? "bg-slate-300 dark:bg-slate-800 text-blue-700 dark:text-cyan-300 shadow-sm border border-slate-500 dark:border-slate-700"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <ModuleCard key={module.id} module={module} />
            ))}
          </div>
        </div>
      </div>

      <UploadAnalysisModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onAnalysisCompleted={() => {
          setIsUploadModalOpen(false);
        }}
      />
    </AppLayout>
  );
}
