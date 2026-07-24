"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import type { Schema } from "@/lib/diagram";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function serializeSvg(el: SVGSVGElement): string {
  const clone = el.cloneNode(true) as SVGSVGElement;
  clone.removeAttribute("style");
  const sheet = document.querySelector("style");
  if (sheet) {
    const defs = clone.querySelector("defs") || clone.insertBefore(document.createElementNS("http://www.w3.org/2000/svg", "defs"), clone.firstChild);
    const globalStyle = document.createElementNS("http://www.w3.org/2000/svg", "style");
    globalStyle.textContent = sheet.textContent;
    defs.appendChild(globalStyle);
  }
  const serializer = new XMLSerializer();
  return serializer.serializeToString(clone);
}

async function exportPNG(svgEl: SVGSVGElement, filename: string) {
  const svgString = serializeSvg(svgEl);
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  const rect = svgEl.getBoundingClientRect();
  const w = rect.width || 1200;
  const h = rect.height || 800;

  return new Promise<void>((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, filename);
          resolve();
        } else {
          reject(new Error("Canvas toBlob returned null"));
        }
      }, "image/png");
    };
    img.onerror = reject;
    img.src = url;
  });
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

function computeLayout(schema: Schema): Record<string, Rect> {
  const positions: Record<string, Rect> = {};
  const colW = 184;
  const gapX = 140;
  const gapY = 120;
  const cols = Math.min(3, Math.ceil(Math.sqrt(schema.tables.length)));

  schema.tables.forEach((t, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const h = 42 + t.columns.length * 26 + 8;
    positions[t.name] = {
      x: 24 + col * (colW + gapX),
      y: 24 + row * (160 + gapY),
      w: colW,
      h,
    };
  });

  return positions;
}

function getRowY(tableName: string, columnName: string, schema: Schema, layout: Record<string, Rect>): number {
  const pos = layout[tableName];
  const table = schema.tables.find((t) => t.name === tableName)!;
  const idx = table.columns.findIndex((c) => c.name === columnName);
  return pos.y + 42 + idx * 26 + 4;
}

