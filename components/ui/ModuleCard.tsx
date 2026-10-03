import React from "react";
import Link from "next/link";
import { Module } from "@/lib/types";
import { RiskBadge } from "./RiskBadge";
import { StatusBadge } from "./StatusBadge";
import { ArrowRight, Code2, AlertTriangle, GitFork } from "lucide-react";

interface ModuleCardProps {
  module: Module;
  className?: string;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({ module, className = "" }) => {
  return (
    <div
      className={`group relative p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 transition-all duration-200 shadow-lg hover:shadow-cyan-950/20 flex flex-col justify-between ${className}`}
    >
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                {module.name}
              </span>
              <StatusBadge status={module.status} />
            </div>
            <p className="text-xs font-mono text-slate-400 truncate mt-0.5">{module.path}</p>
          </div>
          <RiskBadge level={module.riskLevel} score={module.riskScore} />
        </div>

        <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-4">
          {module.summary}
        </p>
      </div>

      <div>
        <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-800/60 text-xs mb-4">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Lines</span>
            <span className="font-mono font-semibold text-slate-200">{module.loc} LOC</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Complexity</span>
            <span className="font-mono font-semibold text-slate-200">{module.complexity}</span>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px] uppercase">Issues</span>
            <span className="font-mono font-semibold text-rose-400">
              {module.issues.length} detected
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1" title="Used by N modules">
              <GitFork className="w-3.5 h-3.5 text-slate-500" />
              {module.usedBy.length} dependents
            </span>
          </div>

          <Link
            href={`/module/${module.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 group-hover:translate-x-0.5 transition-transform"
          >
            Inspect Module
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
