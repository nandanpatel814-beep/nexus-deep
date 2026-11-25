'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  Flame,
  Globe2,
  TerminalSquare,
  Compass,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { SettingsModal } from '@/components/SettingsModal';
import { ResearchVisualizer } from '@/components/ResearchVisualizer';
import { DossierViewer } from '@/components/DossierViewer';
import { ResearchPlan, ResearchDepth, SourceItem } from '@/lib/types';

export default function Home() {
  const [query, setQuery] = useState('');
  const [depth, setDepth] = useState<ResearchDepth>('standard');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gemini-2.0-flash');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Execution State
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle');
  const [currentStage, setCurrentStage] = useState('planning');
  const [stageMessage, setStageMessage] = useState('Initializing swarm agents...');
  const [plan, setPlan] = useState<ResearchPlan | null>(null);
  const [activeVectorId, setActiveVectorId] = useState<string | null>(null);
  const [thoughts, setThoughts] = useState<{ vectorId: string; thought: string }[]>([]);
  const [sources, setSources] = useState<SourceItem[]>([]);
  const [finalReport, setFinalReport] = useState<string>('');
  const [durationMs, setDurationMs] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Load API key from local storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedKey = localStorage.getItem('nexus_gemini_key') || '';
      const savedModel = localStorage.getItem('nexus_model') || 'gemini-2.0-flash';
      setApiKey(savedKey);
      setModel(savedModel);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_gemini_key', key);
    }
  };

  const handleSaveModel = (m: string) => {
    setModel(m);
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_model', m);
    }
  };

  const handleStartResearch = async (searchQuery?: string) => {
    const q = searchQuery || query;
    if (!q.trim()) return;

    setStatus('running');
    setCurrentStage('planning');
    setStageMessage('Formulating hypothesis and orthogonal investigation vectors...');
    setPlan(null);
    setActiveVectorId(null);
    setThoughts([]);
    setSources([]);
    setFinalReport('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: q,
          depth,
          apiKey,
          model,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split('\n\n');
        buffer = events.pop() || '';

        for (const evt of events) {
          if (!evt.trim()) continue;
          const lines = evt.split('\n');
          let eventType = 'message';
          let eventData = '';

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              eventType = line.slice(7).trim();
            } else if (line.startsWith('data: ')) {
              eventData = line.slice(6).trim();
            }
          }

          if (eventData) {
            try {
              const parsed = JSON.parse(eventData);

              if (eventType === 'stage') {
                setCurrentStage(parsed.stage);
                setStageMessage(parsed.message);
              } else if (eventType === 'plan_created') {
                setPlan(parsed);
                setCurrentStage('vector_investigation');
              } else if (eventType === 'vector_start') {
                setActiveVectorId(parsed.vectorId);
                setStageMessage(`Scouting Vector ${parsed.index}/${parsed.total}: ${parsed.title}`);
              } else if (eventType === 'vector_thought') {
                setThoughts((prev) => [...prev, { vectorId: parsed.vectorId, thought: parsed.thought }]);
              } else if (eventType === 'vector_source') {
                setSources((prev) => [...prev, parsed.source]);
              } else if (eventType === 'vector_done') {
                setPlan((prevPlan) => {
                  if (!prevPlan) return null;
                  return {
                    ...prevPlan,
                    vectors: prevPlan.vectors.map((v) =>
                      v.id === parsed.vectorId
                        ? { ...v, status: 'completed' as const, findings: parsed.findings }
                        : v
                    ),
                  };
                });
              } else if (eventType === 'synthesis_complete') {
                setFinalReport(parsed.report);
                setDurationMs(parsed.durationMs || 45000);
                setStatus('completed');
              } else if (eventType === 'error') {
                setErrorMessage(parsed.message);
                setStatus('error');
              }
            } catch (err) {
              console.error('Error parsing SSE event:', err);
            }
          }
        }
      }
    } catch (err: any) {
      console.error('Research failed:', err);
      setErrorMessage(err?.message || 'Connection interrupted.');
      setStatus('error');
    }
  };

  const samplePrompts = [
    {
      label: 'Solid-State vs Sodium-Ion Batteries',
      query: 'Solid-State vs Sodium-Ion Batteries: Commercialization timeline, raw material bottleneck, and cost per kWh by 2030',
    },
    {
      label: 'Quantum Cryptanalysis on RSA-4096',
      query: 'Quantum Computing progression vs Post-Quantum Cryptography: Exact threat horizon and empirical feasibility to break RSA-4096 by 2030',
    },
    {
      label: 'Open-Source AI Agent Frameworks Benchmark',
      query: 'Comparative evaluation of modern autonomous AI agent frameworks: Memory systems, context optimization, tool execution reliability, and multi-agent coordination',
    },
    {
      label: 'SpaceX Starship Commercial Disruption',
      query: 'SpaceX Starship payload unit economics per kilogram to Low Earth Orbit and structural disruption on commercial telecom satellite fleets',
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header onOpenSettings={() => setIsSettingsOpen(true)} hasApiKey={Boolean(apiKey)} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8 md:py-12">
        {/* State 1: IDLE / Search Hero */}
        {status === 'idle' && (
          <div className="max-w-4xl mx-auto space-y-10 text-center pt-4 md:pt-10">
            {/* Hero Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Free & Open Alternative to $200/mo Deep Research</span>
            </div>

            {/* Title & Tagline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
                Autonomous Deep Intelligence{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500 bg-clip-text text-transparent">
                  at \$0 Cost.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Decomposes any complex thesis into orthogonal research vectors, harvests live citations from across the web, cross-checks anomalies, and synthesizes publication-ready intelligence dossiers.
              </p>
            </div>

            {/* Input Box */}
            <div className="relative max-w-3xl mx-auto">
              <div className="relative rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl p-2.5 sm:p-3 focus-within:border-cyan-500/80 focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all">
                <div className="flex items-start space-x-3">
                  <div className="mt-3.5 ml-2 text-slate-500">
                    <Search className="w-5 h-5 text-cyan-400" />
                  </div>
                  <textarea
                    rows={3}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleStartResearch();
                      }
                    }}
                    placeholder="Enter an exhaustive research topic, technology comparison, competitive thesis, or empirical inquiry..."
                    className="w-full bg-transparent text-sm sm:text-base text-slate-100 placeholder-slate-500 focus:outline-none resize-none pt-2.5 pb-2"
                  />
                </div>

                {/* Bottom Bar: Depth & Submit */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800/80 mt-1 px-2">
                  {/* Depth Selector */}
                  <div className="flex items-center space-x-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                    {[
                      { id: 'quick', label: 'Quick Brief (3 Vectors)', icon: Zap },
                      { id: 'standard', label: 'Standard Deep Dive (5 Vectors)', icon: Layers },
                      { id: 'exhaustive', label: 'Exhaustive Dossier (7 Vectors)', icon: Flame },
                    ].map((d) => {
                      const Icon = d.icon;
                      return (
                        <button
                          key={d.id}
                          type="button"
                          onClick={() => setDepth(d.id as ResearchDepth)}
                          className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                            depth === d.id
                              ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="hidden md:inline">{d.label}</span>
                          <span className="md:hidden">{d.id.toUpperCase()}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Launch Button */}
                  <button
                    onClick={() => handleStartResearch()}
                    disabled={!query.trim()}
                    className="w-full sm:w-auto flex items-center justify-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-500/25 transition active:scale-95"
                  >
                    <span>Launch Investigation</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="max-w-3xl mx-auto text-left pt-2">
              <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                <Compass className="w-3.5 h-3.5 text-cyan-400" />
                <span>Popular Intelligence Probes</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(p.query);
                      handleStartResearch(p.query);
                    }}
                    className="text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-cyan-500/50 transition group"
                  >
                    <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                      {p.label}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-1">
                      {p.query}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* State 2: RUNNING / Real-Time Swarm Visualizer */}
        {status === 'running' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                  Autonomous Swarm In Flight
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                  &quot;{query}&quot;
                </h2>
              </div>
              <div className="text-xs text-slate-400 font-mono">
                Model: <span className="text-cyan-400">{model}</span>
              </div>
            </div>

            <ResearchVisualizer
              currentStage={currentStage}
              stageMessage={stageMessage}
              plan={plan}
              activeVectorId={activeVectorId}
              thoughts={thoughts}
              sources={sources}
            />
          </div>
        )}

        {/* State 3: COMPLETED / Dossier Viewer */}
        {status === 'completed' && (
          <DossierViewer
            report={finalReport}
            topic={query}
            vectorsCount={plan?.vectors.length || 5}
            sourcesCount={sources.length}
            durationMs={durationMs}
            plan={plan}
            sources={sources}
            onReset={() => {
              setStatus('idle');
              setQuery('');
            }}
          />
        )}

        {/* State 4: ERROR */}
        {status === 'error' && (
          <div className="max-w-xl mx-auto p-6 rounded-2xl bg-red-950/20 border border-red-800/60 text-center space-y-4 my-12">
            <div className="text-red-400 font-bold text-lg">Execution Disrupted</div>
            <p className="text-xs text-slate-300 font-mono">{errorMessage}</p>
            <button
              onClick={() => setStatus('idle')}
              className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
            >
              Back to Command Center
            </button>
          </div>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        model={model}
        onSaveModel={handleSaveModel}
      />
    </div>
  );
}
