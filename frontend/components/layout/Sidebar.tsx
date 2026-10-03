"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Network,
  CalendarCheck2,
  ShieldCheck,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  ChevronRight,
  Database,
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      badge: "12 Modules",
    },
    {
      name: "Dependency Graph",
      href: "/graph",
      icon: Network,
      badge: "Blast Radius",
    },
    {
      name: "Modernization Planner",
      href: "/planner",
      icon: CalendarCheck2,
      badge: "Quadrant",
    },
    {
      name: "Validation & Proof",
      href: "/validate/billing",
      icon: ShieldCheck,
      badge: "47/47 Tests",
      highlight: true,
    },
  ];

  const quickModules = [
    { id: "billing", name: "billing.py", risk: "critical" },
    { id: "auth", name: "auth.py", risk: "critical" },
    { id: "db_utils", name: "db_utils.py", risk: "critical" },
    { id: "discounts", name: "discounts.py", risk: "high" },
    { id: "invoice", name: "invoice.py", risk: "high" },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-slate-950/95 flex flex-col justify-between shrink-0 h-screen sticky top-0 select-none z-30">
      <div className="p-4 flex flex-col gap-6">
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
              <span className="font-bold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                ReCore
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-semibold">
                AI
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Legacy Modernization</p>
          </div>
        </Link>

        {/* Main Navigation */}
        <nav className="space-y-1">
          <span className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
                      ? "bg-slate-800 text-white shadow-sm border border-slate-700/80 font-semibold"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive
                          ? "text-cyan-400"
                          : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        item.highlight
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
                          : "bg-slate-900 text-slate-400 border border-slate-800"
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              High-Risk Modules
            </span>
            <span className="text-[10px] text-slate-500 font-mono">12 Total</span>
          </div>
          <div className="space-y-0.5">
            {quickModules.map((m) => {
              const isModuleActive = pathname === `/module/${m.id}`;
              return (
                <Link
                  key={m.id}
                  href={`/module/${m.id}`}
                  className={`flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-mono transition-colors group ${
                    isModuleActive
                      ? "bg-cyan-950/40 text-cyan-300 border border-cyan-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    <Code2 className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                    <span className="truncate">{m.name}</span>
                  </div>
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                      m.risk === "critical" ? "bg-rose-500 shadow-[0_0_6px_#f43f5e]" : "bg-amber-500"
                    }`}
                  />
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer Info Card */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/80">
        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Environment
            </span>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Mock Active
            </span>
          </div>
          <p className="text-[11px] text-slate-300 font-mono truncate">
            NEXT_PUBLIC_USE_MOCK=true
          </p>
          <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>FastAPI Bridge</span>
            <span className="text-cyan-400 hover:underline cursor-pointer">Config</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