function routePath(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): string {
  const pad = 28;
  const x1Out = x1 + pad;
  const x2In = x2 - pad;

  if (Math.abs(y1 - y2) < 8 && x2 > x1) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  if (x2 > x1) {
    const midX = x1Out + (x2In - x1Out) / 2;
    return `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
  }

  const drop = Math.max(y1, y2) + 50;
  return `M ${x1} ${y1} L ${x1Out} ${y1} L ${x1Out} ${drop} L ${x2In} ${drop} L ${x2In} ${y2} L ${x2} ${y2}`;
}

interface SchemaDiagramProps {
  schema: Schema;
  className?: string;
}

export default function SchemaDiagram({ schema, className = "" }: SchemaDiagramProps) {
  const [hovered, setHovered] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const layout = useMemo(() => computeLayout(schema), [schema]);

  const connections = useMemo(() => {
    const out: {
      id: string;
      d: string;
      from: string;
      to: string;
      fromLabel: string;
      toLabel: string;
      sx: number;
      sy: number;
      ex: number;
      ey: number;
    }[] = [];

    schema.tables.forEach((table) => {
      table.foreignKeys.forEach((fk) => {
        const fromPos = layout[table.name];
        const toPos = layout[fk.referencesTable];
        if (!fromPos || !toPos) return;

        const sy = getRowY(table.name, fk.column, schema, layout);
        const ey = getRowY(fk.referencesTable, fk.referencesColumn, schema, layout);

        const sx = fromPos.x + fromPos.w;
        const ex = toPos.x;

        const d = routePath(sx, sy, ex, ey);
        out.push({
          id: `${table.name}-${fk.column}-${fk.referencesTable}`,
          d,
          from: table.name,
          to: fk.referencesTable,
          fromLabel: "*",
          toLabel: "1",
          sx,
          sy,
          ex,
          ey,
        });
      });
    });

    return out;
  }, [schema, layout]);

  const activeTables = useMemo(() => {
    if (!hovered) return new Set<string>();
    const set = new Set<string>([hovered]);
    connections.forEach((c) => {
      if (c.from === hovered) set.add(c.to);
      if (c.to === hovered) set.add(c.from);
    });
    return set;
  }, [hovered, connections]);

  const isTableActive = (name: string) => {
    if (!hovered) return true;
    return activeTables.has(name);
  };

  const isConnActive = (id: string) => {
    if (!hovered) return false;
    const c = connections.find((x) => x.id === id)!;
    return c.from === hovered || c.to === hovered;
  };

  const onMouseDown = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    panStart.current = { ...pan };
  }, [pan]);

  const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDragging) return;
    const dx = (e.clientX - dragStart.current.x) / scale;
    const dy = (e.clientY - dragStart.current.y) / scale;
    setPan({
      x: panStart.current.x + dx,
      y: panStart.current.y + dy,
    });
  }, [isDragging, scale]);

  const onMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const onWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomIntensity = 0.001;
    const delta = -e.deltaY * zoomIntensity;
    const newScale = Math.min(Math.max(scale + delta, 0.3), 3);

    const scaleRatio = newScale / scale;
    const newPanX = mouseX - (mouseX - pan.x) * scaleRatio;
    const newPanY = mouseY - (mouseY - pan.y) * scaleRatio;

    setScale(newScale);
    setPan({ x: newPanX, y: newPanY });
  }, [scale, pan]);

  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
    }
    if (downloadOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [downloadOpen]);

  const resetView = useCallback(() => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const zoomIn = useCallback(() => {
    setScale((s) => Math.min(s * 1.2, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((s) => Math.max(s / 1.2, 0.3));
  }, []);

  const handleExportSVG = useCallback(() => {
    if (!svgRef.current) return;
    const svgString = serializeSvg(svgRef.current);
    const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    downloadBlob(blob, "schema-diagram.svg");
    setDownloadOpen(false);
  }, []);

  const handleExportPNG = useCallback(() => {
    if (!svgRef.current) return;
    exportPNG(svgRef.current, "schema-diagram.png").catch(console.error);
    setDownloadOpen(false);
  }, []);

  const transformStr = `translate(${pan.x}, ${pan.y}) scale(${scale})`;

  return (
    <div className={`relative ${className}`}>
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1.5">
        {/* Download dropdown */}
        <div ref={downloadRef} className="relative">
          <button
            onClick={() => setDownloadOpen((v) => !v)}
            title="Download"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#252525] text-[#ccc] shadow-md ring-1 ring-white/5 transition-colors hover:bg-[#333] hover:text-white"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
          {downloadOpen && (
            <div className="absolute right-0 top-10 w-36 rounded-lg border border-white/10 bg-[#1a1a1a] py-1 shadow-xl">
              <button
                onClick={handleExportSVG}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#ccc] transition-colors hover:bg-[#252525] hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><polygon points="12 3 12 12 16 8" /></svg>
                Export SVG
              </button>
              <button
                onClick={handleExportPNG}
                className="flex w-full items-center gap-2 px-3 py-2 text-xs text-[#ccc] transition-colors hover:bg-[#252525] hover:text-white"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                Export PNG
              </button>
            </div>
          )}
        </div>
        <div className="h-px w-full bg-[#333]" />
        <button
          onClick={zoomIn}
          title="Zoom in"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#252525] text-[#ccc] shadow-md ring-1 ring-white/5 transition-colors hover:bg-[#333] hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={zoomOut}
          title="Zoom out"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#252525] text-[#ccc] shadow-md ring-1 ring-white/5 transition-colors hover:bg-[#333] hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
        <button
          onClick={resetView}
          title="Reset view"
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#252525] text-[#ccc] shadow-md ring-1 ring-white/5 transition-colors hover:bg-[#333] hover:text-white"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>

      <svg
        ref={svgRef}
        viewBox="0 0 780 460"
        className="h-full w-full select-none"
        style={{ minWidth: 640, cursor: isDragging ? "grabbing" : "grab" }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
        onWheel={onWheel}
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
            <polygon points="0 0, 10 3.5, 0 7" fill="#4f46e5" />
          </marker>
        </defs>

        <style>{`
          @keyframes flow {
            to { stroke-dashoffset: -40; }
          }
          @keyframes enter {
            from { stroke-dashoffset: 1000; }
            to { stroke-dashoffset: 0; }
          }
          .conn-base {
            stroke-dasharray: 1000;
            stroke-dashoffset: ${mounted ? 0 : 1000};
            transition: stroke-dashoffset 1.2s ease-out, stroke 0.3s ease, opacity 0.3s ease, stroke-width 0.3s ease;
          }
          .conn-flow {
            stroke-dasharray: 4 10;
            stroke-dashoffset: 0;
            animation: flow 1.2s linear infinite;
            pointer-events: none;
          }
        `}</style>

        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#222" strokeWidth="0.5" />
        </pattern>
        <rect width="780" height="460" fill="url(#grid)" />

        <g transform={transformStr}>
          <g fill="none" strokeLinecap="round" strokeLinejoin="round">
            {connections.map((c, i) => {
              const active = isConnActive(c.id);
              const dimmed = hovered && !active;
              return (
                <g key={c.id} style={{ opacity: dimmed ? 0.08 : active ? 1 : 0.45, transition: "opacity 0.3s ease" }}>
                  <path
                    d={c.d}
                    className="conn-base"
                    stroke={active ? "#4f46e5" : "#333"}
                    strokeWidth={active ? 2.5 : 1.5}
                  />
                  <path
                    d={c.d}
                    className="conn-flow"
                    stroke={active ? "#818cf8" : "#4f46e5"}
                    strokeWidth={active ? 2.5 : 1.5}
                    opacity={active ? 0.9 : 0}
                    style={{ transition: "opacity 0.3s ease" }}
                  />
                  <circle r="3" fill="#a5b4fc" filter="url(#glow)">
                    <animateMotion dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" path={c.d} />
                    <animate attributeName="opacity" values="0;1;0" dur={`${2.5 + i * 0.3}s`} repeatCount="indefinite" />
                  </circle>

                  <g transform={`translate(${c.sx + 10}, ${c.sy - 14})`}>
                    <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#1a1a1a" stroke={active ? "#6366f1" : "#333"} strokeWidth="1" />
                    <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill={active ? "#a5b4fc" : "#4f46e5"} fontSize="9" fontWeight="bold" fontFamily="monospace">
                      {c.fromLabel}
                    </text>
                  </g>

                  <g transform={`translate(${c.ex - 10}, ${c.ey - 14})`}>
                    <rect x="-8" y="-8" width="16" height="16" rx="4" fill="#1a1a1a" stroke={active ? "#6366f1" : "#333"} strokeWidth="1" />
                    <text x="0" y="0.5" textAnchor="middle" dominantBaseline="central" fill={active ? "#a5b4fc" : "#4f46e5"} fontSize="9" fontWeight="bold" fontFamily="monospace">
                      {c.toLabel}
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {schema.tables.map((table) => {
            const pos = layout[table.name];
            if (!pos) return null;
            const active = isTableActive(table.name);
            const isHover = hovered === table.name;

            return (
              <g
                key={table.name}
                onMouseEnter={() => setHovered(table.name)}
                onMouseLeave={() => setHovered(null)}
                style={{
                  cursor: "pointer",
                  opacity: active ? 1 : 0.15,
                  transition: "opacity 0.3s ease",
                }}
              >
                <rect
                  x={pos.x + 2}
                  y={pos.y + 3}
                  width={pos.w}
                  height={pos.h}
                  rx={8}
                  fill="black"
                  opacity={0.25}
                  filter="url(#glow)"
                  style={{ transition: "all 0.3s ease" }}
                />
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={pos.h}
                  rx={8}
                  fill="#1a1a1a"
                  stroke={isHover ? "#4f46e5" : "#2a2a2a"}
                  strokeWidth={isHover ? 2 : 1.5}
                  style={{ transition: "all 0.25s ease" }}
                />
                <rect
                  x={pos.x}
                  y={pos.y}
                  width={pos.w}
                  height={38}
                  rx={8}
                  fill={isHover ? "#252540" : "#252525"}
                  style={{ transition: "fill 0.25s ease" }}
                />
                <rect
                  x={pos.x}
                  y={pos.y + 30}
                  width={pos.w}
                  height={10}
                  fill={isHover ? "#252540" : "#252525"}
                  style={{ transition: "fill 0.25s ease" }}
                />
                <text
                  x={pos.x + pos.w / 2}
                  y={pos.y + 25}
                  textAnchor="middle"
                  fill={isHover ? "#e0e7ff" : "#e5e5e5"}
                  fontSize="13"
                  fontWeight="600"
                  fontFamily="Inter, sans-serif"
                  style={{ transition: "fill 0.25s ease" }}
                >
                  {table.name}
                </text>

                {table.columns.map((col, i) => {
                  const cy = pos.y + 42 + i * 26;
                  const isFk = table.foreignKeys.some((fk) => fk.column === col.name);
                  return (
                    <g key={col.name}>
                      <line
                        x1={pos.x + 1}
                        y1={cy + 10}
                        x2={pos.x + pos.w - 1}
                        y2={cy + 10}
                        stroke="#2a2a2a"
                        strokeWidth="1"
                      />
                      <text
                        x={pos.x + 14}
                        y={cy}
                        fill="#a0a0a0"
                        fontSize="12"
                        fontFamily="monospace"
                      >
                        {col.name}
                      </text>
                      {col.isPrimaryKey && (
                        <text
                          x={pos.x + pos.w - 14}
                          y={cy}
                          textAnchor="end"
                          fill="#6366f1"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          PK
                        </text>
                      )}
                      {!col.isPrimaryKey && isFk && (
                        <text
                          x={pos.x + pos.w - 14}
                          y={cy}
                          textAnchor="end"
                          fill="#6366f1"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          FK
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
