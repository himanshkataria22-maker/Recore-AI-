"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useProject } from "@/contexts/ProjectContext";
import {
  LayoutDashboard,
  Network,
  CalendarCheck2,
  ShieldCheck,
  Code2,
  Cpu,
  RotateCcw,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { hasProject, project, resetProject } = useProject();

  const isMockEnv = process.env.NEXT_PUBLIC_USE_MOCK === "true";

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: hasProject && project ? `${project.totalModules} Modules` : undefined,
    },
    {
      name: "Dependency Graph",
      href: "/graph",
      icon: Network,
      badge: undefined,
    },
    {
      name: "Modernization Planner",
      href: "/planner",
      icon: CalendarCheck2,
      badge: undefined,
    },
    {
      name: "Validation & Proof",
      href: hasProject && project && project.modules[0] ? `/validate/${project.modules[0].id}` : "/validate/billing",
      icon: ShieldCheck,
      badge: hasProject && project ? `${project.testsPassed}/${project.testsTotal} Tests` : undefined,
      highlight: true,
    },
  ];

  const highRiskModules = hasProject && project
    ? project.modules
        .filter((m) => m.riskLevel === "critical" || m.riskLevel === "high")
        .slice(0, 5)
    : [];

  return (
    <aside className="w-64 border-r border-slate-300 dark:border-slate-800/80 bg-white dark:bg-slate-950/95 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div className="p-4 flex flex-col gap-6 overflow-y-auto">
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-2 group">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-purple-600 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <Cpu className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-cyan-700 dark:group-hover:text-cyan-400 transition-colors">
                ReCore
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border border-cyan-500/30 dark:border-cyan-500/20 font-semibold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">Legacy Modernization</p>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
            Platform Engine
          </span>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href) ||
                    (item.href.startsWith("/validate") && pathname.startsWith("/validate"));

              const Icon = item.icon;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-blue-100 dark:bg-slate-800 text-blue-900 dark:text-cyan-300 shadow-sm border border-blue-300 dark:border-slate-700/80 font-semibold"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-blue-900 dark:text-cyan-400"
                          : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        item.highlight
                          ? "bg-emerald-200 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-500/20 font-bold"
                          : "bg-slate-200 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-400 dark:border-slate-800"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Quick Module Inspector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-500">
              High-Risk Modules
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-500 font-mono">
              {hasProject && project ? `${project.totalModules} Total` : "0 Total"}
            </span>
          </div>

          <div className="space-y-0.5">
            {hasProject && highRiskModules.length > 0 ? (
              highRiskModules.map((m) => {
                const isModuleActive = pathname === `/module/${m.id}`;
                return (
                  <Link
                    key={m.id}
                    href={`/module/${m.id}`}
                    className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-colors group ${
                      isModuleActive
                        ? "bg-blue-100 dark:bg-cyan-950/40 text-blue-900 dark:text-cyan-300 border border-blue-300 dark:border-cyan-500/30"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Code2 className="w-3.5 h-3.5 text-slate-600 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 shrink-0" />
                      <span className="truncate">{m.name}</span>
                    </div>
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        m.riskLevel === "critical"
                          ? "bg-rose-500 shadow-[0_0_6px_#f43f5e]"
                          : "bg-amber-500"
                      }`}
                    />
                  </Link>
                );
              })
            ) : (
              <div className="px-3 py-3 rounded-lg bg-slate-100/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/60 text-[11px] text-slate-500 dark:text-slate-500 italic">
                Upload a codebase to see risky modules
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info Card */}
      <div className="p-4 border-t border-slate-300 dark:border-slate-800/80 bg-slate-100 dark:bg-slate-950/80">
        <div className="p-3 rounded-xl bg-slate-200 dark:bg-slate-900/80 border border-slate-400 dark:border-slate-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Environment
            </span>
            <span className={`inline-flex items-center gap-1 text-[10px] font-mono ${isMockEnv ? "text-amber-500" : "text-emerald-400"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isMockEnv ? "bg-amber-500 animate-pulse" : "bg-emerald-400 animate-pulse"}`} />
              {isMockEnv ? "Mock Active" : "FastAPI Live"}
            </span>
          </div>

          <p className="text-[11px] text-slate-700 dark:text-slate-300 font-mono truncate">
            NEXT_PUBLIC_USE_MOCK={isMockEnv ? "true" : "false"}
          </p>

          {hasProject && (
            <button
              onClick={resetProject}
              className="w-full mt-2 pt-2 border-t border-slate-300 dark:border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-rose-600 dark:text-rose-400 hover:underline transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              Reset / Remove Project
            </button>
          )}
        </div>
      </div>
    </aside>
  );
};
