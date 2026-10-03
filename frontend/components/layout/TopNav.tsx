"use client";

import React, { useState, useEffect } from "react";
import {
  GitBranch,
  Search,
  Sparkles,
  ShieldCheck,
  Zap,
  Radio,
} from "lucide-react";
import { UploadAnalysisModal } from "../ui/UploadAnalysisModal";
import { getHealthStatus } from "@/lib/api";

interface TopNavProps {
  onSearchChange?: (query: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDemoMode, setIsDemoMode] = useState<boolean | null>(null);

  useEffect(() => {
    getHealthStatus()
      .then((res) => {
        setIsDemoMode(Boolean(res.demoMode));
      })
      .catch(() => {
        setIsDemoMode(false);
      });
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left Section: Active Project & Branch indicator */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">LegacyBillingPython</span>
            <span className="text-slate-500">/</span>
            <span className="flex items-center gap-1 font-mono text-slate-300">
              <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
              main (v2.14-legacy)
            </span>
          </div>

          {/* Demo mode indicator */}
          {isDemoMode && (
            <span className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>Demo Mode (Cached)</span>
            </span>
          )}

          {!isDemoMode && isDemoMode !== null && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-emerald-400 font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <Radio className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live LLM Active</span>
            </span>
          )}
        </div>

        {/* Center Search Input */}
        <div className="hidden lg:flex items-center max-w-md w-full mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Search modules, vulnerabilities, business rules (e.g. 'auth.py', 'sql_injection')..."
              className="w-full bg-slate-900/80 border border-slate-800 rounded-xl py-2 pl-9 pr-4 text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 transition-colors"
            />
          </div>
        </div>

        {/* Right Section Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>New Analysis</span>
          </button>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quick status pill */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Verification Gate:</span>
            <strong className="text-white">Active</strong>
          </div>
        </div>
      </header>

      <UploadAnalysisModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAnalysisCompleted={() => {
          setIsModalOpen(false);
          if (typeof window !== "undefined") {
            window.location.reload();
          }
        }}
      />
    </>
  );
};
