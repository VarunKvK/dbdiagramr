"use client";

import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";
import TryModal from "@/components/TryModal";
import { getSchemaEntry } from "@/data/schemas/registry";
import { schemaToSql } from "@/lib/schemaExport";
import { decodeSchema } from "@/lib/share";

function schemaNameOf(tableName: string): string {
  const dot = tableName.lastIndexOf(".");
  return dot === -1 ? "public" : tableName.slice(0, dot);
}

export default function TryPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"sql" | "connection">("sql");
  const [initialSql, setInitialSql] = useState<string | undefined>(undefined);
  const [initialSchema, setInitialSchema] = useState<Schema | undefined>(undefined);
  const [initialConn, setInitialConn] = useState<string | undefined>(undefined);
  const [activeSchemas, setActiveSchemas] = useState<string[] | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Support /visualize#s=<payload> (private share links),
  // /visualize?schema=<slug> ("Open in DBdiagramr to edit")
  // and sessionStorage handoffs from converter tools (preload-sql / preload-conn)
  useEffect(() => {
    let cancelled = false;
    const hashMatch = window.location.hash.match(/[#&]s=([^&]+)/);
    if (hashMatch) {
      decodeSchema(decodeURIComponent(hashMatch[1])).then((decoded) => {
        if (!cancelled && decoded) {
          setMode("sql");
          setInitialSchema(decoded);
        }
      });
      return () => {
        cancelled = true;
      };
    }
    const slug = new URLSearchParams(window.location.search).get("schema");
    if (slug) {
      const entry = getSchemaEntry(slug);
      if (entry) {
        setMode("sql");
        setInitialSql(schemaToSql(entry.schema));
        return;
      }
    }
    try {
      const sql = window.sessionStorage.getItem("dbdiagramr:preload-sql");
      if (sql) {
        window.sessionStorage.removeItem("dbdiagramr:preload-sql");
        setMode("sql");
        setInitialSql(sql);
        return;
      }
      const conn = window.sessionStorage.getItem("dbdiagramr:preload-conn");
      if (conn) {
        window.sessionStorage.removeItem("dbdiagramr:preload-conn");
        setMode("connection");
        setInitialConn(conn);
      }
    } catch {
      // sessionStorage unavailable (private mode) — ignore
    }
  }, []);

  const handleSchemaGenerated = useCallback((s: Schema) => {
    setSchema(s);
  }, []);

  // Group tables by schema. public is implicit, everything else keeps the
  // "schema." prefix added by the parser and the introspection API.
  const schemaGroups = useMemo(() => {
    if (!schema) return [];
    const counts = new Map<string, number>();
    for (const t of schema.tables) {
      const name = schemaNameOf(t.name);
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    const order = ["public", "auth", "storage"];
    return Array.from(counts.entries())
      .sort(([a], [b]) => {
        const ia = order.indexOf(a);
        const ib = order.indexOf(b);
        if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
        return a.localeCompare(b);
      })
      .map(([name, count]) => ({ name, count }));
  }, [schema]);

  // Supabase connections start on public so the diagram looks like before;
  // auth and storage are one click away.
  useEffect(() => {
    if (!schema) {
      setActiveSchemas(null);
      return;
    }
    const names = Array.from(new Set(schema.tables.map((t) => schemaNameOf(t.name))));
    setActiveSchemas(names.includes("public") ? ["public"] : names);
  }, [schema]);

  const toggleSchema = useCallback((name: string) => {
    setActiveSchemas((current) => {
      const list = current ?? [];
      if (list.includes(name)) {
        return list.length === 1 ? list : list.filter((s) => s !== name);
      }
      return [...list, name];
    });
  }, []);

  const visibleSchema = useMemo(() => {
    if (!schema) return null;
    if (!activeSchemas) return schema;
    return { ...schema, tables: schema.tables.filter((t) => activeSchemas.includes(schemaNameOf(t.name))) };
  }, [schema, activeSchemas]);

  const handleSchemaCleared = useCallback(() => {
    setSchema(null);
    setSearchQuery("");
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && schema) {
        // Don't hijack if already typing in an input
        const target = e.target as HTMLElement;
        if (target.tagName === "INPUT" || target.tagName === "TEXTAREA") return;
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setSearchQuery("");
        (document.activeElement as HTMLElement)?.blur();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [schema]);

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-cream pt-14 lg:flex-row lg:items-stretch">
      <h1 className="sr-only">Visualize Your PostgreSQL Schema - ER Diagram Generator</h1>

      <div className={`z-20 flex shrink-0 flex-col overflow-hidden border-b border-border bg-white lg:h-auto lg:w-[384px] lg:shrink-0 lg:border-b-0 lg:border-r ${mode === "sql" ? "h-[46vh]" : "h-[52vh]"}`}>
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden p-4">
          <TryModal
            mode={mode}
            onModeChange={setMode}
            onSchemaGenerated={handleSchemaGenerated}
            onSchemaCleared={handleSchemaCleared}
            initialSql={initialSql}
            initialSchema={initialSchema}
            initialConnString={initialConn}
            fill
          />
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {schema && (
          <div className="absolute left-4 right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-border bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm sm:left-1/2 sm:right-auto sm:top-4 sm:w-[440px] sm:max-w-[90%] sm:-translate-x-1/2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d7e16" strokeWidth="2.5" className="shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables, columns, types"
              spellCheck={false}
              aria-label="Search tables"
              className="flex-1 bg-transparent font-mono text-xs font-medium text-ink placeholder:text-muted outline-none"
            />
            <span className="hidden rounded-full bg-ink px-2.5 py-0.5 font-mono text-[11px] font-medium text-white sm:inline">{visibleSchema?.tables.length ?? 0} tables</span>
            {searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-white hover:bg-accent-hover">Clear</button>
            ) : (
              <span className="hidden rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted sm:inline">/</span>
            )}
          </div>
        )}

        {schema && schemaGroups.length > 1 && (
          <div className="absolute left-4 right-4 top-[60px] z-20 flex flex-wrap gap-1.5 sm:left-1/2 sm:right-auto sm:-translate-x-1/2">
            {schemaGroups.map((group) => {
              const on = activeSchemas?.includes(group.name) ?? false;
              return (
                <button
                  key={group.name}
                  onClick={() => toggleSchema(group.name)}
                  aria-pressed={on}
                  className={`rounded-full border px-2.5 py-1 font-mono text-[11px] font-medium shadow-sm transition-colors ${on ? "border-accent bg-accent text-white" : "border-border bg-white/95 text-muted hover:text-ink"}`}
                >
                  {group.name} <span className={on ? "text-white/70" : "text-muted/70"}>{group.count}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-1">
          {visibleSchema ? (
            <SchemaDiagram schema={visibleSchema} className="h-full w-full" searchQuery={searchQuery} />
          ) : (
            <div className="flex h-full w-full items-center justify-center overflow-y-auto p-8">
              <div className="max-w-sm rounded-[20px] border border-border bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border border-accent bg-accent-soft">
                  {mode === "sql" ? (
                    <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6"/></svg>
                  ) : (
                    <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><ellipse cx="12" cy="5" rx="8" ry="3" strokeWidth={2}/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>
                  )}
                </div>
                <h2 className="text-xl font-semibold text-ink">{mode === "sql" ? "A blank board" : "No diagram yet"}</h2>
                {mode === "sql" ? (
                  <p className="mx-auto mt-2 max-w-xs font-mono text-xs leading-relaxed text-muted">
                    Paste your <span className="font-medium text-ink">CREATE TABLE</span> SQL on the left and watch tables land on the board.
                  </p>
                ) : (
                  <p className="mx-auto mt-2 max-w-xs font-mono text-xs leading-relaxed text-muted">
                    Paste your connection string on the left and we read your live schema.
                  </p>
                )}
                <div className="mt-4 flex justify-center gap-2">
                  {mode === "sql" ? (
                    <>
                      <span className="rounded-[20px] border border-accent px-3 py-1 font-mono text-[11px] font-medium text-accent">Live preview</span>
                      <span className="rounded-[20px] bg-accent px-3 py-1 font-mono text-[11px] font-medium text-white">Export SVG/PNG</span>
                    </>
                  ) : (
                    <>
                      <span className="rounded-[20px] border border-accent px-3 py-1 font-mono text-[11px] font-medium text-accent">Read-only</span>
                      <span className="rounded-[20px] bg-accent px-3 py-1 font-mono text-[11px] font-medium text-white">TLS verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
