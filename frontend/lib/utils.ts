import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { RiskLevel, IssueType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getRiskColor(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "#ef4444";
    case "high":
      return "#f97316";
    case "medium":
      return "#eab308";
    case "low":
      return "#22c55e";
    default:
      return "#94a3b8";
  }
}

export function getRiskBadgeClasses(level: RiskLevel): string {
  switch (level) {
    case "critical":
      return "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20";
    case "high":
      return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20";
    case "medium":
      return "bg-yellow-50 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20";
    case "low":
      return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20";
    default:
      return "bg-slate-100 dark:bg-slate-500/10 text-slate-700 dark:text-slate-400 border border-slate-200 dark:border-slate-500/20";
  }
}

export function getIssueTypeLabel(type: IssueType): string {
  switch (type) {
    case "sql_injection":
      return "SQL Injection";
    case "hardcoded_secret":
      return "Hardcoded Secret";
    case "deprecated_api":
      return "Deprecated API";
    case "no_tests":
      return "Zero Test Coverage";
    case "high_complexity":
      return "High Cyclomatic Complexity";
    default:
      return type;
  }
}

export function formatLoc(loc: number): string {
  return loc >= 1000 ? `${(loc / 1000).toFixed(1)}k` : `${loc}`;
}
