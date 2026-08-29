"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";
import TryModal from "@/components/TryModal";

export default function TryPage() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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
    <div className="flex h-screen w-full flex-col gap-4 overflow-hidden bg-[#0a0a0a] p-4 pt-[72px] lg:flex-row">
      <h1 className="sr-only">Visualize Your PostgreSQL Schema - ER Diagram Generator</h1>

      <div className="flex h-[52vh] shrink-0 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#141414] lg:h-auto lg:w-[380px] lg:shrink-0">
        <div className="flex-1 overflow-auto p-4">
          <TryModal
            onSchemaGenerated={handleSchemaGenerated}
            onSchemaCleared={handleSchemaCleared}
          />
        </div>
      </div>

      <div className="relative flex flex-1 flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0e0e0e]">
        <button
          type="button"
          aria-label="Close"
          onClick={() => handleSchemaCleared()}
          className="absolute right-4 top-4 z-20 hidden h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 text-[#666] hover:bg-white/10 hover:text-white sm:flex"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        {schema && (
          <div className="absolute left-4 right-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[#1f1f1f]/90 px-3 py-2 shadow-2xl backdrop-blur-sm sm:left-1/2 sm:right-auto sm:top-4 sm:w-[420px] sm:max-w-[90%] sm:-translate-x-1/2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" className="shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tables, columns, types"
              spellCheck={false}
              aria-label="Search tables"
              className="flex-1 bg-transparent font-mono text-xs text-white placeholder-[#666] outline-none"
            />
            <span className="hidden font-mono text-[11px] text-[#555] sm:inline">{schema.tables.length} tables</span>
            {searchQuery ? (
              <button onClick={() => setSearchQuery("")} className="rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-ink hover:bg-white/90">Clear</button>
            ) : (
              <span className="hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-[#888] sm:inline">/</span>
            )}
          </div>
        )}

        <div className="flex flex-1">
          {schema ? (
            <SchemaDiagram schema={schema} className="h-full w-full" searchQuery={searchQuery} />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-8">
              <div className="max-w-sm text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/5">
                  <svg className="h-8 w-8 text-[#555]" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11v6"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 14h6"/></svg>
                </div>
                <h2 className="font-display text-lg font-medium text-white">No diagram yet</h2>
                <p className="mx-auto mt-2 max-w-xs font-mono text-xs leading-relaxed text-[#666]">
                  Paste your <span className="text-[#999]">CREATE TABLE</span> SQL on the left to generate a live ER diagram. Try an example to start.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-[#888]">Live preview</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-mono text-[11px] text-[#888]">Export SVG/PNG</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
