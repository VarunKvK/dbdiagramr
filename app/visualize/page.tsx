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
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a1a]">
      <h1 className="sr-only">
        Visualize Your PostgreSQL Schema — ER Diagram Generator
      </h1>
      {/* Floating modal */}
      <div className="absolute top-20 left-4 z-20">
        <TryModal
          onSchemaGenerated={handleSchemaGenerated}
          onSchemaCleared={handleSchemaCleared}
        />
      </div>

      {/* Search bar — only when diagram exists */}
      {schema && (
        <div className="absolute left-4 right-4 top-[280px] z-20 flex items-center gap-2 rounded-xl border border-white/10 bg-[#1f1f1f]/95 px-3 py-2 shadow-2xl backdrop-blur-sm sm:left-1/2 sm:right-auto sm:top-20 sm:w-auto sm:-translate-x-1/2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" className="shrink-0"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tables or types…  (/)"
            className="w-64 bg-transparent text-xs text-white placeholder-[#666] outline-none"
          />
          {searchQuery ? (
            <button onClick={() => setSearchQuery("")} className="rounded bg-[#2a2a2a] px-2 py-0.5 text-[11px] text-[#aaa] hover:bg-[#333]">Clear</button>
          ) : (
            <span className="hidden sm:inline rounded bg-[#2a2a2a] px-1.5 py-0.5 font-mono text-[10px] text-[#666]">/</span>
          )}
          {searchQuery && (
            <span className="hidden sm:inline text-[11px] text-[#666]">
              {schema.tables.filter((t) => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.columns.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))).length} match
            </span>
          )}
        </div>
      )}

      {/* Full-page diagram preview */}
      <div className="h-full w-full">
        {schema ? (
          <SchemaDiagram schema={schema} className="h-full w-full" searchQuery={searchQuery} />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#252525]">
                <svg
                  className="h-8 w-8 text-[#555]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h8M12 8v8"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-medium text-[#555]">
                No diagram yet
              </h2>
              <p className="max-w-xs text-sm text-[#444]">
                Paste your PostgreSQL connection string or query result in the panel above to
                generate a live ER diagram.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
