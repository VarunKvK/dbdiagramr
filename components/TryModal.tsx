"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { ECOMMERCE_SQL, SUPABASE_SQL, NEXTAUTH_SQL, SIMPLE_SQL } from "@/lib/sql/pgDumpSamples";

type Phase = "form" | "loading" | "result" | "error";
type Mode = "connection" | "sql";

interface TryModalProps {
  onSchemaGenerated: (schema: Schema) => void;
  onSchemaCleared: () => void;
}

export default function TryModal({ onSchemaGenerated, onSchemaCleared }: TryModalProps) {
  const [mode, setMode] = useState<Mode>("sql");
  const [connectionString, setConnectionString] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlWarnings, setSqlWarnings] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [tableCount, setTableCount] = useState(0);
  const [relCount, setRelCount] = useState(0);
  const [isLiveSite, setIsLiveSite] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLiveSite(
      typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
    );
  }, []);

  const isLocalhostInput =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");
  const showLocalhostWarning = isLiveSite && isLocalhostInput;

  const handleSqlLive = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setSqlError(null);
        setSqlWarnings([]);
        setTableCount(0);
        setRelCount(0);
        onSchemaCleared();
        return;
      }
      try {
        const { schema, warnings } = parseSqlToSchema(trimmed);
        setSqlError(null);
        setSqlWarnings(warnings);
        setTableCount(schema.tables.length);
        setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
        onSchemaGenerated(schema);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to parse SQL";
        setSqlError(msg);
      }
    },
    [onSchemaGenerated, onSchemaCleared]
  );

  useEffect(() => {
    if (mode !== "sql") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = sqlText.length > 8000 ? 600 : 250;
    debounceRef.current = setTimeout(() => handleSqlLive(sqlText), delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sqlText, mode, handleSqlLive]);

  function loadSample(kind: "ecommerce" | "supabase" | "nextauth" | "simple") {
    let sample = "";
    if (kind === "ecommerce") sample = ECOMMERCE_SQL;
    else if (kind === "supabase") sample = SUPABASE_SQL;
    else if (kind === "nextauth") sample = NEXTAUTH_SQL;
    else sample = SIMPLE_SQL;
    setSqlText(sample);
    try {
      const { schema, warnings } = parseSqlToSchema(sample);
      setSqlError(null);
      setSqlWarnings(warnings);
      setTableCount(schema.tables.length);
      setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
      onSchemaGenerated(schema);
      toast.success("Example loaded", {
        description: `${schema.tables.length} tables, ${schema.tables.reduce((a, t) => a + t.foreignKeys.length, 0)} relations`,
      });
      setTimeout(() => textareaRef.current?.focus(), 0);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse sample";
      setSqlError(msg);
    }
  }

  function handleCopySql() {
    if (!sqlText.trim()) {
      toast.error("Nothing to copy", { description: "Paste SQL first or load an example." });
      return;
    }
    navigator.clipboard.writeText(sqlText).then(() => toast.success("Copied to clipboard"));
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", { description: "Limit is 2MB for SQL dumps." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setSqlText(text);
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      setSqlText(text);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSqlText(String(reader.result || ""));
      reader.readAsText(file);
    }
  }

  function handleTextareaScroll() {
    if (gutterRef.current && textareaRef.current) {
      gutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }

  async function handleGenerateConnection() {
    if (!connectionString.trim() || showLocalhostWarning) return;
    setPhase("loading");
    setErrorMsg("");
    setErrorHint(null);
    const cs = connectionString.trim();
    const isLocal = cs.includes("localhost") || cs.includes("127.0.0.1");
    try {
      const res = await fetch("/api/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString: cs,
          ...(isLocal ? { ssl: false } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.localhost) {
          toast.error("Localhost detected", {
            description: "Run dbdiagramr locally or use a cloud database (Supabase, Neon, Railway).",
          });
        }
        if (data.dnsError) {
          toast.error("Database not found", {
            description:
              data.hint === "pooler"
                ? "Switch to the Transaction pooler (port 6543), see guide."
                : "Check for typos, unpause your database, or use the connection pooler (port 6543).",
          });
        }
        if (data.hint === "pooler") setErrorHint("pooler");
        throw new Error(data.details || data.error || "API error");
      }
      const schema = data as Schema;
      setTableCount(schema.tables.length);
      setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
      setPhase("result");
      onSchemaGenerated(schema);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      setPhase("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && phase === "form" && mode === "connection") handleGenerateConnection();
  }

  function handleNewConnection() {
    setPhase("form");
    setErrorHint(null);
    onSchemaCleared();
  }

  function handleClearSql() {
    setSqlText("");
    setSqlError(null);
    setSqlWarnings([]);
    setTableCount(0);
    setRelCount(0);
    onSchemaCleared();
    textareaRef.current?.focus();
  }

  const lineCount = sqlText ? sqlText.split("\n").length : 1;
  const lineNumbers = Array.from({ length: Math.max(lineCount, 8) }, (_, i) => i + 1);
  const hasError = !!sqlError;
  const hasSql = !!sqlText.trim();

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#1a1a1a]/95 shadow-2xl backdrop-blur-sm">
      {(phase === "form" || mode === "sql") && (
        <div className="flex flex-col">
          <div className="flex items-center justify-between border-b border-white/5 bg-[#141414] px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </span>
              <div>
                <h3 className="font-display text-[13px] font-medium leading-none text-white">dbdiagramr</h3>
                <p className="font-mono text-[10px] tracking-wide text-[#666]">SQL to diagram, instantly</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-[#252525] p-0.5">
              <button
                onClick={() => setMode("sql")}
                aria-pressed={mode === "sql"}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${mode === "sql" ? "bg-white text-ink shadow" : "text-[#888] hover:text-white"}`}
              >
                Paste SQL
              </button>
              <button
                onClick={() => setMode("connection")}
                aria-pressed={mode === "connection"}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${mode === "connection" ? "bg-white text-ink shadow" : "text-[#888] hover:text-white"}`}
              >
                Connect
              </button>
            </div>
          </div>

          {mode === "sql" ? (
            <>
              <div className="px-4 pb-3 pt-3">
                <h4 className="font-display text-sm font-medium text-white">Paste your Postgres SQL</h4>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Drop your <code className="rounded bg-white/5 px-1 py-0.5 font-mono text-[11px] text-[#bbb]">CREATE TABLE</code> dump here, diagram updates live. No database needed.
                </p>
              </div>

              <div className="px-4 pb-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="mr-1 font-mono text-[11px] text-[#666]">Try:</span>
                  <button onClick={() => loadSample("ecommerce")} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-medium text-[#ccc] hover:bg-white/10 hover:text-white">E-commerce <span className="text-[#666]">5</span></button>
                  <button onClick={() => loadSample("supabase")} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-medium text-[#ccc] hover:bg-white/10 hover:text-white">Supabase <span className="text-[#666]">7</span></button>
                  <button onClick={() => loadSample("nextauth")} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-medium text-[#ccc] hover:bg-white/10 hover:text-white">NextAuth <span className="text-[#666]">4</span></button>
                  <button onClick={() => loadSample("simple")} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 font-mono text-[11px] font-medium text-[#ccc] hover:bg-white/10 hover:text-white">Simple <span className="text-[#666]">2</span></button>
                  <button onClick={() => fileInputRef.current?.click()} className="ml-auto inline-flex items-center gap-1 rounded-full bg-ink px-3 py-1 font-mono text-[11px] font-medium text-white hover:bg-black">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload .sql
                  </button>
                  <input ref={fileInputRef} type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" aria-hidden />
                </div>
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`relative mx-4 overflow-hidden rounded-xl border bg-editor ${isDragging ? "border-indigo-500/50 ring-2 ring-indigo-500/20" : hasError ? "border-amber-500/30" : "border-editorBorder"} ${isDragging ? "bg-[#0a0a0a]" : ""}`}
              >
                <div className="flex h-9 items-center justify-between border-b border-white/5 bg-[#141414] px-3">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
                    <span className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
                    <span className="ml-2 hidden font-mono text-[11px] text-[#666] sm:inline">schema.sql</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={handleCopySql} title="Copy SQL" aria-label="Copy SQL" className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[#999] hover:bg-white/10 hover:text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v3"/></svg>
                    </button>
                    <button onClick={handleClearSql} title="Clear" aria-label="Clear SQL" className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-[#999] hover:bg-white/10 hover:text-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>

                <div className="relative flex max-h-[320px] min-h-[180px]">
                  <div
                    ref={gutterRef}
                    aria-hidden
                    className="sticky left-0 flex w-12 shrink-0 select-none flex-col items-end overflow-hidden border-r border-white/5 bg-[#0a0a0a] px-3 py-3 font-mono text-[11px] leading-6 text-[#555]"
                    style={{ scrollbarWidth: "none" }}
                  >
                    {lineNumbers.map((n) => {
                      const isErrLine = hasError && sqlError?.toLowerCase().includes(`line ${n}`);
                      return (
                        <span key={n} className={`leading-6 ${isErrLine ? "bg-amber-500/15 font-semibold text-amber-300" : ""} ${n > lineCount ? "opacity-30" : ""}`}>{n}</span>
                      );
                    })}
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={sqlText}
                    onChange={(e) => setSqlText(e.target.value)}
                    onScroll={handleTextareaScroll}
                    placeholder={`CREATE TABLE users (
  id uuid PRIMARY KEY,
  email varchar(255) NOT NULL
);

CREATE TABLE posts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL
);`}
                    rows={10}
                    spellCheck={false}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    aria-label="SQL editor"
                    aria-describedby={hasError ? "sql-error" : hasSql ? "sql-live" : undefined}
                    aria-invalid={hasError}
                    className="min-h-[180px] w-full flex-1 resize-none bg-transparent px-3 py-3 font-mono text-xs leading-6 text-white placeholder-[#555] outline-none"
                  />
                </div>

                <div className="flex h-8 items-center justify-between border-t border-white/5 bg-[#141414] px-3">
                  <div className="flex items-center gap-3 font-mono text-[11px]">
                    <span className="text-[#666]">Ln {lineCount} • {sqlText.length} chars</span>
                    {sqlWarnings.length > 0 && !hasError && <span className="hidden text-amber-300/60 sm:inline">{sqlWarnings[0].slice(0, 60)}</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    {hasError ? (
                      <span id="sql-error" role="alert" className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-amber-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> Parse error
                      </span>
                    ) : hasSql ? (
                      <span id="sql-live" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[11px] font-medium text-emerald-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Live: {tableCount} tables, {relCount} relations
                      </span>
                    ) : (
                      <span className="font-mono text-[11px] text-[#555]">Paste SQL to preview</span>
                    )}
                  </div>
                </div>
              </div>

              {hasError ? (
                <div className="mx-4 mt-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.07] px-3 py-3">
                  <p id="sql-error" role="alert" className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-amber-200">{sqlError}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button onClick={handleClearSql} className="rounded-full bg-white px-3 py-1 font-mono text-[11px] font-medium text-ink hover:bg-white/90">Clear and start over</button>
                    <button onClick={() => loadSample("ecommerce")} className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 font-mono text-[11px] font-medium text-amber-200 hover:bg-amber-500/20">Load working example</button>
                  </div>
                </div>
              ) : hasSql ? null : (
                <div className="mx-4 mt-3 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-4 py-4 text-center">
                  <p className="font-mono text-xs leading-relaxed text-[#888]">Drag a <span className="font-medium text-[#bbb]">.sql</span> file here, or paste your dump above.</p>
                  <p className="mt-1 font-mono text-[11px] text-[#666]">Tip: Supabase - Database - Backups - Download schema, or run <code className="rounded bg-white/5 px-1 py-0.5">pg_dump --schema-only</code>. Paste the <code className="text-[#999]">CREATE TABLE</code> block.</p>
                  <button onClick={() => loadSample("ecommerce")} className="mt-3 inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 font-mono text-xs font-medium text-white hover:bg-indigo-500">
                    Load E-commerce example
                  </button>
                </div>
              )}

              <div className="h-3" />
            </>
          ) : (
            <div className="px-1 pb-1">
              <h4 className="px-3 pt-1 font-display text-sm font-medium text-white">Connect your PostgreSQL database</h4>
              <p className="px-3 pb-3 pt-1 text-xs leading-relaxed text-muted">
                Paste your connection string to visualize your live schema.
              </p>
              <div className="px-3 pb-3">
                <label htmlFor="connection-string" className="sr-only">Connection string</label>
                <input
                  id="connection-string"
                  type="text"
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="postgresql://user:pass@host:5432/dbname"
                  autoComplete="off"
                  spellCheck={false}
                  aria-invalid={showLocalhostWarning}
                  aria-describedby={showLocalhostWarning ? "localhost-warning" : undefined}
                  className="w-full rounded-xl border border-editorBorder bg-editor px-3 py-2.5 font-mono text-xs text-white placeholder-[#555] outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-2"
                />
              </div>

              {showLocalhostWarning && (
                <div id="localhost-warning" className="mx-3 mb-3 flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 px-3 py-3">
                  <svg className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/></svg>
                  <div>
                    <p className="font-mono text-xs font-medium text-amber-400">Local database detected</p>
                    <p className="mt-0.5 font-mono text-[11px] leading-relaxed text-amber-300/70">Local databases only work when running dbdiagramr locally. For the hosted version, use a cloud database like Supabase, Neon, or Railway.</p>
                  </div>
                </div>
              )}

              {isLiveSite && !showLocalhostWarning && (
                <p className="mx-3 mb-3 rounded-xl bg-white/[0.03] px-3 py-2 font-mono text-[11px] leading-relaxed text-[#777]">
                  Tip: On Vercel or Netlify use your database&apos;s <span className="font-medium text-[#bbb]">Transaction pooler (port 6543)</span>, not direct 5432. More secure and avoids ENOTFOUND.
                </p>
              )}

              <div className="px-3 pb-4">
                <button
                  onClick={handleGenerateConnection}
                  disabled={!connectionString.trim() || showLocalhostWarning}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 font-mono text-xs font-medium text-white transition-colors hover:bg-black disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Generate Diagram
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {phase === "loading" && mode === "connection" && (
        <div className="flex items-center justify-center gap-3 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/10 border-t-indigo-500" />
          <span className="font-mono text-xs text-[#888]">Analyzing schema...</span>
        </div>
      )}

      {phase === "error" && mode === "connection" && (
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            </div>
            <span className="font-display text-sm font-medium text-white">Connection failed</span>
          </div>
          <p className="mb-3 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-[#999]">{errorMsg}</p>
          {errorHint === "pooler" && (
            <div className="mb-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="font-mono text-xs font-medium text-amber-400">Try the Transaction pooler (port 6543)</p>
              <p className="mt-1 font-mono text-[11px] leading-relaxed text-amber-300/70">Supabase or Neon direct connections often fail from serverless (Vercel). In your database dashboard, go to Connect - Transaction pooler - copy the 6543 string and paste it here. Or paste your SQL in the other tab, no credentials needed.</p>
            </div>
          )}
          <button onClick={handleNewConnection} className="w-full rounded-xl bg-white px-4 py-2 font-mono text-xs font-medium text-ink hover:bg-white/90">Try Again</button>
        </div>
      )}

      {phase === "result" && mode === "connection" && (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-display text-sm font-medium text-white">Connected</h3>
            <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-medium tracking-wide text-emerald-400">LIVE</span>
          </div>
          <div className="mb-3 flex gap-3 font-mono text-xs text-[#888]">
            <span>Tables: <strong className="font-medium text-white">{tableCount}</strong></span>
            <span>Relations: <strong className="font-medium text-white">{relCount}</strong></span>
          </div>
          <button onClick={handleNewConnection} className="w-full rounded-xl border border-white/10 px-4 py-2 font-mono text-xs font-medium text-white hover:bg-white/5">New Connection</button>
        </div>
      )}
    </div>
  );
}
