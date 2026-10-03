"use client";

import React, { useState, useRef } from "react";
import { uploadProjectZip, getProjectStatus } from "@/lib/api";
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
  AlertCircle,
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState<"zip" | "git">("zip");
  const [repoUrl, setRepoUrl] = useState("https://github.com/enterprise/legacy-billing-py");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [projectId, setProjectId] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<{
    modules: number;
    filesExtracted: number;
    filesSkipped: number;
  }>({ modules: 0, filesExtracted: 0, filesSkipped: 0 });

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast.error("Invalid File", "Please select a .zip file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File Too Large", "Maximum zip file size is 10 MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const pollProjectStatus = async (projectId: string) => {
    let attempts = 0;
    const maxAttempts = 60; // 60 seconds max

    const poll = async () => {
      try {
        const status = await getProjectStatus(projectId);
        
        setProgress(status.progress);
        
        if (status.status === "analyzing") {
          setCurrentStep("Analyzing code structure and security vulnerabilities...");
        } else if (status.status === "queued") {
          setCurrentStep("Queued for analysis...");
        }
        
        if (status.status === "done") {
          setIsCompleted(true);
          setAnalysisResult({
            modules: status.moduleCount,
            filesExtracted: status.filesExtracted,
            filesSkipped: status.filesSkipped,
          });
          toast.success(
            "Analysis Complete",
            `${status.moduleCount} Python modules mapped and analyzed.`
          );
          return;
        }
        
        if (status.status === "failed") {
          throw new Error(status.error || "Analysis failed");
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 1000); // Poll every second
        } else {
          throw new Error("Analysis timed out");
        }
      } catch (err) {
        setIsAnalyzing(false);
        toast.error("Analysis Failed", err instanceof Error ? err.message : "Unknown error");
      }
    };

    poll();
  };

  const handleStartAnalysis = async () => {
    if (activeTab === "zip" && !selectedFile) {
      toast.warning("No File Selected", "Please select a .zip file to upload");
      return;
    }

    if (activeTab === "git") {
      toast.info("Coming Soon", "Git repository import will be available in the next release");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);
    setIsCompleted(false);
    setCurrentStep("Uploading file...");

    try {
      const result = await uploadProjectZip(selectedFile!, (pct, status) => {
        setProgress(pct);
        setCurrentStep(status);
      });

      setProjectId(result.projectId);
      setAnalysisResult({
        modules: 0,
        filesExtracted: result.filesExtracted,
        filesSkipped: result.filesSkipped,
      });
      
      setCurrentStep("Starting analysis...");
      
      // Start polling for analysis status
      await pollProjectStatus(result.projectId);
      
    } catch (err) {
      setIsAnalyzing(false);
      toast.error(
        "Upload Failed",
        err instanceof Error ? err.message : "Could not upload project"
      );
    }
  };

  const handleFinish = () => {
    setIsAnalyzing(false);
    setIsCompleted(false);
    setSelectedFile(null);
    setProgress(0);
    setProjectId("");
    onClose();
    onAnalysisCompleted?.();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const file = e.dataTransfer.files[0];
    if (file) {
      if (!file.name.endsWith('.zip')) {
        toast.error("Invalid File", "Please drop a .zip file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File Too Large", "Maximum zip file size is 10 MB");
        return;
      }
      setSelectedFile(file);
    }
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
              <h3 className="text-base font-bold text-white">Upload Legacy Python Codebase</h3>
              <p className="text-xs text-slate-400">
                Upload a .zip archive (max 10 MB) for AST analysis and risk assessment.
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
                  Git Repository (Soon)
                </button>
              </div>

              {/* Source Inputs */}
              {activeTab === "zip" ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".zip"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div
                    onClick={handleBrowseClick}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className="border-2 border-dashed border-slate-700 hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 transition-colors"
                  >
                    <div className="p-3 rounded-full bg-slate-800 text-cyan-400 mb-3">
                      <FileCode className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-semibold text-white">
                      {selectedFile ? selectedFile.name : "Drag and drop your codebase .zip here"}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports Python .zip archives up to 10 MB
                    </p>
                    <span className="mt-3 px-3 py-1 rounded-full text-[11px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      {selectedFile
                        ? `Ready (${(selectedFile.size / 1024 / 1024).toFixed(2)} MB)`
                        : "Click to Browse Files"}
                    </span>
                  </div>
                  
                  {selectedFile && (
                    <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 flex items-start gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-300">File Ready</p>
                        <p className="text-slate-400 mt-0.5">
                          {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                        </p>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-2 text-xs">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-300">Coming Soon</p>
                      <p className="text-slate-400 mt-0.5">
                        Git repository import will be available in the next release. Please use ZIP upload for now.
                      </p>
                    </div>
                  </div>
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
                <h4 className="text-base font-bold text-white">Analyzing Python Codebase</h4>
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
                <h4 className="text-base font-bold text-white">Analysis Complete!</h4>
                <p className="text-xs text-slate-300 mt-1">
                  Successfully analyzed {analysisResult.modules} modules from your Python codebase.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[10px]">MODULES</span>
                  <span className="font-bold text-white">{analysisResult.modules}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FILES EXTRACTED</span>
                  <span className="font-bold text-emerald-400">{analysisResult.filesExtracted}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">FILES SKIPPED</span>
                  <span className="font-bold text-slate-400">{analysisResult.filesSkipped}</span>
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
                disabled={activeTab === "zip" && !selectedFile}
                className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
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
              View Dashboard
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
};
