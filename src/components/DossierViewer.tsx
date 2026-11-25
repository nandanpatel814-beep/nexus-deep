'use client';

import React, { useState } from 'react';
import {
  Download,
  Copy,
  Printer,
  Check,
  RotateCcw,
  ShieldCheck,
  FileText,
  Clock,
  Sparkles,
  ExternalLink,
  Share2,
} from 'lucide-react';
import { KnowledgeGraph } from './KnowledgeGraph';
import { ResearchPlan, SourceItem } from '@/lib/types';

interface DossierViewerProps {
  report: string;
  topic: string;
  vectorsCount: number;
  sourcesCount: number;
  durationMs: number;
  plan?: ResearchPlan | null;
  sources?: SourceItem[];
  onReset: () => void;
}

export function DossierViewer({
  report,
  topic,
  vectorsCount,
  sourcesCount,
  durationMs,
  plan,
  sources = [],
  onReset,
}: DossierViewerProps) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'dossier' | 'graph'>('dossier');

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-deep-${topic.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 40)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  // Convert markdown to structured elements cleanly
  const renderFormattedReport = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeader: string[] = [];

    const flushTable = (key: number) => {
      if (tableHeader.length > 0 || tableRows.length > 0) {
        elements.push(
          <div key={`table-${key}`} className="overflow-x-auto my-6 rounded-xl border border-slate-800 bg-slate-950/60">
            <table>
              {tableHeader.length > 0 && (
                <thead>
                  <tr>
                    {tableHeader.map((h, hi) => (
                      <th key={hi}>{h.trim()}</th>
                    ))}
                  </tr>
                </thead>
              )}
              <tbody>
                {tableRows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableHeader = [];
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect table row
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        const cells = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());

        if (cells.every((c) => /^:?-+:?$/.test(c))) {
          continue;
        }

        if (tableHeader.length === 0) {
          tableHeader = cells;
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable(i);
      }

      // Headers
      if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight border-b border-slate-800 pb-3 mt-4 mb-4">
            {line.replace('# ', '')}
          </h1>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-lg sm:text-xl font-bold text-cyan-400 mt-6 mb-2 flex items-center space-x-2">
            <span>{line.replace('## ', '')}</span>
          </h2>
        );
      } else if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-base font-semibold text-slate-200 mt-4 mb-2">
            {line.replace('### ', '')}
          </h3>
        );
      } else if (line.startsWith('> ')) {
        elements.push(
          <blockquote key={i} className="border-l-4 border-cyan-500 bg-cyan-950/20 px-4 py-2 my-2 rounded-r-lg text-slate-300 text-xs italic">
            {line.replace('> ', '')}
          </blockquote>
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        elements.push(
          <li key={i} className="ml-5 list-disc text-slate-300 text-sm leading-relaxed my-1">
            {renderInlineMarkdown(line.slice(2))}
          </li>
        );
      } else if (line.trim() === '---') {
        elements.push(<hr key={i} className="border-slate-800 my-6" />);
      } else if (line.trim().length > 0) {
        elements.push(
          <p key={i} className="text-sm text-slate-300 leading-relaxed my-2">
            {renderInlineMarkdown(line)}
          </p>
        );
      }
    }

    if (inTable) {
      flushTable(lines.length);
    }

    return elements;
  };

  const renderInlineMarkdown = (text: string) => {
    const parts: React.ReactNode[] = [];
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
    let lastIndex = 0;
    let match;

    const parseBold = (sub: string, keyPrefix: string) => {
      const boldParts = sub.split(/(\*\*[^*]+\*\*)/g);
      return boldParts.map((bp, bidx) => {
        if (bp.startsWith('**') && bp.endsWith('**')) {
          return (
            <strong key={`${keyPrefix}-${bidx}`} className="font-semibold text-white">
              {bp.slice(2, -2)}
            </strong>
          );
        }
        return bp;
      });
    };

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(parseBold(text.substring(lastIndex, match.index), `txt-${lastIndex}`));
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 inline-flex items-center space-x-0.5"
        >
          <span>{match[1]}</span>
          <ExternalLink className="w-2.5 h-2.5 inline ml-0.5" />
        </a>
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(parseBold(text.substring(lastIndex), `txt-end`));
    }

    return parts;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Action Toolbar */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <span>Deep Intelligence Dossier Completed</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Verified
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Autonomous multi-vector synthesis ready for publication & visual exploration
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .MD</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={onReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white transition active:scale-95 shadow-md shadow-cyan-600/20"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="no-print grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Vectors Verified</div>
          <div className="text-xl font-black text-cyan-400 mt-0.5">{vectorsCount} Nodes</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Grounded Citations</div>
          <div className="text-xl font-black text-emerald-400 mt-0.5">{sourcesCount} Sources</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Execution Velocity</div>
          <div className="text-xl font-black text-purple-400 mt-0.5">{(durationMs / 1000).toFixed(1)}s</div>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-950/60">
          <div className="text-[10px] uppercase font-bold text-slate-400">Compute Cost</div>
          <div className="text-xl font-black text-slate-200 mt-0.5">$0.00 (BYOK)</div>
        </div>
      </div>

      {/* View Switcher: Dossier vs Interactive Knowledge Graph */}
      <div className="no-print flex items-center justify-between border-b border-slate-800 pb-2">
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1.5 rounded-xl border border-slate-800">
          <button
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition ${
              activeTab === 'dossier'
                ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Executive Dossier</span>
          </button>

          <button
            onClick={() => setActiveTab('graph')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-xs font-bold transition relative ${
              activeTab === 'graph'
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Interactive Knowledge Graph</span>
            <span className="text-[9px] uppercase font-black px-1.5 py-0.2 rounded-full bg-cyan-400 text-black ml-1">
              v1.1
            </span>
          </button>
        </div>

        <div className="text-xs text-slate-400 hidden sm:block">
          {activeTab === 'dossier' ? 'Scroll down to read report' : 'Click & drag nodes to explore physics graph'}
        </div>
      </div>

      {/* Tab 1: Executive Dossier View */}
      {activeTab === 'dossier' && (
        <div className="rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl p-6 sm:p-10 dossier-prose backdrop-blur-md animate-in fade-in duration-200">
          {renderFormattedReport(report)}
        </div>
      )}

      {/* Tab 2: Interactive Knowledge Graph View */}
      {activeTab === 'graph' && (
        <div className="animate-in fade-in duration-200">
          <KnowledgeGraph topic={topic} plan={plan || null} sources={sources} />
        </div>
      )}
    </div>
  );
}
