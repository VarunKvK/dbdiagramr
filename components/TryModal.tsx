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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Live SQL parse
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
        // Don't clear existing diagram on error — keep last good state for comparison
      }
    },
    [onSchemaGenerated, onSchemaCleared]
  );

  useEffect(() => {
    if (mode !== "sql") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    // Live for small pastes (<10k chars), debounce for larger
    const delay = sqlText.length > 8000 ? 600 : 300;
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
    // Immediate parse without waiting debounce
    try {
      const { schema, warnings } = parseSqlToSchema(sample);
      setSqlError(null);
      setSqlWarnings(warnings);
      setTableCount(schema.tables.length);
      setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
      onSchemaGenerated(schema);
      toast.success("Example loaded", { description: `${schema.tables.length} tables • ${schema.tables.reduce((a, t) => a + t.foreignKeys.length, 0)} relations` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse sample";
      setSqlError(msg);
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
            description:
              "Run dbdiagramr locally or use a cloud database (Supabase, Neon, Railway).",
          });
        }
        if (data.dnsError) {
          toast.error("Database not found", {
            description:
              data.hint === "pooler"
                ? "Switch to the Transaction pooler (port 6543) — see guide."
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
  }

  return (
    <div className="w-80 rounded-xl border border-white/10 bg-[#1a1a1a]/95 shadow-2xl backdrop-blur-sm">
      {phase === "form" || mode === "sql" ? (
        <div className="p-4">
          {/* Tabs */}
          <div className="mb-3 flex rounded-lg bg-[#252525] p-0.5">
            <button
              onClick={() => setMode("sql")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "sql" ? "bg-[#333] text-white shadow" : "text-[#888] hover:text-[#ccc]"}`}
            >
              Paste SQL
            </button>
            <button
              onClick={() => setMode("connection")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "connection" ? "bg-[#333] text-white shadow" : "text-[#888] hover:text-[#ccc]"}`}
            >
              Connection string
            </button>
          </div>

          {mode === "sql" ? (
            <>
              <h3 className="mb-1 text-sm font-medium text-white">Paste your Postgres SQL</h3>
              <p className="mb-2 text-xs leading-relaxed text-[#888]">
                Drop your <code className="rounded bg-[#252525] px-1 py-0.5 font-mono text-[11px] text-[#aaa]">CREATE TABLE</code> dump here — diagram updates live. No DB needed.
              </p>
              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="mr-1 text-[11px] text-[#666]">Try:</span>
                <button onClick={() => loadSample("ecommerce")} className="rounded-full bg-[#252525] px-2.5 py-1 text-[11px] font-medium text-[#aaa] ring-1 ring-white/5 hover:bg-[#333] hover:text-white">E-commerce</button>
                <button onClick={() => loadSample("supabase")} className="rounded-full bg-[#252525] px-2.5 py-1 text-[11px] font-medium text-[#aaa] ring-1 ring-white/5 hover:bg-[#333] hover:text-white">Supabase</button>
                <button onClick={() => loadSample("nextauth")} className="rounded-full bg-[#252525] px-2.5 py-1 text-[11px] font-medium text-[#aaa] ring-1 ring-white/5 hover:bg-[#333] hover:text-white">NextAuth</button>
                <button onClick={() => loadSample("simple")} className="rounded-full bg-[#252525] px-2.5 py-1 text-[11px] font-medium text-[#aaa] ring-1 ring-white/5 hover:bg-[#333] hover:text-white">Simple</button>
              </div>
              <textarea
                value={sqlText}
                onChange={(e) => setSqlText(e.target.value)}
                placeholder={`CREATE TABLE users (
  id uuid PRIMARY KEY,
  email varchar(255) NOT NULL
);

CREATE TABLE posts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL
);`}
                rows={8}
                className="mb-2 max-h-64 w-full resize-y rounded-lg border border-[#333] bg-[#0f0f0f] px-3 py-2 font-mono text-xs leading-relaxed text-white placeholder-[#555] outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-2"
              />
              {sqlError ? (
                <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                  <p className="whitespace-pre-wrap break-words text-xs leading-relaxed text-amber-300">{sqlError}</p>
                </div>
              ) : sqlText.trim() ? (
                <div className="mb-3 flex items-center justify-between rounded-lg border border-emerald-500/10 bg-emerald-500/5 px-3 py-2">
                  <span className="text-xs text-emerald-400">
                    Live — Tables: <strong className="text-emerald-300">{tableCount}</strong> · Relations: <strong className="text-emerald-300">{relCount}</strong>
                  </span>
                  <button onClick={handleClearSql} className="text-[11px] text-emerald-300/70 hover:text-emerald-200">Clear</button>
                </div>
              ) : (
                <p className="mb-3 text-[11px] leading-relaxed text-[#666]">
                  Tip: Supabase → Database → Backups → Download schema, or <code className="rounded bg-[#252525] px-1 font-mono text-[10px]">pg_dump --schema-only</code>. Paste the <code className="font-mono">CREATE TABLE</code> block.
                </p>
              )}
              {sqlWarnings.length > 0 && !sqlError && (
                <p className="mb-2 text-[11px] text-[#666]">{sqlWarnings[0]}</p>
              )}
              {!sqlText.trim() && (
                <button onClick={() => loadSample("ecommerce")} className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500">
                  Load E-commerce example →
                </button>
              )}
            </>
          ) : (
            <>
              <h3 className="mb-1 text-sm font-medium text-white">
                Connect your PostgreSQL database
              </h3>
              <p className="mb-3 text-xs text-[#888]">
                Paste your connection string to visualize your live schema.
              </p>
              <input
                type="text"
                value={connectionString}
                onChange={(e) => setConnectionString(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="postgresql://user:pass@host:5432/dbname"
                className="mb-3 w-full rounded-lg border border-[#333] bg-[#252525] px-3 py-2 text-xs text-white placeholder-[#555] outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-2"
              />

              {showLocalhostWarning && (
                <div className="mb-3 flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
                  <svg
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs font-medium text-amber-400">
                      Local database detected
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-300/70">
                      Local databases only work when running dbdiagramr locally.
                      For the hosted version, use a cloud database like Supabase,
                      Neon, or Railway.
                    </p>
                  </div>
                </div>
              )}

              {isLiveSite && !showLocalhostWarning && (
                <p className="mb-3 text-[10px] leading-relaxed text-[#666]">
                  Tip: On Vercel/Netlify use your DB&apos;s <span className="font-medium text-[#888]">Transaction pooler (port 6543)</span> — not direct 5432. More secure &amp; avoids ENOTFOUND.
                </p>
              )}

              <button
                onClick={handleGenerateConnection}
                disabled={!connectionString.trim() || showLocalhostWarning}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Generate Diagram
              </button>
            </>
          )}
        </div>
      ) : null}

      {phase === "loading" && mode === "connection" && (
        <div className="flex items-center justify-center gap-3 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#333] border-t-indigo-500" />
          <span className="text-xs text-[#888]">Analyzing schema...</span>
        </div>
      )}

      {phase === "error" && mode === "connection" && (
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500/10">
              <svg className="h-3.5 w-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-sm font-medium text-white">Connection failed</span>
          </div>
          <p className="mb-3 whitespace-pre-wrap break-words text-xs text-[#888]">{errorMsg}</p>
          {errorHint === "pooler" && (
            <div className="mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
              <p className="text-xs font-medium text-amber-400">Try the Transaction pooler (port 6543)</p>
              <p className="mt-1 text-[11px] leading-relaxed text-amber-300/70">
                Supabase/Neon direct connections often fail from serverless (Vercel). In your DB dashboard: Connect → Transaction pooler → copy the 6543 string and paste it here. Or paste your SQL in the other tab — no credentials needed.
              </p>
            </div>
          )}
          <button
            onClick={handleNewConnection}
            className="w-full rounded-lg bg-[#333] px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-[#444]"
          >
            Try Again
          </button>
        </div>
      )}

      {phase === "result" && mode === "connection" && (
        <div className="p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-white">Connected</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
              Live
            </span>
          </div>
          <div className="mb-3 flex gap-3 text-xs text-[#888]">
            <span>
              Tables: <strong className="text-[#ccc]">{tableCount}</strong>
            </span>
            <span>
              Relations: <strong className="text-[#ccc]">{relCount}</strong>
            </span>
          </div>
          <button
            onClick={handleNewConnection}
            className="w-full rounded-lg border border-[#333] px-4 py-2 text-xs font-medium text-[#ccc] transition-colors hover:border-[#555] hover:text-white"
          >
            New Connection
          </button>
        </div>
      )}
    </div>
  );
}
