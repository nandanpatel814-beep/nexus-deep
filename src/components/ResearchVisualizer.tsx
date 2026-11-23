'use client';

import React, { useRef, useEffect } from 'react';
import {
  GitBranch,
  Search,
  CheckCircle2,
  Clock,
  Globe,
  Terminal,
  ShieldAlert,
  Loader2,
  Layers,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ResearchPlan, ResearchVector, SourceItem } from '@/lib/types';

interface ResearchVisualizerProps {
  currentStage: string;
  stageMessage: string;
  plan: ResearchPlan | null;
  activeVectorId: string | null;
  thoughts: { vectorId: string; thought: string }[];
  sources: SourceItem[];
}

export function ResearchVisualizer({
  currentStage,
  stageMessage,
  plan,
  activeVectorId,
  thoughts,
  sources,
}: ResearchVisualizerProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [thoughts]);

  const stages = [
    { id: 'planning', label: '1. Swarm Planning', icon: GitBranch },
    { id: 'vector_investigation', label: '2. Multi-Vector Gathering', icon: Search },
    { id: 'cross_examination', label: '3. Cross-Examination & Anomalies', icon: ShieldAlert },
    { id: 'synthesis', label: '4. Executive Synthesis', icon: Sparkles },
  ];

  const getStageIndex = (stage: string) => {
    if (stage === 'planning') return 0;
    if (stage === 'cross_examination') return 2;
    if (stage === 'synthesis') return 3;
    return 1; // default to vector investigation
  };

  const currentIdx = getStageIndex(currentStage);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stages Progress Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stages.map((st, idx) => {
          const Icon = st.icon;
          const isDone = idx < currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div
              key={st.id}
              className={`p-3.5 rounded-xl border transition-all ${
                isCurrent
                  ? 'bg-cyan-950/40 border-cyan-500/60 shadow-lg shadow-cyan-950/40'
                  : isDone
                  ? 'bg-slate-900/60 border-emerald-500/30'
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div
                  className={`p-1.5 rounded-lg ${
                    isCurrent
                      ? 'bg-cyan-500 text-black animate-pulse'
                      : isDone
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div
                    className={`text-xs font-bold truncate ${
                      isCurrent
                        ? 'text-cyan-300'
                        : isDone
                        ? 'text-emerald-400'
                        : 'text-slate-400'
                    }`}
                  >
                    {st.label}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isDone ? 'Completed' : isCurrent ? 'Active Swarm' : 'Queued'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Status Pill */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-800">
        <div className="flex items-center space-x-3">
          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
          <span className="text-xs text-slate-300 font-medium">{stageMessage}</span>
        </div>
        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-md border border-cyan-800/40">
          {sources.length} Grounded Citations Harvested
        </div>
      </div>

      {/* Split Workspace: Vectors & Swarm Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Vectors Tree */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Autonomous Vector Pipelines</span>
            </h4>
            <span className="text-xs text-slate-400 font-mono">
              {plan ? `${plan.vectors.length} Nodes` : 'Decomposing...'}
            </span>
          </div>

          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
            {plan?.vectors.map((vec, i) => {
              const isActive = activeVectorId === vec.id;
              const isCompleted = vec.status === 'completed';

              return (
                <div
                  key={vec.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isActive
                      ? 'bg-slate-900/90 border-cyan-500/80 shadow-md shadow-cyan-950/30 ring-1 ring-cyan-500/40'
                      : isCompleted
                      ? 'bg-slate-900/40 border-slate-800/80'
                      : 'bg-slate-950/30 border-slate-900 opacity-60'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-2.5">
                      <div className="mt-0.5">
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        ) : isActive ? (
                          <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-slate-200">
                          {i + 1}. {vec.title}
                        </div>
                        <div className="text-[11px] text-cyan-400/80 font-mono mt-0.5">
                          query: &quot;{vec.query}&quot;
                        </div>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full ${
                        isCompleted
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {isCompleted ? 'Resolved' : isActive ? 'Scouting' : 'Queued'}
                    </span>
                  </div>

                  {/* Findings Preview if resolved */}
                  {isCompleted && vec.findings.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400 space-y-1">
                      {vec.findings.slice(0, 2).map((f, fi) => (
                        <div key={fi} className="flex items-start space-x-1.5">
                          <span className="text-emerald-400 mt-0.5">•</span>
                          <span className="line-clamp-1">{f}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Real-time Terminal / Thought Stream & Sources */}
        <div className="lg:col-span-5 space-y-4">
          {/* Agent Thoughts Terminal */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-mono text-slate-300 font-semibold">
                  Swarm Log & Thoughts
                </span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
            </div>

            <div className="p-3.5 font-mono text-xs space-y-2 h-[220px] overflow-y-auto text-slate-300">
              {thoughts.length === 0 ? (
                <div className="text-slate-400 text-xs italic">
                  Awaiting agent telemetry stream...
                </div>
              ) : (
                thoughts.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-2 leading-relaxed">
                    <span className="text-cyan-500 shrink-0">&gt;</span>
                    <span className="text-slate-300 text-[11px]">{item.thought}</span>
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Discovered Sources Ticker */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 p-3.5">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>Harvested Citations ({sources.length})</span>
              </div>
            </div>

            <div className="space-y-2 max-h-[190px] overflow-y-auto pr-1">
              {sources.length === 0 ? (
                <div className="text-slate-400 text-xs italic">
                  Harvesting search grounding nodes...
                </div>
              ) : (
                sources.map((src, idx) => (
                  <a
                    key={idx}
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-2 rounded-lg bg-slate-900/60 hover:bg-slate-900 border border-slate-800/60 hover:border-cyan-500/40 transition group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300 truncate">
                      {src.title}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      {src.url}
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
