"use client";

import React, { useState } from "react";
import {
  Search,
  Sparkles,
} from "lucide-react";
import { UploadAnalysisModal } from "../ui/UploadAnalysisModal";
import { ThemeToggle } from "../ui/ThemeToggle";
import { UserMenu } from "../ui/UserMenu";

interface TopNavProps {
  onSearchChange?: (query: string) => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onSearchChange }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    onSearchChange?.(e.target.value);
  };

  return (
    <>
      <header className="h-16 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Removed project/branch indicator */}
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
          {/* Theme Toggle */}
          <ThemeToggle />

          <div className="h-4 w-px bg-slate-800 dark:bg-slate-800 light:bg-slate-300" />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-slate-900 font-semibold text-xs transition-all shadow-sm active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Analysis</span>
          </button>

          <div className="h-4 w-px bg-slate-800 dark:bg-slate-800 light:bg-slate-300" />

          {/* User Menu */}
          <UserMenu />
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
