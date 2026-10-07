import React from "react";
import { getRiskColor } from "@/lib/utils";
import { RiskLevel } from "@/lib/types";

interface RiskGaugeProps {
  score: number; // 0 - 100
  level: RiskLevel;
  size?: number;
  strokeWidth?: number;
  label?: string;
  showDetails?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  size = 140,
  strokeWidth = 10,
  label = "Risk Index",
  showDetails = true,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const strokeColor = getRiskColor(level);

  return (
    <div className="relative flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          className="transform -rotate-90"
          width={size}
          height={size}
        >
          {/* Background track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800/80"
            fill="transparent"
          />
          {/* Progress gauge with smooth transition */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            style={{
              transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
              filter: `drop-shadow(0 0 8px ${strokeColor}40)`,
            }}
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold font-mono tracking-tight text-slate-900 dark:text-white">
            {score}
          </span>
          <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-600 dark:text-slate-400">
            / 100
          </span>
        </div>
      </div>

      {showDetails && (
        <div className="mt-2 text-center">
          <div className="text-xs text-slate-600 dark:text-slate-400 font-medium">{label}</div>
          <div
            className="text-xs font-bold uppercase tracking-wider mt-0.5"
            style={{ color: strokeColor }}
          >
            {level} Risk
          </div>
        </div>
      )}
    </div>
  );
};
