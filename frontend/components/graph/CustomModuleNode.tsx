"use client";

import React, { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { RiskLevel, ModuleStatus } from "@/lib/types";
import { getRiskColor, getRiskBadgeClasses } from "@/lib/utils";
import { ShieldAlert, AlertTriangle, ShieldCheck, Code2, Sparkles, Flame } from "lucide-react";

export interface CustomNodeData {
  label: string;
  path: string;
  riskScore: number;
  riskLevel: RiskLevel;
  loc: number;
  complexity: number;
  issuesCount: number;
  status: ModuleStatus;
  dependsOnCount: number;
  usedByCount: number;
  isBlastTarget?: boolean;
  isBlastAffected?: boolean;
  isDimmed?: boolean;
}

export const CustomModuleNode = memo(({ data, selected }: NodeProps) => {
  const nodeData = data as unknown as CustomNodeData;
  const riskColor = getRiskColor(nodeData.riskLevel);

  // Dynamic node sizing based on LOC
  // 185 loc -> ~170px width, 780 loc -> ~230px width
  const minWidth = Math.min(Math.max(180, Math.round(160 + (nodeData.loc / 800) * 80)), 260);

  return (
    <div
      style={{ width: `${minWidth}px` }}
      className={`relative rounded-2xl transition-all duration-300 select-none p-3.5 border ${
        nodeData.isBlastTarget
          ? "bg-rose-950 border-rose-500 shadow-[0_0_25px_rgba(244,63,94,0.8)] scale-105 z-30"
          : nodeData.isBlastAffected
          ? "bg-rose-950/70 border-rose-500 shadow-[0_0_18px_rgba(244,63,94,0.5)] scale-102 z-20"
          : selected
          ? "bg-slate-900 border-cyan-400 shadow-[0_0_15px_rgba(56,189,248,0.4)] z-10"
          : nodeData.isDimmed
          ? "opacity-25 bg-slate-950 border-slate-800"
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-xl"
      }`}
    >
      {/* Target input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-2.5 h-2.5 !bg-cyan-400 !border-slate-950"
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <Code2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="font-mono text-xs font-bold text-white truncate">
            {nodeData.label}
          </span>
        </div>

        {nodeData.isBlastTarget ? (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white animate-pulse">
            <Flame className="w-3 h-3" /> Origin
          </span>
        ) : nodeData.isBlastAffected ? (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
            Affected
          </span>
        ) : (
          <span
            className="w-2.5 h-2.5 rounded-full shrink-0"
            style={{
              backgroundColor: riskColor,
              boxShadow: `0 0 8px ${riskColor}`,
            }}
          />
        )}
      </div>

      {/* Path preview */}
      <p className="text-[10px] font-mono text-slate-400 truncate mb-2">
        {nodeData.path}
      </p>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-1 py-1.5 px-2 rounded-lg bg-slate-950/70 border border-slate-800/60 text-[10px] font-mono text-slate-300">
        <div>
          <span className="text-slate-500 block text-[9px]">LOC</span>
          <span className="font-semibold text-white">{nodeData.loc}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">RISK</span>
          <span
            className="font-bold"
            style={{ color: riskColor }}
          >
            {nodeData.riskScore}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block text-[9px]">ISSUES</span>
          <span
            className={`font-semibold ${
              nodeData.issuesCount > 0 ? "text-rose-400" : "text-emerald-400"
            }`}
          >
            {nodeData.issuesCount}
          </span>
        </div>
      </div>

      {/* Source output handle */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-2.5 h-2.5 !bg-indigo-400 !border-slate-950"
      />
    </div>
  );
});

CustomModuleNode.displayName = "CustomModuleNode";
