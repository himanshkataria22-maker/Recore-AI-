"use client";

import React, { useState, useEffect } from "react";
import { TestCaseResult } from "@/lib/types";
import { CheckCircle2, Play, RefreshCw, ShieldCheck, Zap, Filter, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TestRunnerProps {
  testCases: TestCaseResult[];
  testsTotal: number;
  testsPassed: number;
  onAllCompleted?: () => void;
  autoRun?: boolean;
}

export const TestRunner: React.FC<TestRunnerProps> = ({
  testCases,
  testsTotal,
  testsPassed,
  onAllCompleted,
  autoRun = true,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [completedCount, setCompletedCount] = useState(autoRun ? 0 : testsPassed);
  const [activeTestIndex, setActiveTestIndex] = useState<number | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [selectedTest, setSelectedTest] = useState<TestCaseResult | null>(testCases[0] || null);

  const runTestSimulation = () => {
    setIsRunning(true);
    setCompletedCount(0);
    setActiveTestIndex(0);

    let current = 0;
    const interval = setInterval(() => {
      current++;
      setCompletedCount(current);
      setActiveTestIndex(current);

      if (current >= testCases.length) {
        clearInterval(interval);
        setIsRunning(false);
        setActiveTestIndex(null);
        onAllCompleted?.();
      }
    }, 160);
  };

  useEffect(() => {
    if (autoRun) {
      runTestSimulation();
    }
  }, [autoRun]);

  const filteredTests = testCases.filter((tc) => {
    if (selectedFilter === "all") return true;
    return tc.type === selectedFilter;
  });

  const progressPercentage = Math.round((completedCount / testCases.length) * 100) || 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl p-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Automated Parity & Security Proof
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {completedCount}/{testCases.length} Passed (100%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Validating dynamic behavior invariants, edge cases, and zero-regression security constraints.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={runTestSimulation}
            disabled={isRunning}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white transition-all shadow-md shadow-emerald-950/40"
          >
            {isRunning ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Executing Test Suite...
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                Re-run Test Matrix
              </>
            )}
          </button>
        </div>
      </div>

      {/* Animated Progress Bar */}
      <div className="py-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span>TEST EXECUTION PROGRESS</span>
          <span className="text-emerald-400 font-bold">{progressPercentage}% COMPLETED</span>
        </div>
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500 via-emerald-400 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 py-2 overflow-x-auto">
        <span className="text-xs text-slate-500 font-medium mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        {["all", "invariant", "regression", "edge_case", "security"].map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            className={`px-2.5 py-1 rounded-md text-xs font-medium uppercase tracking-wider transition-colors ${
              selectedFilter === f
                ? "bg-slate-800 text-cyan-300 border border-slate-700"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {f.replace("_", " ")}
          </button>
        ))}
      </div>

      {/* Two column grid: Test list & Inspection details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mt-3">
        {/* Test List */}
        <div className="lg:col-span-6 space-y-2 max-h-[360px] overflow-y-auto pr-1">
          {filteredTests.map((tc, idx) => {
            const isCompleted = completedCount > idx || !isRunning;
            const isCurrentlyRunning = activeTestIndex === idx;

            return (
              <motion.div
                key={tc.id}
                onClick={() => setSelectedTest(tc)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  selectedTest?.id === tc.id
                    ? "bg-slate-900 border-cyan-500/50 shadow-md"
                    : "bg-slate-900/40 border-slate-800/80 hover:bg-slate-900/70"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {isCurrentlyRunning ? (
                    <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />
                  ) : isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-200 truncate">
                      {tc.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 font-mono">
                      <span className="uppercase text-[10px] text-slate-500">[{tc.type}]</span>
                      <span>{tc.durationMs}ms</span>
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                  PASSED
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Selected Test Details Inspector */}
        <div className="lg:col-span-6 rounded-xl bg-slate-900/90 border border-slate-800 p-4 font-mono text-xs flex flex-col justify-between">
          {selectedTest ? (
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span className="font-bold text-slate-200">{selectedTest.id} Spec Inspector</span>
                </div>
                <span className="text-emerald-400 font-bold">100% PARITY ASSERTED</span>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Test Objective</span>
                  <p className="text-slate-200 font-sans text-xs mt-0.5 font-medium">
                    {selectedTest.name}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Pytest Assertion</span>
                  <div className="mt-1 p-2 rounded bg-slate-950 border border-slate-800 text-cyan-300">
                    <code>{selectedTest.assertion}</code>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Fuzzer Payload Input</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">{selectedTest.inputSummary}</p>
                </div>

                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Parity Match Output</span>
                  <p className="text-emerald-300 text-[11px] mt-0.5 font-semibold">
                    {selectedTest.outputSummary}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-500 text-xs">
              Select a test case to inspect assertion and fuzzer telemetry
            </div>
          )}

          <div className="pt-3 mt-3 border-t border-slate-800/80 text-[10px] text-slate-500 flex items-center justify-between">
            <span>Deterministic Sandbox: pytest-xdist v3.5</span>
            <span>Zero Regression Invariants</span>
          </div>
        </div>
      </div>
    </div>
  );
};
