import React from "react";
import { RiskLevel } from "@/lib/types";
import { getRiskBadgeClasses } from "@/lib/utils";
import { ShieldAlert, AlertTriangle, ShieldCheck, Info } from "lucide-react";

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  showIcon?: boolean;
  className?: string;
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({
  level,
  score,
  showIcon = true,
  className = "",
}) => {
  const getIcon = () => {
    switch (level) {
      case "critical":
        return <ShieldAlert className="w-3.5 h-3.5" />;
      case "high":
        return <AlertTriangle className="w-3.5 h-3.5" />;
      case "medium":
        return <Info className="w-3.5 h-3.5" />;
      case "low":
        return <ShieldCheck className="w-3.5 h-3.5" />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${getRiskBadgeClasses(
        level
      )} ${className}`}
    >
      {showIcon && getIcon()}
      <span>{level}</span>
      {score !== undefined && (
        <span className="ml-0.5 opacity-80 font-mono font-normal">({score})</span>
      )}
    </span>
  );
};
