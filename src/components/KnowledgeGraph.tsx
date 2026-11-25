'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  FileCheck,
  Globe,
  X,
} from 'lucide-react';
import { ResearchPlan, SourceItem } from '@/lib/types';

export type NodeType = 'root' | 'vector' | 'fact' | 'anomaly' | 'source';

export interface GraphNode {
  id: string;
  label: string;
  type: NodeType;
  color: string;
  radius: number;
  details?: string;
  url?: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  fx?: number | null;
  fy?: number | null;
}

export interface GraphLink {
  source: string;
  target: string;
  color: string;
  width: number;
}

interface KnowledgeGraphProps {
  topic: string;
  plan: ResearchPlan | null;
  sources: SourceItem[];
}

export function KnowledgeGraph({ topic, plan, sources }: KnowledgeGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [links, setLinks] = useState<GraphLink[]>([]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  // Transform state: pan & zoom
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const isDraggingCanvasRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const draggedNodeRef = useRef<GraphNode | null>(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState<Record<NodeType, boolean>>({
    root: true,
    vector: true,
    fact: true,
    anomaly: true,
    source: true,
  });

  // 1. Build Graph Data from Plan & Sources
  useEffect(() => {
    const newNodes: GraphNode[] = [];
    const newLinks: GraphLink[] = [];

    const width = 800;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    // Root Node
    newNodes.push({
      id: 'root',
      label: topic.length > 32 ? topic.slice(0, 32) + '...' : topic,
      type: 'root',
      color: '#38bdf8', // Cyan
      radius: 24,
      details: `Core Investigation Topic: ${topic}`,
      x: centerX,
      y: centerY,
      vx: 0,
      vy: 0,
    });

    if (plan?.vectors) {
      const vectorCount = plan.vectors.length;
      plan.vectors.forEach((v, vIdx) => {
        const angle = (vIdx / vectorCount) * 2 * Math.PI;
        const dist = 140;
        const vx = centerX + Math.cos(angle) * dist + (Math.random() - 0.5) * 30;
        const vy = centerY + Math.sin(angle) * dist + (Math.random() - 0.5) * 30;

        newNodes.push({
          id: v.id,
          label: v.title.length > 26 ? v.title.slice(0, 26) + '...' : v.title,
          type: 'vector',
          color: '#818cf8', // Indigo
          radius: 17,
          details: `Vector Investigation: ${v.title}. Query: "${v.query}"`,
          x: vx,
          y: vy,
          vx: 0,
          vy: 0,
        });

        newLinks.push({
          source: 'root',
          target: v.id,
          color: 'rgba(56, 189, 248, 0.4)',
          width: 2,
        });

        // Findings / Facts under Vector
        if (v.findings && v.findings.length > 0) {
          v.findings.slice(0, 2).forEach((f, fIdx) => {
            const factId = `${v.id}-f-${fIdx}`;
            const fAngle = angle + (fIdx === 0 ? -0.4 : 0.4);
            const fDist = dist + 90;

            const isAnomaly =
              f.toLowerCase().includes('risk') ||
              f.toLowerCase().includes('failure') ||
              f.toLowerCase().includes('vulnerability') ||
              f.toLowerCase().includes('bottleneck') ||
              f.toLowerCase().includes('variance');

            newNodes.push({
              id: factId,
              label: f.length > 22 ? f.slice(0, 22) + '...' : f,
              type: isAnomaly ? 'anomaly' : 'fact',
              color: isAnomaly ? '#f43f5e' : '#34d399', // Rose or Emerald
              radius: 11,
              details: f,
              x: centerX + Math.cos(fAngle) * fDist,
              y: centerY + Math.sin(fAngle) * fDist,
              vx: 0,
              vy: 0,
            });

            newLinks.push({
              source: v.id,
              target: factId,
              color: isAnomaly ? 'rgba(244, 63, 94, 0.35)' : 'rgba(52, 211, 153, 0.35)',
              width: 1.5,
            });
          });
        }
      });
    }

    // Add Top Sources
    sources.slice(0, 8).forEach((s, sIdx) => {
      const srcId = `src-${sIdx}`;
      const angle = (sIdx / 8) * 2 * Math.PI + 0.3;
      const sDist = 280;

      // Connect source to a vector if available
      const targetVectorId =
        plan?.vectors && plan.vectors.length > 0
          ? plan.vectors[sIdx % plan.vectors.length].id
          : 'root';

      newNodes.push({
        id: srcId,
        label: s.title.length > 20 ? s.title.slice(0, 20) + '...' : s.title,
        type: 'source',
        color: '#c084fc', // Purple
        radius: 10,
        details: s.snippet,
        url: s.url,
        x: centerX + Math.cos(angle) * sDist,
        y: centerY + Math.sin(angle) * sDist,
        vx: 0,
        vy: 0,
      });

      newLinks.push({
        source: targetVectorId,
        target: srcId,
        color: 'rgba(192, 132, 252, 0.25)',
        width: 1,
      });
    });

    setNodes(newNodes);
    setLinks(newLinks);
    transformRef.current = { x: 0, y: 0, scale: 1 };
  }, [topic, plan, sources]);

  // 2. Physics Simulation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const runSimulationStep = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Repulsion between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];

          if (!activeFilters[a.type] || !activeFilters[b.type]) continue;

          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distSq = dx * dx + dy * dy || 1;
          const dist = Math.sqrt(distSq);

          if (dist < 260) {
            const force = (260 - dist) / dist * 0.18;
            if (a.id !== 'root') {
              a.vx -= dx * force;
              a.vy -= dy * force;
            }
            if (b.id !== 'root') {
              b.vx += dx * force;
              b.vy += dy * force;
            }
          }
        }
      }

      // 2. Link Spring Attraction
      const nodeMap = new Map(nodes.map((n) => [n.id, n]));
      for (const link of links) {
        const sourceNode = nodeMap.get(link.source);
        const targetNode = nodeMap.get(link.target);

        if (!sourceNode || !targetNode) continue;
        if (!activeFilters[sourceNode.type] || !activeFilters[targetNode.type]) continue;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const targetDist = sourceNode.type === 'root' ? 130 : 85;
        const force = (dist - targetDist) * 0.012;

        if (sourceNode.id !== 'root') {
          sourceNode.vx += (dx / dist) * force;
          sourceNode.vy += (dy / dist) * force;
        }
        if (targetNode.id !== 'root') {
          targetNode.vx -= (dx / dist) * force;
          targetNode.vy -= (dy / dist) * force;
        }
      }

      // 3. Center Gravity & Damping
      for (const node of nodes) {
        if (node.id === 'root') {
          node.x = centerX;
          node.y = centerY;
          continue;
        }

        // Center gravity
        const cdx = centerX - node.x;
        const cdy = centerY - node.y;
        node.vx += cdx * 0.0006;
        node.vy += cdy * 0.0006;

        // Damping
        node.vx *= 0.86;
        node.vy *= 0.86;

        // Apply
        if (draggedNodeRef.current?.id !== node.id) {
          node.x += node.vx;
          node.y += node.vy;
        }
      }

      // --- RENDER ---
      ctx.clearRect(0, 0, width, height);
      ctx.save();

      // Pan & Zoom
      const { x: panX, y: panY, scale } = transformRef.current;
      ctx.translate(panX, panY);
      ctx.scale(scale, scale);

      // Draw Grid dots in background
      ctx.fillStyle = 'rgba(30, 41, 59, 0.4)';
      const gridSize = 30;
      for (let gx = -width; gx < width * 2; gx += gridSize) {
        for (let gy = -height; gy < height * 2; gy += gridSize) {
          ctx.beginPath();
          ctx.arc(gx, gy, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Links
      for (const link of links) {
        const sourceNode = nodeMap.get(link.source);
        const targetNode = nodeMap.get(link.target);

        if (!sourceNode || !targetNode) continue;
        if (!activeFilters[sourceNode.type] || !activeFilters[targetNode.type]) continue;

        ctx.strokeStyle = link.color;
        ctx.lineWidth = link.width;
        ctx.beginPath();
        ctx.moveTo(sourceNode.x, sourceNode.y);
        ctx.lineTo(targetNode.x, targetNode.y);
        ctx.stroke();
      }

      // Draw Nodes
      for (const node of nodes) {
        if (!activeFilters[node.type]) continue;

        const isHovered = hoveredNode?.id === node.id;
        const isSelected = selectedNode?.id === node.id;

        // Glow ring
        if (isHovered || isSelected || node.type === 'root') {
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = node.color.replace('rgb', 'rgba').replace(')', ', 0.25)');
          ctx.fill();
          ctx.restore();
        }

        // Main Node Circle
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.shadowColor = node.color;
        ctx.shadowBlur = isHovered || isSelected ? 16 : 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Border
        ctx.strokeStyle = isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();

        // Label
        ctx.font = node.type === 'root' ? 'bold 12px sans-serif' : '10px sans-serif';
        ctx.fillStyle = '#f8fafc';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // Background pill behind text for clarity
        const text = node.label;
        const textWidth = ctx.measureText(text).width;
        const textY = node.y + node.radius + 4;

        ctx.fillStyle = 'rgba(7, 11, 18, 0.85)';
        ctx.fillRect(node.x - textWidth / 2 - 4, textY - 2, textWidth + 8, 14);

        ctx.fillStyle = isHovered || isSelected ? '#38bdf8' : '#e2e8f0';
        ctx.fillText(text, node.x, textY);
      }

      ctx.restore();
      animId = requestAnimationFrame(runSimulationStep);
    };

    animId = requestAnimationFrame(runSimulationStep);
    return () => cancelAnimationFrame(animId);
  }, [nodes, links, activeFilters, hoveredNode, selectedNode]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      canvas.width = container.clientWidth;
      canvas.height = 540;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Coordinate Conversion (Screen to Canvas Virtual World)
  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    const { x: panX, y: panY, scale } = transformRef.current;
    const worldX = (screenX - panX) / scale;
    const worldY = (screenY - panY) / scale;

    return { x: worldX, y: worldY, screenX, screenY };
  };

  const getNodeAtCoords = (x: number, y: number) => {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      if (!activeFilters[node.type]) continue;
      const dx = x - node.x;
      const dy = y - node.y;
      if (dx * dx + dy * dy <= (node.radius + 6) * (node.radius + 6)) {
        return node;
      }
    }
    return null;
  };

  // Mouse Handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, screenX, screenY } = getCanvasCoords(e);
    const clickedNode = getNodeAtCoords(x, y);

    if (clickedNode) {
      draggedNodeRef.current = clickedNode;
      setSelectedNode(clickedNode);
    } else {
      isDraggingCanvasRef.current = true;
      dragStartRef.current = { x: screenX - transformRef.current.x, y: screenY - transformRef.current.y };
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const { x, y, screenX, screenY } = getCanvasCoords(e);

    if (draggedNodeRef.current) {
      draggedNodeRef.current.x = x;
      draggedNodeRef.current.y = y;
      draggedNodeRef.current.vx = 0;
      draggedNodeRef.current.vy = 0;
    } else if (isDraggingCanvasRef.current) {
      transformRef.current.x = screenX - dragStartRef.current.x;
      transformRef.current.y = screenY - dragStartRef.current.y;
    } else {
      const hover = getNodeAtCoords(x, y);
      setHoveredNode(hover);
    }
  };

  const handleMouseUp = () => {
    draggedNodeRef.current = null;
    isDraggingCanvasRef.current = false;
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.1 : 0.9;
    const newScale = Math.max(0.4, Math.min(2.5, transformRef.current.scale * zoomFactor));
    transformRef.current.scale = newScale;
  };

  const resetView = () => {
    transformRef.current = { x: 0, y: 0, scale: 1 };
    setSelectedNode(null);
  };

  const zoomIn = () => {
    transformRef.current.scale = Math.min(2.5, transformRef.current.scale * 1.2);
  };

  const zoomOut = () => {
    transformRef.current.scale = Math.max(0.4, transformRef.current.scale * 0.8);
  };

  const toggleFilter = (type: NodeType) => {
    setActiveFilters((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const filterButtons = [
    { type: 'root' as NodeType, label: 'Central Topic', color: 'bg-sky-400', border: 'border-sky-500' },
    { type: 'vector' as NodeType, label: 'Research Vectors', color: 'bg-indigo-400', border: 'border-indigo-500' },
    { type: 'fact' as NodeType, label: 'Verified Findings', color: 'bg-emerald-400', border: 'border-emerald-500' },
    { type: 'anomaly' as NodeType, label: 'Risks & Anomalies', color: 'bg-rose-500', border: 'border-rose-500' },
    { type: 'source' as NodeType, label: 'Web Citations', color: 'bg-purple-400', border: 'border-purple-500' },
  ];

  return (
    <div className="relative rounded-2xl border border-slate-800 bg-slate-950/90 overflow-hidden shadow-2xl">
      {/* Top Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md">
        {/* Node Filters */}
        <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mr-2 flex items-center space-x-1">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Filter Nodes:</span>
          </span>
          {filterButtons.map((btn) => {
            const active = activeFilters[btn.type];
            return (
              <button
                key={btn.type}
                onClick={() => toggleFilter(btn.type)}
                className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition ${
                  active
                    ? 'bg-slate-800 text-white border-slate-700 shadow-sm'
                    : 'bg-slate-950/60 text-slate-500 border-slate-900 opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${btn.color}`} />
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={zoomIn}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={zoomOut}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition"
            title="Reset View"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div ref={containerRef} className="relative w-full h-[540px] bg-[#070b12] cursor-grab active:cursor-grabbing">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          className="w-full h-full block"
        />

        {/* Selected Node Details Floating Overlay */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 max-w-sm w-full p-4 rounded-xl bg-slate-900/95 border border-cyan-500/40 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedNode.color }}
                />
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                  {selectedNode.type} node
                </span>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-slate-400 hover:text-white p-1 rounded-md"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <h5 className="text-sm font-bold text-white mt-1.5 leading-snug">
              {selectedNode.label}
            </h5>

            {selectedNode.details && (
              <p className="text-xs text-slate-300 mt-2 leading-relaxed max-h-32 overflow-y-auto">
                {selectedNode.details}
              </p>
            )}

            {selectedNode.url && (
              <a
                href={selectedNode.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center space-x-1.5 text-xs text-cyan-400 hover:text-cyan-300 underline font-medium"
              >
                <span>Visit Primary Web Source</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        {/* Helper Hint */}
        <div className="absolute top-3 left-4 pointer-events-none text-[11px] text-slate-500 font-mono">
          Interactive Physics Graph • Drag nodes • Scroll to Zoom
        </div>
      </div>
    </div>
  );
}
