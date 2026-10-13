"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";
import TryModal from "@/components/TryModal";
import { getSchemaEntry } from "@/data/schemas/registry";
import { schemaToSql } from "@/lib/schemaExport";

export default function TryPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"sql" | "connection">("sql");
  const [initialSql, setInitialSql] = useState<string | undefined>(undefined);
  const [initialConn, setInitialConn] = useState<string | undefined>(undefined);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Support /visualize?schema=<slug> ("Open in DBdiagramr to edit")
  // and sessionStorage handoffs from converter tools (preload-sql / preload-conn)
  useEffect(() => {
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
    <div className={`flex w-full flex-col overflow-hidden bg-cream pt-14 lg:flex-row ${mode === "sql" ? "h-screen lg:items-stretch" : "min-h-screen lg:items-start"}`}>
      <h1 className="sr-only">Visualize Your PostgreSQL Schema - ER Diagram Generator</h1>

      <div className={`z-20 flex shrink-0 flex-col overflow-hidden border-b border-border bg-white ${mode === "sql" ? "h-[46vh] lg:h-auto lg:w-[384px] lg:shrink-0 lg:border-b-0 lg:border-r" : "h-auto lg:w-[384px] lg:shrink-0 lg:border-b-0 lg:border-r"}`}>
        <div className={`flex flex-col overflow-hidden p-4 ${mode === "sql" ? "min-h-0 flex-1" : "h-auto"}`}>
          <TryModal
            mode={mode}
            onModeChange={setMode}
            onSchemaGenerated={handleSchemaGenerated}
            onSchemaCleared={handleSchemaCleared}
            initialSql={initialSql}
            initialConnString={initialConn}
          />
        </div>
      </div>

      <div className={`relative flex min-h-0 flex-1 flex-col overflow-hidden ${mode === "sql" ? "lg:h-[calc(100vh-56px)]" : "min-h-[60vh] lg:h-[calc(100vh-56px)]"}`}>
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
            <span className="hidden rounded-full bg-ink px-2.5 py-0.5 font-mono text-[11px] font-medium text-white sm:inline">{schema.tables.length} tables</span>
            {searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="rounded-full bg-accent px-2.5 py-1 font-mono text-[11px] font-bold text-white hover:bg-accent-hover">Clear</button>
            ) : (
              <span className="hidden rounded border border-border bg-white px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted sm:inline">/</span>
            )}
          </div>
        )}

        <div className="flex flex-1">
          {schema ? (
            <SchemaDiagram schema={schema} className="h-full w-full" searchQuery={searchQuery} />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="max-w-sm rounded-[20px] border border-border bg-white p-8 text-center shadow-xl">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] border border-accent bg-accent-soft">
                  <svg className="h-7 w-7 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14h6"/></svg>
                </div>
                <h2 className="text-xl font-semibold text-ink">A blank board</h2>
                <p className="mx-auto mt-2 max-w-xs font-mono text-xs leading-relaxed text-muted">
                  Paste your <span className="font-medium text-ink">CREATE TABLE</span> SQL on the left and watch tables land on the board.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="rounded-[20px] border border-accent px-3 py-1 font-mono text-[11px] font-medium text-accent">Live preview</span>
                  <span className="rounded-[20px] bg-accent px-3 py-1 font-mono text-[11px] font-medium text-white">Export SVG/PNG</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
