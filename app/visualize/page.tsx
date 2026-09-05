"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";
import TryModal from "@/components/TryModal";

export default function TryPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"sql" | "connection">("sql");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
    <div className={`flex w-full flex-col gap-4 overflow-hidden bg-cream p-4 pt-[72px] lg:flex-row ${mode === "sql" ? "h-screen lg:items-stretch" : "min-h-screen lg:items-start"}`}>
      <h1 className="sr-only">Visualize Your PostgreSQL Schema - ER Diagram Generator</h1>

      <div className={`flex shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-white ${mode === "sql" ? "h-[52vh] lg:h-[calc(100vh-88px)] lg:w-[380px] lg:shrink-0" : "h-auto lg:w-[380px] lg:shrink-0"}`}>
        <div className={`flex flex-col overflow-hidden p-4 ${mode === "sql" ? "min-h-0 flex-1" : "h-auto"}`}>
          <TryModal
            mode={mode}
            onModeChange={setMode}
            onSchemaGenerated={handleSchemaGenerated}
            onSchemaCleared={handleSchemaCleared}
          />
        </div>
      </div>

      <div className={`relative flex flex-col overflow-hidden rounded-2xl border border-border bg-white ${mode === "sql" ? "min-h-0 flex-1 lg:h-[calc(100vh-88px)]" : "min-h-[60vh] flex-1 lg:h-[calc(100vh-88px)]"}`}>
        {schema && (
          <div className="absolute left-4 right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-border bg-white/90 px-3 py-2 shadow-md backdrop-blur-sm sm:left-1/2 sm:right-auto sm:top-4 sm:w-[420px] sm:max-w-[90%] sm:-translate-x-1/2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="2" className="shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables, columns, types"
              spellCheck={false}
              aria-label="Search tables"
              className="flex-1 bg-transparent font-mono text-xs text-ink placeholder:text-muted outline-none"
            />
            <span className="hidden font-mono text-[11px] text-muted sm:inline">{schema.tables.length} tables</span>
            {searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="rounded-full bg-ink px-2.5 py-1 font-mono text-[11px] font-medium text-white hover:bg-ink/90">Clear</button>
            ) : (
              <span className="hidden rounded bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">/</span>
            )}
          </div>
        )}

        <div className="flex flex-1">
          {schema ? (
            <SchemaDiagram schema={schema} className="h-full w-full" searchQuery={searchQuery} />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-surface ring-1 ring-border">
                  <svg className="h-8 w-8 text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14h6"/></svg>
                </div>
                <h2 className="font-display text-lg font-medium text-ink">No diagram yet</h2>
                <p className="mx-auto mt-2 max-w-xs font-mono text-xs leading-relaxed text-muted">
                  Paste your <span className="text-ink">CREATE TABLE</span> SQL on the left to generate a live ER diagram. Try an example to start.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted">Live preview</span>
                  <span className="rounded-full border border-border bg-surface px-3 py-1 font-mono text-[11px] text-muted">Export SVG/PNG</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
