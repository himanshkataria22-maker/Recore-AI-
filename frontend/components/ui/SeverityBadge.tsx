import React from "react";
import { IssueType, RiskLevel } from "@/lib/types";
import { getIssueTypeLabel } from "@/lib/utils";
import { Bug, KeyRound, AlertOctagon, FileQuestion, Layers } from "lucide-react";

interface SeverityBadgeProps {
  type: IssueType;
  severity: RiskLevel;
  className?: string;
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({
  type,
  severity,
  className = "",
}) => {
  const getIcon = () => {
    switch (type) {
      case "sql_injection":
        return <Bug className="w-3.5 h-3.5" />;
      case "hardcoded_secret":
        return <KeyRound className="w-3.5 h-3.5" />;
      case "deprecated_api":
        return <AlertOctagon className="w-3.5 h-3.5" />;
      case "no_tests":
        return <FileQuestion className="w-3.5 h-3.5" />;
      case "high_complexity":
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return null;
    }
  };

  const getStyle = () => {
    switch (severity) {
      case "critical":
        return "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30";
      case "high":
        return "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-500/30";
      case "medium":
        return "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30";
      case "low":
        return "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/30";
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${getStyle()} ${className}`}
    >
      {getIcon()}
      <span>{getIssueTypeLabel(type)}</span>
    </span>
  );
};
