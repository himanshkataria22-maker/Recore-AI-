import React from "react";
import { ModuleStatus } from "@/lib/types";
import { Sparkles, History, Loader2 } from "lucide-react";

interface StatusBadgeProps {
  status: ModuleStatus;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
  switch (status) {
    case "modernized":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${className}`}
        >
          <Sparkles className="w-3 h-3 text-emerald-400" />
          Modernized
        </span>
      );
    case "analyzing":
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 ${className}`}
        >
          <Loader2 className="w-3 h-3 text-cyan-400 animate-spin" />
          Synthesizing
        </span>
      );
    case "legacy":
    default:
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-500/10 text-slate-400 border border-slate-700/50 ${className}`}
        >
          <History className="w-3 h-3 text-slate-400" />
          Legacy
        </span>
      );
  }
};
