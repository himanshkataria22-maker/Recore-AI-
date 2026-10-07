import React, { useState } from "react";
import { BusinessRule } from "@/lib/types";
import { Sparkles, Check, Copy, FileText, AlertCircle } from "lucide-react";

interface RuleCardProps {
  rule: BusinessRule;
  onExportSpec?: (rule: BusinessRule) => void;
}

export const RuleCard: React.FC<RuleCardProps> = ({ rule, onExportSpec }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `### Business Rule: ${rule.plainEnglish}\n\nLocation: Line ${rule.line} (${rule.moduleName || rule.moduleId})\nConfidence: ${rule.confidence}%\n\n\`\`\`python\n${rule.codeSnippet}\n\`\`\`\n\nImplication: ${rule.implication || "N/A"}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case "pricing":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "compliance":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "security":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "workflow":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20";
    }
  };

  return (
    <div className="rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/90 p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30">
              <Sparkles className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              {rule.id}
            </span>
            {rule.category && (
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider border ${getCategoryBadge(
                  rule.category
                )}`}
              >
                {rule.category}
              </span>
            )}
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Line {rule.line}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              {rule.confidence}% confidence
            </div>
          </div>
        </div>

        {/* Plain English rule specification */}
        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug mb-3">
          {rule.plainEnglish}
        </h4>

        {/* Code Snippet */}
        <div className="relative rounded-xl bg-slate-50 dark:bg-slate-950/90 border border-slate-200 dark:border-slate-800/80 p-3.5 mb-3 font-mono text-xs overflow-x-auto">
          <div className="text-[10px] text-slate-500 mb-1 flex items-center justify-between select-none">
            <span>EXTRACTED AST SNIPPET (LINE {rule.line})</span>
            <button
              onClick={handleCopy}
              className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
          <pre className="text-slate-800 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
            {rule.codeSnippet}
          </pre>
        </div>

        {rule.implication && (
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/10 text-xs text-amber-800 dark:text-amber-300/90 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Modernization Requirement:</strong> {rule.implication}
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800/50">
        <span className="text-xs text-slate-500 font-mono">
          Target Module: {rule.moduleName || rule.moduleId}
        </span>
        <button
          onClick={() => onExportSpec?.(rule)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 hover:text-slate-950 dark:hover:text-white transition-all border border-slate-300 dark:border-slate-700/60 shadow-xs"
        >
          <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-cyan-400" />
          Export as Spec
        </button>
      </div>
    </div>
  );
};
