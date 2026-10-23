"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { schemaToSql } from "@/lib/schemaExport";
import { ECOMMERCE_SQL, SUPABASE_SQL } from "@/lib/sql/pgDumpSamples";
import { RLS_META, rlsSummary, type RlsSummary } from "@/lib/rls";
import { track, tableCountBucket, type GenerateMethod } from "@/lib/analytics";
import TrackedLink from "@/components/TrackedLink";

type Phase = "form" | "loading" | "result" | "error";
type Mode = "connection" | "sql";

interface TryModalProps {
  onSchemaGenerated: (schema: Schema) => void;
  onSchemaCleared: () => void;
  mode?: Mode;
  onModeChange?: (mode: Mode) => void;
  /** Preload SQL (e.g. from /visualize?schema=slug); parsed via the normal live path */
  initialSql?: string;
  /** Preload a full schema object (share links) — rendered as-is, RLS metadata kept */
  initialSchema?: Schema;
  /** Preload a connection string (e.g. staged by the conn-string builder) */
  initialConnString?: string;
  /** Why initialSql exists: tool handoffs count as a user action, samples do not */
  initialMethod?: GenerateMethod;
  /** Stretch to fill the parent on both tabs (used by the full-screen /visualize rail) */
  fill?: boolean;
}

function hashInput(text: string): string {
  const value = text.trim();
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `${value.length}:${(hash >>> 0).toString(36)}`;
}

