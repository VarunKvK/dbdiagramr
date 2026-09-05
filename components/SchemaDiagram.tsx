"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Background,
  BackgroundVariant,
  BaseEdge,
  Controls,
  EdgeLabelRenderer,
  Handle,
  MarkerType,
  MiniMap,
  Panel,
  Position,
  ReactFlow,
  ReactFlowProvider,
  getSmoothStepPath,
  useEdgesState,
  useNodesState,
  useReactFlow,
} from "@xyflow/react";
import type { Edge, EdgeProps, Node as RFNode, NodeProps } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Schema } from "@/lib/diagram";
import { renderDiagramSVG } from "@/lib/diagram";
import { LAYOUT, layoutSchema, tableSize } from "@/lib/diagramLayout";
import type { Rect } from "@/lib/diagramLayout";
import { formatType } from "@/lib/formatType";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Custom node: a table card ── */

type TableNodeData = {
  table: Schema["tables"][number];
  targetCols: Set<string>;
  highlightCols?: Set<string>;
  highlightTable?: boolean;
  searchActive?: boolean;
};

type TableFlowNode = RFNode<TableNodeData, "table">;

function TableNode({ data }: NodeProps<TableFlowNode>) {
  const { table, targetCols } = data;
  const size = tableSize(table);
  const fkColumns = new Set(table.foreignKeys.map((f) => f.column));

  const handleTop = (i: number) => ((LAYOUT.header + i * LAYOUT.rowH + LAYOUT.rowH / 2) / size.height) * 100;

  return (
    <div
      className={`overflow-hidden rounded-lg border bg-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] ${data.searchActive && data.highlightTable ? "border-indigo-500/50" : "border-border"}`}
      style={{ width: size.width, height: size.height }}
    >
      <div className={`flex h-[38px] items-center justify-center text-[13px] font-semibold ${data.searchActive && data.highlightTable ? "bg-indigo-100 text-indigo-700" : "bg-surface text-ink"}`}>
        {table.name}
      </div>
      <div className="relative">
        {table.columns.map((col, i) => {
          const isPk = col.isPrimaryKey;
          const isFkCol = fkColumns.has(col.name);
          const isTarget = targetCols.has(col.name);
          const isColMatch = data.highlightCols?.has(col.name) ?? false;
          const isSearchActive = data.searchActive ?? false;
          return (
            <div
              key={col.name}
              className={`relative flex h-[26px] items-center justify-between border-b px-[14px] last:border-b-0 ${isColMatch ? "bg-indigo-50" : ""} ${isSearchActive && data.highlightTable === false && !isColMatch ? "opacity-60" : ""} border-border`}
              title={`${col.name} ${formatType(col.type)}${col.nullable === "YES" ? " nullable" : " not null"}${col.default ? ` default ${col.default}` : ""}`}
            >
              <span className={`truncate font-mono text-[12px] ${isColMatch ? "font-semibold text-indigo-600" : "text-ink"}`}>{col.name}</span>
              <span className="ml-2 flex shrink-0 items-center gap-1.5">
                <span className={`font-mono text-[10px] ${isColMatch ? "text-indigo-500" : "text-muted"}`}>{formatType(col.type)}</span>
                {(isPk || isFkCol) && (
                  <span className="font-mono text-[10px] font-bold text-[#6366f1]">
                    {isPk ? "PK" : "FK"}
                  </span>
                )}
              </span>
              {isFkCol && (
                <Handle
                  type="source"
                  position={Position.Right}
                  id={`src-${col.name}`}
                  style={{ top: `${handleTop(i)}%` }}
                  className="pointer-events-none h-2 w-2 min-h-0 min-w-0 border-0 bg-transparent opacity-0"
                />
              )}
              {isTarget && (
                <Handle
                  type="target"
                  position={Position.Left}
                  id={`tgt-${col.name}`}
                  style={{ top: `${handleTop(i)}%` }}
                  className="pointer-events-none h-2 w-2 min-h-0 min-w-0 border-0 bg-transparent opacity-0"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Custom edge: smooth orthogonal path + cardinality badges ── */

type ErdEdgeData = { fromLabel: string; toLabel: string };

type ErdFlowEdge = Edge<ErdEdgeData, "erd">;

function ErdEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  style,
  data,
}: EdgeProps<ErdFlowEdge>) {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 8,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} markerEnd={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          className="pointer-events-none absolute"
          style={{ transform: `translate(-50%, -50%) translate(${sourceX}px, ${sourceY}px)` }}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] font-bold text-[#4f46e5] ring-1 ring-border">
            {data?.fromLabel ?? "*"}
          </span>
        </div>
        <div
          className="pointer-events-none absolute"
          style={{ transform: `translate(-50%, -50%) translate(${targetX}px, ${targetY}px)` }}
        >
          <span className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] font-bold text-[#4f46e5] ring-1 ring-border">
            {data?.toLabel ?? "1"}
          </span>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

const nodeTypes = { table: TableNode };
const edgeTypes = { erd: ErdEdge };

/* ── Canvas ── */

function buildElements(schema: Schema) {
  const layout = layoutSchema(schema);

  const targetCols = new Map<string, Set<string>>();
  for (const table of schema.tables) {
    for (const fk of table.foreignKeys) {
      if (!targetCols.has(fk.referencesTable)) targetCols.set(fk.referencesTable, new Set());
      targetCols.get(fk.referencesTable)!.add(fk.referencesColumn);
    }
  }

  const nodes: TableFlowNode[] = schema.tables.map((table) => {
    const pos = layout[table.name];
    return {
      id: table.name,
      type: "table" as const,
      position: { x: pos.x, y: pos.y },
      data: { table, targetCols: targetCols.get(table.name) ?? new Set() },
    };
  });

  const edges: ErdFlowEdge[] = [];
  for (const table of schema.tables) {
    for (const fk of table.foreignKeys) {
      edges.push({
        id: `${table.name}-${fk.column}-${fk.referencesTable}-${fk.referencesColumn}`,
        source: table.name,
        sourceHandle: `src-${fk.column}`,
        target: fk.referencesTable,
        targetHandle: `tgt-${fk.referencesColumn}`,
        type: "erd" as const,
        data: { fromLabel: "*", toLabel: "1" },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#4f46e5" },
        style: { stroke: "#4f46e5", strokeWidth: 1.5, transition: "opacity 0.3s ease" },
      });
    }
  }

  return { nodes, edges };
}

function Canvas({ schema, className = "", searchQuery = "" }: SchemaDiagramProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<TableFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ErdFlowEdge>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { nodes: n, edges: e } = buildElements(schema);
    setNodes(n);
    setEdges(e);
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 200 }), 60);
    return () => clearTimeout(t);
  }, [schema, setNodes, setEdges, fitView]);

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

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const searchActive = normalizedSearch.length > 0;

  const searchMatches = useMemo(() => {
    if (!searchActive) return null;
    const tableMatches = new Set<string>();
    const colMatches = new Map<string, Set<string>>();
    for (const table of schema.tables) {
      const tableHit = table.name.toLowerCase().includes(normalizedSearch);
      const hitCols = table.columns.filter((c) => c.name.toLowerCase().includes(normalizedSearch) || formatType(c.type).toLowerCase().includes(normalizedSearch)).map((c) => c.name);
      if (tableHit || hitCols.length > 0) {
        tableMatches.add(table.name);
        if (hitCols.length > 0) colMatches.set(table.name, new Set(hitCols));
        // If table name matched, highlight all cols? No, just table. Keep colMatches empty unless col matched.
        if (tableHit && hitCols.length === 0) colMatches.set(table.name, new Set());
      }
    }
    return { tableMatches, colMatches };
  }, [schema, normalizedSearch, searchActive]);

  const activeSet = useMemo(() => {
    if (!hovered) return null;
    const s = new Set<string>([hovered]);
    edges.forEach((e) => {
      if (e.source === hovered) s.add(e.target);
      if (e.target === hovered) s.add(e.source);
    });
    return s;
  }, [hovered, edges]);

  const renderedNodes = useMemo(() => {
    let out = nodes;
    // Apply search highlighting data first
    if (searchActive && searchMatches) {
      out = out.map((n) => {
        const isMatch = searchMatches.tableMatches.has(n.id);
        const matchedCols = searchMatches.colMatches.get(n.id);
        return {
          ...n,
          data: {
            ...n.data,
            highlightCols: matchedCols,
            highlightTable: isMatch,
            searchActive: true,
          },
        };
      });
    }
    // Apply hover dimming or search dimming (search takes precedence over hover when active)
    if (searchActive && searchMatches) {
      out = out.map((n) => {
        const isMatch = searchMatches.tableMatches.has(n.id);
        return {
          ...n,
          style: {
            ...n.style,
            opacity: isMatch ? 1 : 0.18,
            transition: "opacity 0.3s ease",
          },
        };
      });
      return out;
    }
    if (hovered && activeSet) {
      return out.map((n) => ({
        ...n,
        style: {
          ...n.style,
          opacity: activeSet.has(n.id) ? 1 : 0.15,
          transition: "opacity 0.3s ease",
        },
      }));
    }
    return out;
  }, [nodes, hovered, activeSet, searchActive, searchMatches]);

  const renderedEdges = useMemo(() => {
    if (searchActive && searchMatches) {
      return edges.map((e) => {
        // Dim edges where neither end matched
        const isRelated = searchMatches.tableMatches.has(e.source) || searchMatches.tableMatches.has(e.target);
        return {
          ...e,
          style: {
            ...e.style,
            stroke: isRelated ? "#4f46e5" : "#333",
            opacity: isRelated ? 0.9 : 0.06,
          },
        };
      });
    }
    if (hovered && activeSet) {
      return edges.map((e) => {
        const active = activeSet.has(e.source) || activeSet.has(e.target);
        return {
          ...e,
          animated: active,
          style: {
            ...e.style,
            stroke: active ? "#4f46e5" : "#333",
            opacity: active ? 1 : 0.08,
          },
        };
      });
    }
    return edges;
  }, [edges, hovered, activeSet, searchActive, searchMatches]);

  const positionsForExport = useMemo(() => {
    const layout: Record<string, Rect> = {};
    nodes.forEach((n) => {
      const size = tableSize(n.data.table);
      layout[n.id] = { x: n.position.x, y: n.position.y, w: size.width, h: size.height };
    });
    return layout;
  }, [nodes]);

  const handleExportSVG = useCallback(() => {
    const svg = renderDiagramSVG(schema, positionsForExport);
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "schema-diagram.svg");
    setDownloadOpen(false);
  }, [schema, positionsForExport]);

  const handleExportPNG = useCallback(() => {
    const svg = renderDiagramSVG(schema, positionsForExport);
    const all = Object.values(positionsForExport);
    const minX = Math.min(...all.map((p) => p.x)) - 40;
    const minY = Math.min(...all.map((p) => p.y)) - 40;
    const maxX = Math.max(...all.map((p) => p.x + p.w)) + 40;
    const maxY = Math.max(...all.map((p) => p.y + p.h)) + 40;
    const w = maxX - minX;
    const h = maxY - minY;

    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w * 2;
      canvas.height = h * 2;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#faf9f7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(2, 2);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      canvas.toBlob((out) => {
        if (out) {
          downloadBlob(out, "schema-diagram.png");
          setDownloadOpen(false);
        }
      }, "image/png");
    };
    img.onerror = () => URL.revokeObjectURL(url);
    img.src = url;
  }, [schema, positionsForExport]);

  return (
    <div className={`relative ${className}`}>
      <ReactFlow
        nodes={renderedNodes}
        edges={renderedEdges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeMouseEnter={(_, node) => setHovered(node.id)}
        onNodeMouseLeave={() => setHovered(null)}
        nodesConnectable={false}
        deleteKeyCode={null}
        minZoom={0.2}
        maxZoom={2.5}
        colorMode="light"
      >
        <Background variant={BackgroundVariant.Dots} gap={28} size={1} color="#d4d4d4" />
        <Controls position="bottom-left" showInteractive={false} className="!border-border !bg-white [&_button]:!text-ink [&_button:hover]:!bg-surface" />
        <MiniMap
          position="bottom-right"
          pannable
          zoomable
          nodeColor="#4f46e5"
          nodeStrokeWidth={2}
          maskColor="rgba(250,249,247,0.7)"
          className="!bg-white"
        />
        <Panel position="top-right">
          <div ref={downloadRef} className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              title="Download"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-ink shadow-md ring-1 ring-border transition-colors hover:bg-surface hover:text-ink"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {downloadOpen && (
              <div className="absolute right-0 top-10 z-20 w-36 rounded-lg border border-border bg-white py-1 shadow-xl">
                <button
                  onClick={handleExportSVG}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" /><polygon points="12 3 12 12 16 8" /></svg>
                  Export SVG
                </button>
                <button
                  onClick={handleExportPNG}
                  className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted transition-colors hover:bg-surface hover:text-ink"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                  Export PNG
                </button>
              </div>
            )}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

interface SchemaDiagramProps {
  schema: Schema;
  className?: string;
  searchQuery?: string;
}

export default function SchemaDiagram({ schema, className = "", searchQuery = "" }: SchemaDiagramProps) {
  return (
    <ReactFlowProvider>
      <Canvas schema={schema} className={className} searchQuery={searchQuery} />
    </ReactFlowProvider>
  );
}
