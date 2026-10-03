"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/AppLayout";
import { getModules } from "@/lib/api";
import { Module, RiskLevel } from "@/lib/types";
import { CustomModuleNode, CustomNodeData } from "@/components/graph/CustomModuleNode";
import { RiskBadge } from "@/components/ui/RiskBadge";
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import {
  Flame,
  GitFork,
  ArrowRight,
  RefreshCw,
  Info,
  ShieldAlert,
  AlertTriangle,
  Sparkles,
  Layers,
  X,
  Zap,
} from "lucide-react";

const nodeTypes = {
  customModule: CustomModuleNode,
};

export default function DependencyGraphPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>("db_utils");
  const [riskFilter, setRiskFilter] = useState<string>("all");

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // Calculate transitive blast radius (all modules that depend on target)
  const blastRadiusInfo = useMemo(() => {
    if (!selectedModuleId || modules.length === 0) return null;

    const targetMod = modules.find((m) => m.id === selectedModuleId);
    if (!targetMod) return null;

    const affectedSet = new Set<string>();
    const queue = [...targetMod.usedBy];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      if (!affectedSet.has(currentId) && currentId !== targetMod.id) {
        affectedSet.add(currentId);
        const currentMod = modules.find((m) => m.id === currentId);
        if (currentMod) {
          currentMod.usedBy.forEach((nextId) => {
            if (!affectedSet.has(nextId) && nextId !== targetMod.id) {
              queue.push(nextId);
            }
          });
        }
      }
    }

    const affectedModules = Array.from(affectedSet)
      .map((id) => modules.find((m) => m.id === id)!)
      .filter(Boolean);

    const totalAffectedLoc = affectedModules.reduce((acc, m) => acc + m.loc, targetMod.loc);
    const impactScore = Math.min(
      100,
      Math.round(
        (affectedModules.length / (modules.length - 1 || 1)) * 60 +
          (targetMod.riskScore / 100) * 40
      )
    );

    return {
      target: targetMod,
      affectedList: affectedModules,
      affectedCount: affectedModules.length,
      totalAffectedLoc,
      impactScore,
      affectedSet,
    };
  }, [selectedModuleId, modules]);

  // Load modules & build graph
  useEffect(() => {
    async function loadGraph() {
      try {
        const rawModules = await getModules();
        setModules(rawModules);

        // Predefined layout coords
        const positions: Record<string, { x: number; y: number }> = {
          db_utils: { x: 450, y: 30 },
          auth: { x: 180, y: 160 },
          notification: { x: 740, y: 160 },
          discounts: { x: 60, y: 300 },
          tax_calculator: { x: 340, y: 300 },
          payment_gateway: { x: 600, y: 300 },
          subscription: { x: 860, y: 300 },
          billing: { x: 450, y: 460 },
          invoice: { x: 220, y: 620 },
          report: { x: 680, y: 620 },
          export_service: { x: 450, y: 760 },
          audit_log: { x: 820, y: 30 },
        };

        const initialNodes: Node[] = rawModules.map((m) => ({
          id: m.id,
          type: "customModule",
          position: positions[m.id] || { x: 400, y: 400 },
          data: {
            label: m.name,
            path: m.path,
            riskScore: m.riskScore,
            riskLevel: m.riskLevel,
            loc: m.loc,
            complexity: m.complexity,
            issuesCount: m.issues.length,
            status: m.status,
            dependsOnCount: m.dependsOn.length,
            usedByCount: m.usedBy.length,
            isBlastTarget: m.id === "db_utils",
            isBlastAffected: m.id !== "db_utils",
            isDimmed: false,
          },
        }));

        const initialEdges: Edge[] = [];
        rawModules.forEach((mod) => {
          mod.dependsOn.forEach((depId) => {
            initialEdges.push({
              id: `edge-${mod.id}->${depId}`,
              source: mod.id,
              target: depId,
              animated: mod.riskScore > 80,
              style: {
                stroke: "#475569",
                strokeWidth: 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#64748b",
                width: 14,
                height: 14,
              },
            });
          });
        });

        setNodes(initialNodes);
        setEdges(initialEdges);
      } catch (err) {
        console.error("Failed to load graph", err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, [setNodes, setEdges]);

  // Update node highlight states whenever selectedModuleId or blastRadius changes
  useEffect(() => {
    if (!blastRadiusInfo || nodes.length === 0) return;

    setNodes((nds) =>
      nds.map((node) => {
        const isTarget = node.id === selectedModuleId;
        const isAffected = blastRadiusInfo.affectedSet.has(node.id);
        const isDimmed = !isTarget && !isAffected && selectedModuleId !== null;

        const nodeData = node.data as unknown as CustomNodeData;

        return {
          ...node,
          data: {
            ...nodeData,
            isBlastTarget: isTarget,
            isBlastAffected: isAffected,
            isDimmed: isDimmed,
          },
        };
      })
    );

    setEdges((eds) =>
      eds.map((edge) => {
        const isRelevant =
          edge.source === selectedModuleId ||
          edge.target === selectedModuleId ||
          (blastRadiusInfo.affectedSet.has(edge.source) &&
            blastRadiusInfo.affectedSet.has(edge.target));

        return {
          ...edge,
          animated: isRelevant,
          style: {
            stroke: isRelevant ? "#f43f5e" : "#334155",
            strokeWidth: isRelevant ? 3 : 1.5,
            filter: isRelevant ? "drop-shadow(0 0 6px rgba(244,63,94,0.6))" : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isRelevant ? "#f43f5e" : "#475569",
            width: 16,
            height: 16,
          },
        };
      })
    );
  }, [selectedModuleId, blastRadiusInfo, setNodes, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      setSelectedModuleId(node.id);
    },
    []
  );

  const resetBlastRadius = () => {
    setSelectedModuleId(null);
    setNodes((nds) =>
      nds.map((node) => {
        const nodeData = node.data as unknown as CustomNodeData;
        return {
          ...node,
          data: {
            ...nodeData,
            isBlastTarget: false,
            isBlastAffected: false,
            isDimmed: false,
          },
        };
      })
    );
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        animated: false,
        style: { stroke: "#475569", strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b", width: 14, height: 14 },
      }))
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <GitFork className="w-6 h-6 text-cyan-400" />
                AST Dependency & Blast Radius Engine
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Live Cascade Mode
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select any Python module to compute its downstream impact radius in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Risk filter pills */}
            <div className="flex items-center gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs">
              {["all", "critical", "high", "medium"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRiskFilter(r)}
                  className={`px-3 py-1 rounded-lg uppercase text-[10px] font-semibold transition-colors ${
                    riskFilter === r
                      ? "bg-slate-800 text-cyan-300 border border-slate-700"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>

            {selectedModuleId && (
              <button
                onClick={resetBlastRadius}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset Selection
              </button>
            )}
          </div>
        </div>

        {/* Legend Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-slate-500 font-medium text-[11px] uppercase tracking-wider">
              Legend:
            </span>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
              <span>Critical Risk (80–100)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>High Risk (70–79)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span>Medium Risk</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Low / Modernized</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
            <span>• Node Width = Total LOC</span>
            <span>• Glowing Red = Blast Radius</span>
          </div>
        </div>

        {/* Main Canvas & Blast Radius Side Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* React Flow Canvas */}
          <div className={`transition-all ${blastRadiusInfo ? "lg:col-span-8" : "lg:col-span-12"} h-[650px] rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden relative shadow-2xl`}>
            {loading ? (
              <div className="h-full flex items-center justify-center text-slate-400 gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
                <span>Synthesizing AST Dependency Nodes...</span>
              </div>
            ) : (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeClick={onNodeClick}
                fitView
                className="bg-slate-950"
                minZoom={0.2}
                maxZoom={1.5}
              >
                <Background color="#1e293b" gap={20} size={1} />
                <Controls className="!bg-slate-900 !border-slate-800 !text-white" />
                <MiniMap
                  nodeStrokeColor="#020617"
                  nodeColor={(node) => {
                    const d = node.data as unknown as CustomNodeData;
                    if (d?.isBlastTarget) return "#f43f5e";
                    if (d?.isBlastAffected) return "#fb7185";
                    return "#334155";
                  }}
                  className="!bg-slate-900 !border-slate-800 !rounded-xl"
                  maskColor="rgba(2, 6, 23, 0.7)"
                />
              </ReactFlow>
            )}

            {/* Quick instruction overlay */}
            <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md text-[11px] font-mono text-slate-300 flex items-center gap-2 pointer-events-none">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click any node to evaluate blast radius</span>
            </div>
          </div>

          {/* Blast Radius Impact Side Panel */}
          {blastRadiusInfo && (
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-rose-900/40 p-6 shadow-2xl space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    <Flame className="w-5 h-5 text-rose-500 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      Blast Radius Analysis
                    </h3>
                    <p className="text-xs font-mono text-rose-300 mt-0.5">
                      Changing <strong>{blastRadiusInfo.target.name}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetBlastRadius}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* High-level Impact Score */}
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-500/30 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-rose-300 tracking-wider">
                    Cumulative Impact Score
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-3xl font-extrabold font-mono text-rose-400">
                      {blastRadiusInfo.impactScore}
                    </span>
                    <span className="text-xs text-rose-300 font-mono">/ 100</span>
                  </div>
                </div>
                <div className="text-right font-mono text-xs text-slate-300">
                  <span className="block font-bold text-rose-300">
                    {blastRadiusInfo.affectedCount} Affected Modules
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {blastRadiusInfo.totalAffectedLoc.toLocaleString()} LOC at Risk
                  </span>
                </div>
              </div>

              {/* Target Module Spec */}
              <div className="space-y-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Target Module
                </span>
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold text-white">
                      {blastRadiusInfo.target.name}
                    </span>
                    <p className="text-[10px] font-mono text-slate-500">
                      {blastRadiusInfo.target.path}
                    </p>
                  </div>
                  <RiskBadge
                    level={blastRadiusInfo.target.riskLevel}
                    score={blastRadiusInfo.target.riskScore}
                  />
                </div>
              </div>

              {/* List of Affected Modules */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Downstream Cascade ({blastRadiusInfo.affectedCount})
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Direct & Transitive
                  </span>
                </div>

                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {blastRadiusInfo.affectedList.map((aff) => (
                    <Link
                      key={aff.id}
                      href={`/module/${aff.id}`}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-950 transition-colors flex items-center justify-between group text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                        <span className="font-mono text-slate-200 group-hover:text-cyan-400 transition-colors truncate">
                          {aff.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono text-slate-500">
                          {aff.loc} LOC
                        </span>
                        <RiskBadge level={aff.riskLevel} showIcon={false} className="!py-0 !px-1.5 text-[9px]" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link
                  href={`/module/${blastRadiusInfo.target.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all shadow-lg shadow-cyan-500/20"
                >
                  Inspect {blastRadiusInfo.target.name} Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/validate/${blastRadiusInfo.target.id}`}
                  className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  Run Modernization Validation
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
