"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { useProject } from "@/contexts/ProjectContext";
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
  Activity,
  UploadCloud,
  ShieldCheck,
  Zap,
  FolderPlus,
  BarChart3,
  PieChart as PieChartIcon,
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
  const { status, project, hasProject } = useProject();
  const [filterRisk, setFilterRisk] = useState<string>("all");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const modules = project?.modules || [];
  const summary = project?.summary;

  const filteredModules = modules.filter((m) => {
    if (filterRisk === "all") return true;
    return m.riskLevel === filterRisk;
  });

  // Risk distribution pie chart data
  const riskPieData = summary?.riskDistribution
    ? summary.riskDistribution.map((r) => ({
        name: `${r.level.toUpperCase()} (${r.count})`,
        value: r.count,
        color: r.color,
      }))
    : [];

  // Security vulnerability breakdown bar chart data
  const vulnBarData = summary?.topVulnerabilities
    ? summary.topVulnerabilities.map((v) => ({
        name: v.type.replace(/_/g, " "),
        count: v.count,
      }))
    : [];

  // Total security violations count
  const totalViolations = summary?.topVulnerabilities
    ? summary.topVulnerabilities.reduce((acc, v) => acc + v.count, 0)
    : 0;

  // Modernized count
  const modernizedCount = project?.modernizedCount || 0;
  const totalModulesCount = project?.totalModules || 0;

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Top Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-300 dark:border-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Modernization Overview
              </h1>
              {hasProject ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  {project?.name}
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  No Project
                </span>
              )}
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
            {hasProject ? (
              <Link
                href="/planner"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors"
              >
                View Migration Plan
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ) : (
              <button
                disabled
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-600 font-semibold text-xs border border-slate-200 dark:border-slate-800 cursor-not-allowed opacity-60"
              >
                View Migration Plan
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Empty State Hero CTA (if no project loaded) */}
        {!hasProject && status !== "uploading" && status !== "analyzing" && (
          <div className="p-8 rounded-3xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-pink-500/10 border-2 border-dashed border-cyan-500/30 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-cyan-500/20 text-cyan-500 dark:text-cyan-400 flex items-center justify-center mx-auto border border-cyan-500/30">
              <FolderPlus className="w-8 h-8" />
            </div>
            <div className="max-w-xl mx-auto space-y-1">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                No project yet. Upload a codebase to begin.
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ReCore AI decompiles Python legacy archives, maps dependency graphs, pinpoints SQL injections, and generates deterministic behavior test suites.
              </p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setIsUploadModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
              >
                <UploadCloud className="w-4 h-4" />
                Upload Codebase (.zip)
              </button>
            </div>
          </div>
        )}

        {/* Loading Skeletons during uploading/analyzing */}
        {(status === "uploading" || status === "analyzing") && (
          <div className="space-y-6 animate-pulse">
            <div className="p-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2">
              <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">
                Analyzing Python Codebase... Please wait while AST rules are synthesized.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-28 bg-slate-200 dark:bg-slate-800/60 rounded-2xl border border-slate-300 dark:border-slate-800"
                />
              ))}
            </div>
          </div>
        )}

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Modules */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Modules</span>
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {hasProject ? project?.totalModules : "0"}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {hasProject ? `(${(project?.totalLoc || 0).toLocaleString()} LOC)` : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" />
              {hasProject ? "100% AST indexed" : "No codebase uploaded yet"}
            </p>
          </div>

          {/* Card 2: Critical Risks */}
          <div
            className={`p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border transition-all flex flex-col justify-between ${
              hasProject && (project?.criticalRisks || 0) > 0
                ? "border-rose-300 dark:border-rose-950/40 hover:border-rose-400 dark:hover:border-rose-800/60"
                : "border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700"
            }`}
          >
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span
                className={`text-xs font-semibold uppercase tracking-wider ${
                  hasProject && (project?.criticalRisks || 0) > 0
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-slate-600 dark:text-slate-400"
                }`}
              >
                Critical Risks
              </span>
              <div
                className={`p-2 rounded-lg ${
                  hasProject && (project?.criticalRisks || 0) > 0
                    ? "bg-rose-200 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono ${
                  hasProject && (project?.criticalRisks || 0) > 0
                    ? "text-rose-700 dark:text-rose-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {hasProject ? project?.criticalRisks : "0"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                {hasProject ? `+ ${project?.highRisks} High` : ""}
              </span>
            </div>
            <p
              className={`text-[11px] mt-2 flex items-center gap-1 ${
                hasProject && (project?.criticalRisks || 0) > 0
                  ? "text-rose-700 dark:text-rose-300/80"
                  : "text-slate-600 dark:text-slate-500"
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
              {hasProject
                ? project?.topVulnerabilitiesSummary || "AST threat scan"
                : "No codebase uploaded yet"}
            </p>
          </div>

          {/* Card 3: Modernized % */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Modernized</span>
              <div
                className={`p-2 rounded-lg ${
                  hasProject && (project?.modernizedPercent || 0) > 0
                    ? "bg-emerald-200 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                    : "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className={`text-3xl font-bold font-mono ${
                  hasProject && (project?.modernizedPercent || 0) > 0
                    ? "text-emerald-700 dark:text-emerald-400"
                    : "text-slate-900 dark:text-white"
                }`}
              >
                {hasProject ? `${project?.modernizedPercent}%` : "0%"}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {hasProject ? `(${modernizedCount} of ${totalModulesCount} complete)` : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-slate-400" />
              {hasProject
                ? project?.nextModuleInQueue
                  ? `Next: ${project.nextModuleInQueue} in queue`
                  : "All modules modernized"
                : "No codebase uploaded yet"}
            </p>
          </div>

          {/* Card 4: Behavior Tests */}
          <div className="p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 transition-all flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Behavior Tests</span>
              <div className="p-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white">
                {hasProject ? `${project?.testsPassingPercent}%` : "—"}
              </span>
              <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                {hasProject ? `${project?.testsPassed}/${project?.testsTotal} Preserved` : ""}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-500 mt-2 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              {hasProject ? "Zero functional regression" : "No codebase uploaded yet"}
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
                {hasProject && (
                  <span className="text-[10px] uppercase font-mono text-slate-600 dark:text-slate-500">
                    {totalModulesCount} Modules
                  </span>
                )}
              </div>

              {hasProject && riskPieData.length > 0 ? (
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
              ) : (
                <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  <PieChartIcon className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">Upload a codebase to view risk distribution</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-3 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Upload Codebase (.zip)
                  </button>
                </div>
              )}
            </div>

            {hasProject && summary?.riskDistribution && (
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
            )}
          </div>

          {/* Top Vulnerability Frequency */}
          <div className="lg:col-span-5 p-5 rounded-2xl bg-slate-100/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Security Vulnerability Breakdown
                </h3>
                {hasProject && (
                  <span className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-200 dark:bg-rose-950/40 border border-rose-400 dark:border-rose-800/40 px-2 py-0.5 rounded">
                    AST Findings
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mb-4">
                Automated Semgrep and Python AST pattern detection across codebase.
              </p>

              {hasProject && vulnBarData.length > 0 ? (
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
              ) : (
                <div className="h-44 w-full flex flex-col items-center justify-center text-center p-4 border border-dashed border-slate-300 dark:border-slate-800 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-slate-400 mb-2 opacity-50" />
                  <p className="text-xs text-slate-500">Upload a codebase to view vulnerability breakdown</p>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="mt-3 text-[11px] font-bold text-cyan-600 dark:text-cyan-400 hover:underline"
                  >
                    Upload Codebase (.zip)
                  </button>
                </div>
              )}
            </div>

            {hasProject && (
              <div className="pt-3 border-t border-slate-300 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400">Total Security Violations:</span>
                <span className="font-mono font-bold text-rose-700 dark:text-rose-400">
                  {totalViolations} occurrences
                </span>
              </div>
            )}
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
                {hasProject
                  ? "Click any module to simulate how refactoring impacts downstream dependents in glowing cascade."
                  : "Upload a codebase to explore downstream blast radius impact and dependency graphs."}
              </p>
            </div>

            <div className="pt-4">
              {hasProject ? (
                <Link
                  href="/graph"
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  Launch Dependency Graph
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 font-bold text-xs cursor-not-allowed border border-slate-300 dark:border-slate-700"
                >
                  Upload codebase to explore impact
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Live Modernization Activity Timeline */}
        {hasProject && summary?.recentActivity && summary.recentActivity.length > 0 && (
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
        )}

        {/* Codebase Modules Grid with Filters */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Discovered Codebase Modules</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {hasProject
                  ? `${totalModulesCount} Python modules mapped from uploaded archive.`
                  : "Upload a codebase to discover Python modules and risk levels."}
              </p>
            </div>

            {/* Filter Pills */}
            {hasProject && (
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-900 border border-slate-400 dark:border-slate-800 text-xs">
                {["all", "critical", "high", "medium", "low"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setFilterRisk(level)}
                    className={`px-3 py-1 rounded-lg uppercase text-[11px] font-semibold transition-all ${
                      filterRisk === level
                        ? "bg-slate-300 dark:bg-slate-800 text-slate-900 dark:text-cyan-300 shadow-sm border border-slate-500 dark:border-slate-700 font-semibold"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            )}
          </div>

          {hasProject ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredModules.map((module) => (
                <ModuleCard key={module.id} module={module} />
              ))}
            </div>
          ) : (
            <div className="p-12 text-center rounded-2xl bg-slate-100/60 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-800 space-y-3">
              <Layers className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                No Python modules available to display
              </p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Upload your legacy codebase .zip file using the button above to populate module analysis.
              </p>
            </div>
          )}
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

