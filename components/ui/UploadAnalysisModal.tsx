"use client";

import React, { useState } from "react";
import { triggerAnalysis } from "@/lib/api";
import { useToast } from "./ToastContext";
import {
  UploadCloud,
  FileCode,
  GitBranch,
  CheckCircle2,
  Loader2,
  X,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAnalysisCompleted?: () => void;
}

export const UploadAnalysisModal: React.FC<UploadAnalysisModalProps> = ({
  isOpen,
  onClose,
  onAnalysisCompleted,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"zip" | "git">("zip");
  const [repoUrl, setRepoUrl] = useState("https://github.com/enterprise/legacy-billing-py");
  const [selectedFile, setSelectedFile] = useState<string | null>("legacy_billing_system_v2.14.zip");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  if (!isOpen) return null;

  const handleStartAnalysis = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setIsCompleted(false);

    try {
      const source = activeTab === "zip" ? selectedFile || "archive.zip" : repoUrl;
      await triggerAnalysis(source, (stepText, pct) => {
        setCurrentStep(stepText);
        setProgress(pct);
      });

      setIsCompleted(true);
      toast.success("Analysis Complete", "12 Python modules mapped, 6 critical issues identified.");
    } catch (err) {
      toast.error("Analysis Failed", "Could not complete legacy code scanning.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFinish = () => {
    onClose();
    onAnalysisCompleted?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Start New Legacy Codebase Analysis</h3>
              <p className="text-xs text-slate-400">
                Scan Python repositories for security risks, dependencies, and hidden rules.
              </p>
            </div>
          </div>
          {!isAnalyzing && (
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {!isAnalyzing && !isCompleted ? (
            <>
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-medium">
                <button
                  onClick={() => setActiveTab("zip")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                    activeTab === "zip"
                      ? "bg-slate-800 text-cyan-300 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  Upload ZIP Archive
                </button>
                <button
                  onClick={() => setActiveTab("git")}
                  className={`flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${
                    activeTab === "git"
                      ? "bg-slate-800 text-cyan-300 font-semibold shadow-sm"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  <GitBranch className="w-3.5 h-3.5" />
                  Git Repository URL
                </button>
              </div>

              {/* Source Inputs */}
              {activeTab === "zip" ? (
                <div
                  onClick={() => setSelectedFile("enterprise_billing_legacy_v2.zip")}
                  className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 transition-colors"
                >
                  <div className="p-3 rounded-full bg-slate-800 text-cyan-400 mb-3">
                    <FileCode className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-semibold text-white">
                    {selectedFile ? selectedFile : "Drag and drop your codebase .zip here"}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Supports Python 2.7–3.12 archives up to 500MB
                  </p>
                  <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                    {selectedFile ? "Ready for AST ingest (4.8MB)" : "Browse Files"}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-xs font-medium text-slate-300">
                    GitHub / GitLab Repository URL
                  </label>
                  <div className="relative">
                    <GitBranch className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/org/legacy-repo"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">
                    ReCore will clone a ephemeral read-only AST snapshot for rule extraction.
                  </p>
                </div>
              )}
            </>
          ) : isAnalyzing ? (
            /* Analysis in progress */
            <div className="py-6 flex flex-col items-center justify-center text-center space-y-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-slate-800 border-t-cyan-400 animate-spin flex items-center justify-center" />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-cyan-400">
                  {progress}%
                </div>
              </div>

              <div>
                <h4 className="text-base font-bold text-white">Synthesizing Code Intelligence</h4>
                <p className="text-xs text-cyan-300 font-mono mt-1 h-5">{currentStep}</p>
              </div>

              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div
                  className="bg-cyan-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            /* Analysis Completed Screen */
            <div className="py-4 space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">Codebase Successfully Mapped!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  ReCore AI parsed 12 modules, generated full AST graph, and highlighted 6 critical risks.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">MODULES</span>
                  <span className="font-bold text-white">12 discovered</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">TOTAL LOC</span>
                  <span className="font-bold text-white">5,157 lines</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">CRITICAL RISKS</span>
                  <span className="font-bold text-rose-400">6 flagged</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-end gap-3">
          {!isAnalyzing && !isCompleted ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartAnalysis}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Start Analysis
              </button>
            </>
          ) : isCompleted ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-6 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all shadow-lg shadow-emerald-500/20"
            >
              Explore Project Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
