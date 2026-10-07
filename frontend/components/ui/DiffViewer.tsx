"use client";

import React, { useState } from "react";
import { Check, Copy, Split, AlignJustify, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface DiffViewerProps {
  before: string;
  after: string;
  beforeLoc?: number;
  afterLoc?: number;
  complexityReduction?: string;
  beforeTitle?: string;
  afterTitle?: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({
  before,
  after,
  beforeLoc,
  afterLoc,
  complexityReduction,
  beforeTitle = "Legacy Baseline (Python 2.7 / 3.6)",
  afterTitle = "Modernized Synthesized Target (FastAPI / Pydantic v2)",
}) => {
  const [viewMode, setViewMode] = useState<"split" | "unified">("split");
  const [copied, setCopied] = useState(false);

  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");

  const handleCopy = () => {
    navigator.clipboard.writeText(after);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 overflow-hidden shadow-2xl">
      {/* Header controls & stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 bg-slate-100 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200 dark:bg-slate-950 rounded-lg border border-slate-300 dark:border-slate-800">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === "split"
                  ? "bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/30 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Split className="w-3.5 h-3.5" />
              Side-by-Side Diff
            </button>
            <button
              onClick={() => setViewMode("unified")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition-all ${
                viewMode === "unified"
                  ? "bg-white dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-cyan-500/30 shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <AlignJustify className="w-3.5 h-3.5" />
              Unified
            </button>
          </div>

          {complexityReduction && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md bg-purple-100 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 font-mono">
              <Zap className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Complexity: {complexityReduction}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {beforeLoc && afterLoc && (
            <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
              <span className="text-rose-600 dark:text-rose-400 line-through">{beforeLoc} LOC</span>
              <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-600" />
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">{afterLoc} LOC</span>
              <span className="text-emerald-600 dark:text-emerald-500 text-[11px]">
                (-{Math.round(((beforeLoc - afterLoc) / beforeLoc) * 100)}%)
              </span>
            </div>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-colors border border-slate-300 dark:border-slate-700/60"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Copied Modern Code
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Copy Modernized Code
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code diff display */}
      {viewMode === "split" ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 dark:divide-slate-800 font-mono text-xs max-h-[560px] overflow-auto">
          {/* Before panel */}
          <div className="flex flex-col bg-slate-50/70 dark:bg-slate-950/50">
            <div className="px-4 py-2 bg-rose-100 dark:bg-rose-950/20 border-b border-rose-200 dark:border-rose-900/30 text-rose-800 dark:text-rose-300 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
              <span>{beforeTitle}</span>
              <span className="px-2 py-0.5 rounded bg-rose-200 dark:bg-rose-500/20 text-rose-800 dark:text-rose-400 text-[10px]">
                BEFORE
              </span>
            </div>
            <div className="p-4 space-y-0.5">
              {beforeLines.map((line, idx) => (
                <div
                  key={`before-${idx}`}
                  className={`flex items-start gap-3 py-0.5 px-1 rounded ${
                    line.includes("vulnerable") ||
                    line.includes("execute") ||
                    line.includes("MD5") ||
                    line.includes("password_raw ==") ||
                    line.includes("if plan_code ==")
                      ? "bg-rose-100 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border-l-2 border-rose-500 pl-2"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  <span className="w-7 text-right select-none text-slate-400 dark:text-slate-600 font-mono text-[11px]">
                    {idx + 1}
                  </span>
                  <pre className="font-mono whitespace-pre-wrap break-all flex-1">{line || " "}</pre>
                </div>
              ))}
            </div>
          </div>

          {/* After panel */}
          <div className="flex flex-col bg-white dark:bg-slate-950/90">
            <div className="px-4 py-2 bg-emerald-100 dark:bg-emerald-950/20 border-b border-emerald-200 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px] uppercase tracking-wider flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
              <span>{afterTitle}</span>
              <span className="px-2 py-0.5 rounded bg-emerald-200 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-400 text-[10px]">
                AFTER (CERTIFIED)
              </span>
            </div>
            <div className="p-4 space-y-0.5">
              {afterLines.map((line, idx) => (
                <div
                  key={`after-${idx}`}
                  className={`flex items-start gap-3 py-0.5 px-1 rounded ${
                    line.includes("async") ||
                    line.includes("Decimal") ||
                    line.includes("BaseModel") ||
                    line.includes("quantize") ||
                    line.includes("Session")
                      ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border-l-2 border-emerald-500 pl-2"
                      : "text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white"
                  }`}
                >
                  <span className="w-7 text-right select-none text-slate-400 dark:text-slate-600 font-mono text-[11px]">
                    {idx + 1}
                  </span>
                  <pre className="font-mono whitespace-pre-wrap break-all flex-1">{line || " "}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Unified view */
        <div className="p-4 font-mono text-xs max-h-[560px] overflow-auto space-y-0.5 bg-slate-50 dark:bg-slate-950">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Unified Change Set
          </div>
          {beforeLines.map((bLine, i) => (
            <div
              key={`u-b-${i}`}
              className="flex items-start gap-3 py-0.5 px-2 bg-rose-100 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300 rounded"
            >
              <span className="select-none text-rose-600 dark:text-rose-500 font-bold">-</span>
              <span className="w-7 text-right select-none text-slate-400 dark:text-slate-600">{i + 1}</span>
              <pre className="font-mono whitespace-pre-wrap break-all flex-1">{bLine || " "}</pre>
            </div>
          ))}
          <div className="my-2 border-t border-slate-200 dark:border-slate-800" />
          {afterLines.map((aLine, i) => (
            <div
              key={`u-a-${i}`}
              className="flex items-start gap-3 py-0.5 px-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 rounded"
            >
              <span className="select-none text-emerald-600 dark:text-emerald-500 font-bold">+</span>
              <span className="w-7 text-right select-none text-slate-400 dark:text-slate-600">{i + 1}</span>
              <pre className="font-mono whitespace-pre-wrap break-all flex-1">{aLine || " "}</pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
