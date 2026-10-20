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
import { RLS_META, rlsHint, rlsStatus, rlsSummary } from "@/lib/rls";
import { MAX_PUBLIC_PAYLOAD, encodeSchema } from "@/lib/share";
import { track } from "@/lib/analytics";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Sticker palette: table identity color, deterministic by schema order ── */

export const STICKERS = [
  { header: "#eaf3e4", edge: "#3d7e16" },
  { header: "#d9ead3", edge: "#1e7e34" },
  { header: "#e2f0e4", edge: "#0f766e" },
  { header: "#f0f7e6", edge: "#65a30d" },
  { header: "#dcefe4", edge: "#0d9488" },
  { header: "#e8f3dc", edge: "#4d7c0f" },
] as const;

export function stickerFor(tableName: string, order: number) {
  return STICKERS[order % STICKERS.length];
}

/* ── Custom node: a table card ── */

type TableNodeData = {
  table: Schema["tables"][number];
  targetCols: Set<string>;
  highlightCols?: Set<string>;
  highlightTable?: boolean;
  searchActive?: boolean;
  colorIdx?: number;
};

type TableFlowNode = RFNode<TableNodeData, "table">;

function TableNode({ data }: NodeProps<TableFlowNode>) {
  const { table, targetCols } = data;
  const size = tableSize(table);
  const fkColumns = new Set(table.foreignKeys.map((f) => f.column));
  const sticker = STICKERS[(data.colorIdx ?? 0) % STICKERS.length];

  const handleTop = (i: number) => ((LAYOUT.header + i * LAYOUT.rowH + LAYOUT.rowH / 2) / size.height) * 100;

  return (
    <div
      className={`overflow-hidden rounded-xl bg-[#1e1e1e] shadow-lg ${data.searchActive && data.highlightTable ? "ring-2 ring-[#7aa861]" : ""}`}
      style={{ width: size.width, height: size.height }}
    >
      <div
        className="relative flex h-[38px] items-center justify-center font-mono text-[13px] font-bold text-[#1e1e1e]"
        style={{ background: sticker.header }}
      >
        {table.name}
        {table.rls && (
          <span
            role="img"
            aria-label={rlsHint(table)}
            title={rlsHint(table)}
            className="absolute right-3 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full ring-2 ring-black/10"
            style={{ background: RLS_META[rlsStatus(table.rls)].color }}
          />
        )}
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
              className={`relative flex h-[26px] items-center justify-between px-[14px] ${isSearchActive && data.highlightTable === false && !isColMatch ? "opacity-50" : ""}`}
              style={
                isColMatch
                  ? { background: "#eaf2e4" }
                  : isPk
                    ? { background: `${sticker.edge}26` }
                    : undefined
              }
              title={`${col.name} ${formatType(col.type)}${col.nullable === "YES" ? " nullable" : " not null"}${col.default ? ` default ${col.default}` : ""}`}
            >
              <span className={`truncate font-mono text-[12px] ${isColMatch ? "font-bold text-[#1e1e1e]" : "text-white"}`}>{col.name}</span>
              <span className="ml-2 flex shrink-0 items-center gap-1.5">
                <span className={`font-mono text-[10px] ${isColMatch ? "text-[#1e1e1e]" : "text-[#a3bfa0]"}`}>{formatType(col.type)}</span>
                {(isPk || isFkCol) && (
                  <span className="font-mono text-[10px] font-bold" style={{ color: isColMatch ? "#1e1e1e" : sticker.header }}>
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

type ErdEdgeData = { fromLabel: string; toLabel: string; edgeColor?: string };

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
          <span
            className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] font-bold ring-1 ring-[#1e1e1e]"
            style={{ color: data?.edgeColor ?? "#3d7e16" }}
          >
            {data?.fromLabel ?? "*"}
          </span>
        </div>
        <div
          className="pointer-events-none absolute"
          style={{ transform: `translate(-50%, -50%) translate(${targetX}px, ${targetY}px)` }}
        >
          <span
            className="flex h-4 w-4 items-center justify-center rounded bg-white text-[9px] font-bold ring-1 ring-[#1e1e1e]"
            style={{ color: data?.edgeColor ?? "#3d7e16" }}
          >
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

  const nodes: TableFlowNode[] = schema.tables.map((table, idx) => {
    const pos = layout[table.name];
    return {
      id: table.name,
      type: "table" as const,
      position: { x: pos.x, y: pos.y },
      data: { table, targetCols: targetCols.get(table.name) ?? new Set(), colorIdx: idx },
    };
  });

  const orderOf = (name: string) => schema.tables.findIndex((t) => t.name === name);

  const edges: ErdFlowEdge[] = [];
  for (const table of schema.tables) {
    for (const fk of table.foreignKeys) {
      const edgeColor = STICKERS[(orderOf(table.name) + STICKERS.length) % STICKERS.length].edge;
      edges.push({
        id: `${table.name}-${fk.column}-${fk.referencesTable}-${fk.referencesColumn}`,
        source: table.name,
        sourceHandle: `src-${fk.column}`,
        target: fk.referencesTable,
        targetHandle: `tgt-${fk.referencesColumn}`,
        type: "erd" as const,
        data: { fromLabel: "*", toLabel: "1", edgeColor },
        markerEnd: { type: MarkerType.ArrowClosed, color: edgeColor },
        style: { stroke: edgeColor, strokeWidth: 2, transition: "opacity 0.15s ease" },
      });
    }
  }

  return { nodes, edges };
}

function RlsLegendItem({
  status,
  count,
}: {
  status: "disabled" | "no-policies" | "protected";
  count: number;
}) {
  const meta = RLS_META[status];
  const label =
    status === "disabled" ? "off" : status === "no-policies" ? "no policies" : "on";

  return (
    <span className="inline-flex items-center gap-1.5" title={meta.description}>
      <span
        className="h-2 w-2 rounded-full"
        style={{ background: meta.color }}
      />
      <span>
        {count} {label}
      </span>
    </span>
  );
}

function Canvas({ schema, className = "", searchQuery = "", zoomOnScroll = true, passive = false, minimal = false }: SchemaDiagramProps) {
  const { fitView } = useReactFlow();
  const [nodes, setNodes, onNodesChange] = useNodesState<TableFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ErdFlowEdge>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [downloadOpen, setDownloadOpen] = useState(false);
  const downloadRef = useRef<HTMLDivElement>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareBusy, setShareBusy] = useState(false);
  const [sharePayload, setSharePayload] = useState("");
  const [shareCopied, setShareCopied] = useState<"private" | "public" | null>(null);
  const shareRef = useRef<HTMLDivElement>(null);
  const rls = useMemo(() => rlsSummary(schema), [schema]);
  const lastRlsTracked = useRef("");

  useEffect(() => {
    const { nodes: n, edges: e } = buildElements(schema);
    setNodes(n);
    setEdges(e);
    const t = setTimeout(() => fitView({ padding: 0.15, duration: 200 }), 60);
    return () => clearTimeout(t);
  }, [schema, setNodes, setEdges, fitView]);

  useEffect(() => {
    if (!rls.hasRls) return;
    const signature = schema.tables
      .map((table) => `${table.name}:${table.rls?.enabled}:${table.rls?.policyCount}`)
      .join("|");
    if (lastRlsTracked.current === signature) return;
    lastRlsTracked.current = signature;
    track("rls_summary_viewed", {
      table_count: schema.tables.length,
      rls_disabled: rls.disabled,
      rls_no_policies: rls.noPolicies,
      rls_protected: rls.protected,
    });
  }, [schema, rls]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (downloadRef.current && !downloadRef.current.contains(e.target as Node)) {
        setDownloadOpen(false);
      }
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    if (downloadOpen || shareOpen) {
      document.addEventListener("mousedown", handleClick);
      return () => document.removeEventListener("mousedown", handleClick);
    }
  }, [downloadOpen, shareOpen]);

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
            transition: "opacity 0.15s ease",
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
        // Dim edges where neither end matched, keep table colors otherwise
        const isRelated = searchMatches.tableMatches.has(e.source) || searchMatches.tableMatches.has(e.target);
        return {
          ...e,
          style: {
            ...e.style,
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
    track("export_clicked", {
      format: "svg",
      table_count: schema.tables.length,
      rls: rls.hasRls,
    });
    downloadBlob(new Blob([svg], { type: "image/svg+xml;charset=utf-8" }), "schema-diagram.svg");
    setDownloadOpen(false);
  }, [schema, positionsForExport, rls.hasRls]);

  const handleExportPNG = useCallback(() => {
    const svg = renderDiagramSVG(schema, positionsForExport);
    track("export_clicked", {
      format: "png",
      table_count: schema.tables.length,
      rls: rls.hasRls,
    });
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
      ctx.fillStyle = "#f3ffe6";
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
  }, [schema, positionsForExport, rls.hasRls]);

  const shareTooLong = sharePayload.length > MAX_PUBLIC_PAYLOAD;

  const handleToggleShare = useCallback(() => {
    const next = !shareOpen;
    setShareOpen(next);
    if (next && !sharePayload) {
      setShareBusy(true);
      encodeSchema(schema)
        .then(setSharePayload)
        .catch(() => setSharePayload(""))
        .finally(() => setShareBusy(false));
    }
  }, [shareOpen, sharePayload, schema]);

  const handleCopyShare = useCallback(
    async (kind: "private" | "public") => {
      if (!sharePayload) return;
      const origin = window.location.origin;
      const url =
        kind === "private"
          ? `${origin}/visualize#s=${sharePayload}`
          : `${origin}/s/${sharePayload}`;
      track("share_clicked", {
        kind,
        table_count: schema.tables.length,
        length: sharePayload.length,
      });
      try {
        await navigator.clipboard.writeText(url);
        setShareCopied(kind);
        setTimeout(() => setShareCopied(null), 2000);
      } catch {
        window.prompt("Copy this link", url);
      }
    },
    [sharePayload, schema.tables.length]
  );

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
        zoomOnScroll={passive ? false : zoomOnScroll}
        panOnScroll={false}
        panOnDrag={!passive}
        nodesDraggable={!passive}
        elementsSelectable={!passive}
        preventScrolling={!passive}
        colorMode="light"
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#bfd8b2" />
        <Controls position="bottom-left" showInteractive={false} className="!rounded-[10px] !border !border-border !bg-white !shadow-md [&_button]:!border-b-[#eaf2e4] [&_button]:!text-ink [&_button:hover]:!bg-accent-soft" />
        {!minimal && (
          <MiniMap
            position="bottom-right"
            pannable
            zoomable
            nodeColor="#3d7e16"
            nodeStrokeWidth={2}
            maskColor="rgba(243,255,230,0.7)"
            className="!rounded-[10px] !border !border-border !bg-white !shadow-md"
          />
        )}
        {rls.hasRls && (
          <Panel position="bottom-center">
            <div className="mb-1 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 rounded-full border border-border bg-white/95 px-3 py-1.5 font-mono text-[11px] font-medium text-muted shadow-md backdrop-blur-sm">
              <span className="text-ink">RLS</span>
              {rls.disabled > 0 && (
                <RlsLegendItem status="disabled" count={rls.disabled} />
              )}
              {rls.noPolicies > 0 && (
                <RlsLegendItem status="no-policies" count={rls.noPolicies} />
              )}
              {rls.protected > 0 && (
                <RlsLegendItem status="protected" count={rls.protected} />
              )}
            </div>
          </Panel>
        )}
        <Panel position="top-right">
          {!minimal && (
          <div className="flex items-center gap-2">
          <div ref={shareRef} className="relative">
            <button
              onClick={handleToggleShare}
              title="Share link"
              aria-label="Share diagram link"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-white text-ink shadow-md transition-colors hover:bg-accent-soft"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="18" cy="5" r="3" />
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
            {shareOpen && (
              <div className="absolute right-0 top-10 z-20 w-64 rounded-[10px] border border-border bg-white p-1.5 shadow-xl">
                {shareBusy ? (
                  <p className="px-2 py-2 text-xs text-muted">Preparing link…</p>
                ) : (
                  <>
                    <button
                      onClick={() => handleCopyShare("private")}
                      className="flex w-full flex-col items-start gap-0.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-surface"
                    >
                      <span className="text-xs font-medium text-ink">
                        {shareCopied === "private" ? "Copied!" : "Copy private link"}
                      </span>
                      <span className="text-[11px] leading-snug text-muted">
                        Keeps the schema in the URL after #. Never sent to a server.
                      </span>
                    </button>
                    <button
                      onClick={() => handleCopyShare("public")}
                      disabled={shareTooLong}
                      className="flex w-full flex-col items-start gap-0.5 rounded-[8px] px-2.5 py-2 text-left transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="text-xs font-medium text-ink">
                        {shareCopied === "public" ? "Copied!" : "Copy public link"}
                      </span>
                      <span className="text-[11px] leading-snug text-muted">
                        {shareTooLong
                          ? "Diagram is too large to embed in a link."
                          : "Opens a read-only view with a preview image for Slack, X, GitHub."}
                      </span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
          <div ref={downloadRef} className="relative">
            <button
              onClick={() => setDownloadOpen((v) => !v)}
              title="Download"
              className="flex h-8 w-8 items-center justify-center rounded-[10px] border border-border bg-white text-ink shadow-md transition-colors hover:bg-accent-soft"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
            {downloadOpen && (
              <div className="absolute right-0 top-10 z-20 w-36 rounded-[10px] border border-border bg-white py-1 shadow-xl">
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
          </div>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}

interface SchemaDiagramProps {
  schema: Schema;
  className?: string;
  searchQuery?: string;
  /** Disable wheel-zoom so embedded previews don't trap page scroll (hero). */
  zoomOnScroll?: boolean;
  /**
   * Fully passive preview: no wheel-zoom, no pane pan, no node drag, no
   * selection, and no scroll prevention — the page always scrolls, on
   * desktop and touch. Hover highlighting still works.
   */
  passive?: boolean;
  /**
   * Minimal chrome for embedded previews: hides the minimap and the
   * download menu, keeping only zoom controls.
   */
  minimal?: boolean;
}

export default function SchemaDiagram({ schema, className = "", searchQuery = "", zoomOnScroll = true, passive = false, minimal = false }: SchemaDiagramProps) {
  return (
    <ReactFlowProvider>
      <Canvas schema={schema} className={className} searchQuery={searchQuery} zoomOnScroll={zoomOnScroll} passive={passive} minimal={minimal} />
    </ReactFlowProvider>
  );
}