export default function TryModal({ onSchemaGenerated, onSchemaCleared, mode: controlledMode, onModeChange, initialSql, initialSchema, initialConnString, initialMethod, fill }: TryModalProps) {
  const [internalMode, setInternalMode] = useState<Mode>("sql");
  const mode = controlledMode ?? internalMode;
  const setMode = onModeChange ?? setInternalMode;
  const [connectionString, setConnectionString] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [resultRls, setResultRls] = useState<RlsSummary | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [isLiveSite, setIsLiveSite] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeFile, setActiveFile] = useState<"schema" | "ecommerce" | "sample">("schema");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initialApplied = useRef(false);
  const initialSchemaApplied = useRef(false);
  const suppressParseForRef = useRef<string | null>(null);
  const lastFiredInputRef = useRef("");
  const pendingMethodRef = useRef<GenerateMethod | null>(null);

  // Preload SQL once (e.g. "Open in DBdiagramr to edit" from a schema page)
  useEffect(() => {
    if (initialSql && !initialApplied.current) {
      initialApplied.current = true;
      pendingMethodRef.current = initialMethod ?? null;
      setSqlText(initialSql);
      setActiveFile("schema");
    }
  }, [initialSql, initialMethod]);

  // Preload a decoded share schema once: render it exactly (RLS included) and
  // show its SQL, but skip the parse round-trip that would drop RLS metadata.
  useEffect(() => {
    if (!initialSchema || initialSchemaApplied.current) return;
    initialSchemaApplied.current = true;
    const sql = schemaToSql(initialSchema);
    suppressParseForRef.current = sql;
    setSqlText(sql);
    setActiveFile("schema");
    setSqlError(null);
    onSchemaGenerated(initialSchema);
  }, [initialSchema, onSchemaGenerated]);

  // Preload a staged connection string once (e.g. from the conn-string builder)
  const connApplied = useRef(false);
  useEffect(() => {
    if (initialConnString && !connApplied.current) {
      connApplied.current = true;
      setConnectionString(initialConnString);
    }
  }, [initialConnString]);

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

  const resultRlsMessage: { color: string; text: string } | null = resultRls
    ? resultRls.disabled > 0
      ? {
          color: RLS_META.disabled.color,
          text: `${resultRls.disabled} public ${
            resultRls.disabled === 1 ? "table has" : "tables have"
          } RLS off.`,
        }
      : resultRls.noPolicies > 0
        ? {
            color: RLS_META["no-policies"].color,
            text: `${resultRls.noPolicies} public ${
              resultRls.noPolicies === 1 ? "table has" : "tables have"
            } RLS on with no policies.`,
          }
        : resultRls.protected > 0
          ? {
              color: RLS_META.protected.color,
              text: `RLS is on for all ${resultRls.total} public ${
                resultRls.total === 1 ? "table" : "tables"
              }. Review that the policies are restrictive.`,
            }
          : null
    : null;

  const handleSqlLive = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      const method = pendingMethodRef.current;
      pendingMethodRef.current = null;
      if (!trimmed) {
        setSqlError(null);
        onSchemaCleared();
        return;
      }
      try {
        const { schema } = parseSqlToSchema(trimmed);
        // Only user-produced input gets here: preloads and samples leave the
        // method empty, and repeated input is deduped by a hash of the text.
        if (method && schema.tables.length > 0) {
          const signature = hashInput(trimmed);
          if (signature !== lastFiredInputRef.current) {
            lastFiredInputRef.current = signature;
            track("schema_generated", {
              method,
              table_count_bucket: tableCountBucket(schema.tables.length),
            });
          }
        }
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
    debounceRef.current = setTimeout(() => {
      if (suppressParseForRef.current !== null) {
        const pending = suppressParseForRef.current;
        suppressParseForRef.current = null;
        if (sqlText === pending) return;
      }
      handleSqlLive(sqlText);
    }, delay);
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
    pendingMethodRef.current = null;
    track("sample_viewed", { sample: kind });
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
      pendingMethodRef.current = "file";
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
      pendingMethodRef.current = "file";
      setSqlText(text);
      setActiveFile("schema");
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        pendingMethodRef.current = "file";
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
    let errorTracked = false;
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
                ? "Switch to the Session pooler (5432) or Transaction pooler (6543), see guide."
                : "Check for typos, unpause your database, or use the Session (5432) or Transaction (6543) pooler.",
          });
        }
        if (data.hint === "pooler") setErrorHint("pooler");
        track("schema_failed", {
          method: "connection_string",
          error_code:
            typeof data.code === "string" && data.code ? data.code : "unknown",
        });
        errorTracked = true;
        throw new Error(data.details || data.error || "API error");
      }
      const schema = data as Schema;
      const rls = rlsSummary(schema);
      track("schema_generated", {
        method: "connection_string",
        table_count_bucket: tableCountBucket(schema.tables.length),
      });
      if (rls.hasRls) {
        track("rls_summary_viewed", {
          table_count: schema.tables.length,
          rls_disabled: rls.disabled,
          rls_no_policies: rls.noPolicies,
          rls_protected: rls.protected,
        });
      }
      setPhase("result");
      setResultRls(rls);
      onSchemaGenerated(schema);
    } catch (err: unknown) {
      if (!errorTracked) {
        track("schema_failed", {
          method: "connection_string",
          error_code: "fetch_failed",
        });
      }
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
    setResultRls(null);
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
      className={`relative flex w-full flex-col gap-4 rounded-[14px] p-1 ${isSql && isDragging ? "ring-2 ring-punch/40" : ""} ${isSql || fill ? "h-full min-h-0 flex-1" : "h-auto"}`}
    >
      {isSql && isDragging && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[20px] border-2 border-dashed border-accent bg-ink/5 backdrop-blur-sm">
          <span className="rounded-full border border-border bg-white px-6 py-3 font-mono text-sm font-medium text-ink shadow-lg backdrop-blur-md">
            Drop it on the board
          </span>
        </div>
      )}
      <div className="flex shrink-0 gap-1 rounded-[10px] border border-border bg-surface p-1">
        <button
          onClick={() => setMode("sql")}
          aria-pressed={mode === "sql"}
          className={`flex-1 rounded-[10px] px-4 py-2 text-xs font-medium transition-colors ${mode === "sql" ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
        >
          Paste SQL
        </button>
        <button
          onClick={() => setMode("connection")}
          aria-pressed={mode === "connection"}
          className={`flex-1 rounded-[10px] px-4 py-2 text-xs font-medium transition-colors ${mode === "connection" ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
        >
          Connect
        </button>
      </div>

      {mode === "sql" ? (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[10px] border border-border bg-white">
            <textarea
              ref={textareaRef}
              value={sqlText}
              onChange={(e) => {
                pendingMethodRef.current = "sql";
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
              className={`rounded-[20px] px-3 py-1.5 font-mono text-xs font-medium transition-colors ${activeFile === "schema" ? "bg-accent text-white" : "border border-accent text-accent hover:bg-accent-soft"}`}
            >
              schema.sql
            </button>
            <button
              onClick={() => loadSample("ecommerce")}
              aria-pressed={activeFile === "ecommerce"}
              className={`rounded-[20px] px-3 py-1.5 font-mono text-xs font-medium transition-colors ${activeFile === "ecommerce" ? "bg-accent text-white" : "border border-accent text-accent hover:bg-accent-soft"}`}
            >
              ecommerce.sql
            </button>
            <button
              onClick={() => loadSample("sample")}
              aria-pressed={activeFile === "sample"}
              className={`rounded-[20px] px-3 py-1.5 font-mono text-xs font-medium transition-colors ${activeFile === "sample" ? "bg-accent text-white" : "border border-accent text-accent hover:bg-accent-soft"}`}
            >
              sample.sql
            </button>
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex shrink-0 cursor-pointer flex-col items-center justify-center rounded-[20px] border border-dashed border-border bg-surface px-4 py-8 text-center transition-colors hover:bg-white"
          >
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-[20px] border border-accent bg-accent-soft">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3d7e16" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="17"/><polyline points="9 14 12 17 15 14"/></svg>
            </div>
            <span className="font-mono text-sm font-medium text-ink">Upload .sql file</span>
            <span className="mt-1 font-mono text-xs text-muted">Drop a file or paste above.</span>
          </div>
          <input ref={fileInputRef} type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" aria-hidden />
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          {(phase === "form" || phase === "loading") && (
            <div className="flex max-h-full min-h-0 flex-col rounded-[20px] border border-border bg-white p-5 shadow-sm">
              <div className="shrink-0">
                <h3 className="text-sm font-semibold text-ink">Connect to your database</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">Paste your connection string to visualize your live schema.</p>
              </div>

              <div className="mt-4 flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
                <div className="shrink-0">
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
                    className="w-full rounded-[10px] border border-border bg-surface px-4 py-3 font-mono text-sm text-ink placeholder:text-muted outline-none focus:border-accent focus:ring-1 focus:ring-accent/30"
                  />
                </div>

                {showLocalhostWarning && (
                  <div id="localhost-warning" className="shrink-0 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
                    <p className="font-mono text-xs font-medium text-amber-700">Local database detected</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-amber-600">Local databases only work when running locally. For the hosted version, use Supabase, Neon, or Railway.</p>
                  </div>
                )}

                {isLiveSite && !showLocalhostWarning && (
                  <p className="shrink-0 font-mono text-xs leading-relaxed text-muted">
                    Tip: Session pooler (5432) is the safe default. On Vercel or Netlify use the Transaction pooler (6543) with prepared statements off.
                  </p>
                )}

                <details className="shrink-0 rounded-[10px] border border-border bg-surface px-3 py-2">
                  <summary className="cursor-pointer font-mono text-xs font-medium text-ink">
                    Is my connection string safe?
                  </summary>
                  <ul className="mt-2 space-y-1.5 font-mono text-[11px] leading-relaxed text-muted">
                    <li>· Sent to our backend for one request, then discarded.</li>
                    <li>· Never stored, never logged.</li>
                    <li>· Reads schema metadata only, never table rows.</li>
                    <li>· TLS certificates are always verified.</li>
                  </ul>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
                    A read-only role only needs CONNECT and USAGE:
                  </p>
                  <pre className="mt-1 overflow-x-auto rounded border border-border bg-white p-2 font-mono text-[10px] leading-relaxed text-ink">{`CREATE ROLE dbdiagramr_reader LOGIN PASSWORD '...';
GRANT CONNECT ON DATABASE your_db TO dbdiagramr_reader;
GRANT USAGE ON SCHEMA public TO dbdiagramr_reader;`}</pre>
                </details>
              </div>

              {phase === "loading" ? (
                <div className="mt-4 flex shrink-0 items-center justify-center gap-3 rounded-[10px] border border-border bg-surface px-4 py-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-border border-t-ink" />
                  <span className="font-mono text-xs text-muted">Analyzing schema...</span>
                </div>
              ) : (
                <button
                  onClick={handleGenerateConnection}
                  disabled={!connectionString.trim() || showLocalhostWarning}
                  className="mt-4 w-full shrink-0 rounded-[10px] bg-accent px-4 py-3 font-mono text-xs font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40"
                >
                  Generate diagram
                </button>
              )}
            </div>
          )}

          {phase === "error" && (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="w-full rounded-xl border border-red-200 bg-red-50 p-5">
                <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-600">{errorMsg}</p>
                {errorHint === "pooler" && (
                  <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
                    <p className="font-mono text-xs font-medium text-amber-700">Try the shared pooler (Session 5432 or Transaction 6543)</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-amber-600">Session is the safe default. For serverless, use Transaction pooler (6543) with prepared statements off. Copy the string from Dashboard -&gt; Connect.</p>
                  </div>
                )}
                <button onClick={handleNewConnection} className="mt-4 w-full rounded-[10px] bg-accent px-4 py-2.5 font-mono text-xs font-medium text-white transition-colors hover:bg-accent-hover">Try again</button>
              </div>
            </div>
          )}

          {phase === "result" && (
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className="w-full rounded-[20px] border border-border bg-white p-5 text-center">
                <p className="font-mono text-sm text-ink">Connected</p>
                {resultRlsMessage && (
                  <div className="mt-3 rounded-[10px] border border-border bg-surface px-3 py-2.5">
                    <p className="flex items-start justify-center gap-2 font-mono text-[11px] leading-relaxed text-muted">
                      <span
                        className="mt-1 h-2 w-2 shrink-0 rounded-full"
                        style={{ background: resultRlsMessage.color }}
                      />
                      <span>{resultRlsMessage.text}</span>
                    </p>
                    <TrackedLink
                      href="/supabase-rls-check"
                      event="rls_cta_clicked"
                      params={{
                        location: "connect_result",
                        rls_disabled: resultRls?.disabled ?? 0,
                        rls_no_policies: resultRls?.noPolicies ?? 0,
                        rls_protected: resultRls?.protected ?? 0,
                      }}
                      className="mt-1 inline-block font-mono text-[11px] font-medium text-accent hover:text-accent-hover"
                    >
                      What this means →
                    </TrackedLink>
                  </div>
                )}
                <button onClick={handleNewConnection} className="mt-3 font-mono text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  New connection
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
