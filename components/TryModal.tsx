"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { ECOMMERCE_SQL, SUPABASE_SQL } from "@/lib/sql/pgDumpSamples";

type Phase = "form" | "loading" | "result" | "error";
type Mode = "connection" | "sql";

interface TryModalProps {
  onSchemaGenerated: (schema: Schema) => void;
  onSchemaCleared: () => void;
  mode?: Mode;
  onModeChange?: (mode: Mode) => void;
}

export default function TryModal({ onSchemaGenerated, onSchemaCleared, mode: controlledMode, onModeChange }: TryModalProps) {
  const [internalMode, setInternalMode] = useState<Mode>("sql");
  const mode = controlledMode ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  const [connectionString, setConnectionString] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [isLiveSite, setIsLiveSite] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeFile, setActiveFile] = useState<"schema" | "ecommerce" | "sample">("schema");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
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
        onSchemaCleared();
        return;
      }
      try {
        const { schema } = parseSqlToSchema(trimmed);
        setSqlError(null);
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
    const delay = sqlText.length > 8000 ? 500 : 250;
    debounceRef.current = setTimeout(() => handleSqlLive(sqlText), delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sqlText, mode, handleSqlLive]);

  function loadSample(kind: "schema" | "ecommerce" | "sample") {
    if (kind === "schema") {
      setSqlText("");
      setSqlError(null);
      setActiveFile("schema");
      onSchemaCleared();
      textareaRef.current?.focus();
      return;
    }
    let sample = "";
    if (kind === "ecommerce") sample = ECOMMERCE_SQL;
    else sample = SUPABASE_SQL;
    setSqlText(sample);
    setActiveFile(kind);
    try {
      const { schema } = parseSqlToSchema(sample);
      setSqlError(null);
      onSchemaGenerated(schema);
      const label = kind === "ecommerce" ? "ecommerce.sql" : "sample.sql";
      toast.success(`${label} loaded`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse sample";
      setSqlError(msg);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", { description: "Limit is 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "");
      setSqlText(text);
      setActiveFile("schema");
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
      setActiveFile("schema");
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSqlText(String(reader.result || ""));
        setActiveFile("schema");
      };
      reader.readAsText(file);
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
    setActiveFile("schema");
    onSchemaCleared();
  }

  const hasError = !!sqlError;

  const isSql = mode === "sql";
  return (
    <div
      onDragOver={isSql ? (e) => { e.preventDefault(); setIsDragging(true); } : undefined}
      onDragLeave={isSql ? (e) => { e.preventDefault(); if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragging(false); } : undefined}
      onDrop={isSql ? handleDrop : undefined}
      className={`relative flex w-full flex-col gap-4 rounded-2xl p-1 ${isSql && isDragging ? "ring-2 ring-indigo-500/30" : ""} ${isSql ? "h-full min-h-0 flex-1" : "h-auto"}`}
    >
      {isSql && isDragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-2xl border-2 border-dashed border-indigo-500/60 bg-black/10 backdrop-blur-sm">
          <span className="rounded-full bg-white px-6 py-3 font-mono text-sm font-medium text-ink shadow ring-1 ring-border backdrop-blur-md">
            Drop here
          </span>
        </div>
      )}
      <div className="flex shrink-0 rounded-xl bg-surface p-1">
        <button
          onClick={() => setMode("sql")}
          aria-pressed={mode === "sql"}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "sql" ? "bg-white text-ink shadow border border-border" : "text-muted hover:text-ink"}`}
        >
          Paste SQL
        </button>
        <button
          onClick={() => setMode("connection")}
          aria-pressed={mode === "connection"}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${mode === "connection" ? "bg-white text-ink shadow border border-border" : "text-muted hover:text-ink"}`}
        >
          Connect
        </button>
      </div>

      {mode === "sql" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-white">
            <textarea
              ref={textareaRef}
              value={sqlText}
              onChange={(e) => {
                setSqlText(e.target.value);
                if (activeFile !== "schema") setActiveFile("schema");
              }}
              placeholder={`CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL
);`}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="SQL editor"
              aria-describedby={hasError ? "sql-error" : undefined}
              aria-invalid={hasError}
              className="h-full min-h-0 w-full flex-1 resize-none bg-transparent p-4 font-mono text-xs leading-5 text-ink placeholder:text-muted outline-none"
            />
          </div>

          {hasError && (
            <div id="sql-error" role="alert" className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2">
              <p className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-amber-700">{sqlError}</p>
              <button onClick={handleClearSql} className="mt-2 font-mono text-xs text-amber-700 underline-offset-4 hover:underline">Clear</button>
            </div>
          )}

          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              onClick={() => loadSample("schema")}
              aria-pressed={activeFile === "schema"}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition-colors ${activeFile === "schema" ? "border-ink bg-ink text-white shadow" : "border-border bg-surface text-muted hover:bg-white hover:text-ink"}`}
            >
              schema.sql
            </button>
            <button
              onClick={() => loadSample("ecommerce")}
              aria-pressed={activeFile === "ecommerce"}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition-colors ${activeFile === "ecommerce" ? "border-ink bg-ink text-white shadow" : "border-border bg-surface text-muted hover:bg-white hover:text-ink"}`}
            >
              ecommerce.sql
            </button>
            <button
              onClick={() => loadSample("sample")}
              aria-pressed={activeFile === "sample"}
              className={`rounded-full border px-3 py-1.5 font-mono text-xs font-medium transition-colors ${activeFile === "sample" ? "border-ink bg-ink text-white shadow" : "border-border bg-surface text-muted hover:bg-white hover:text-ink"}`}
            >
              sample.sql
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex shrink-0 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-4 py-8 text-center transition-colors hover:bg-white"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white ring-1 ring-border">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b6b" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="17"/><polyline points="9 14 12 17 15 14"/></svg>
            </div>
            <span className="font-mono text-sm text-ink">Upload .sql file</span>
            <span className="mt-1 font-mono text-xs text-muted">Drop a file or paste above.</span>
          </div>
          <input ref={fileInputRef} type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" aria-hidden />
        </div>
      ) : (
        <>
          {(phase === "form" || phase === "loading") && (
            <div className="rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-medium text-ink">Connect to your database</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">Paste your connection string to visualize your live schema.</p>
              <div className="mt-4">
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
                  className="w-full rounded-xl border border-border bg-surface px-4 py-3 font-mono text-sm text-ink placeholder:text-muted outline-none focus:border-ink/20 focus:ring-1 focus:ring-ink/10"
                />
              </div>

              {showLocalhostWarning && (
                <div id="localhost-warning" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                  <p className="font-mono text-xs font-medium text-amber-700">Local database detected</p>
                  <p className="mt-1 font-mono text-xs leading-relaxed text-amber-600">Local databases only work when running locally. For the hosted version, use Supabase, Neon, or Railway.</p>
                </div>
              )}

              {isLiveSite && !showLocalhostWarning && (
                <p className="mt-3 font-mono text-xs leading-relaxed text-muted">
                  Tip: On Vercel or Netlify use your database Transaction pooler (port 6543), not direct 5432.
                </p>
              )}

              <button
                onClick={handleGenerateConnection}
                disabled={!connectionString.trim() || showLocalhostWarning}
                className="mt-5 w-full rounded-full bg-[#4F39F6] px-4 py-3 font-mono text-sm font-medium text-white hover:bg-[#4338CA] disabled:opacity-40"
              >
                Generate diagram
              </button>
            </div>
          )}

          {phase === "loading" && (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-border bg-white p-6">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-ink" />
              <span className="font-mono text-sm text-muted">Analyzing schema...</span>
            </div>
          )}

          {phase === "error" && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-5">
              <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-600">{errorMsg}</p>
              {errorHint === "pooler" && (
                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                  <p className="font-mono text-xs font-medium text-amber-700">Try the Transaction pooler (port 6543)</p>
                  <p className="mt-1 font-mono text-xs leading-relaxed text-amber-600">Direct connections often fail from serverless. In your dashboard go to Connect, Transaction pooler, copy the 6543 string.</p>
                </div>
              )}
              <button onClick={handleNewConnection} className="mt-4 w-full rounded-full bg-[#4F39F6] px-4 py-2.5 font-mono text-sm font-medium text-white hover:bg-[#4338CA]">Try again</button>
            </div>
          )}

          {phase === "result" && (
            <div className="rounded-xl border border-border bg-white p-5 text-center">
              <p className="font-mono text-sm text-ink">Connected</p>
              <button onClick={handleNewConnection} className="mt-3 font-mono text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                New connection
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
