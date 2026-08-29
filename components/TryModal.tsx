"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";
import { MAGIC_QUERY } from "@/lib/magicQuery";

type Phase = "form" | "loading" | "result" | "error";
type Mode = "connection" | "query";

interface TryModalProps {
  onSchemaGenerated: (schema: Schema) => void;
  onSchemaCleared: () => void;
}

export default function TryModal({ onSchemaGenerated, onSchemaCleared }: TryModalProps) {
  const [mode, setMode] = useState<Mode>("connection");
  const [connectionString, setConnectionString] = useState("");
  const [queryJson, setQueryJson] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [tableCount, setTableCount] = useState(0);
  const [relCount, setRelCount] = useState(0);
  const [isLiveSite, setIsLiveSite] = useState(false);
  const [copied, setCopied] = useState(false);

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

  async function handleGenerateQuery() {
    if (!queryJson.trim()) return;
    setPhase("loading");
    setErrorMsg("");
    setErrorHint(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(queryJson.trim());
    } catch {
      setErrorMsg("Invalid JSON — make sure you copied the full JSON result (the 'schema' column). If you pasted the query itself, run it first in your SQL editor and paste the result.");
      setPhase("error");
      return;
    }
    try {
      const res = await fetch("/api/schema/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.details || data.error || "Invalid schema");
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

  function handleCopyQuery() {
    navigator.clipboard.writeText(MAGIC_QUERY).then(() => {
      setCopied(true);
      toast.success("Query copied", { description: "Paste it in your SQL editor and run it." });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="w-80 rounded-xl border border-white/10 bg-[#1a1a1a]/95 shadow-2xl backdrop-blur-sm">
      {phase === "form" && (
        <div className="p-4">
          {/* Tabs */}
          <div className="mb-3 flex rounded-lg bg-[#252525] p-0.5">
            <button
              onClick={() => setMode("connection")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "connection" ? "bg-[#333] text-white shadow" : "text-[#888] hover:text-[#ccc]"}`}
            >
              Connection string
            </button>
            <button
              onClick={() => setMode("query")}
              className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${mode === "query" ? "bg-[#333] text-white shadow" : "text-[#888] hover:text-[#ccc]"}`}
            >
              Paste query result
            </button>
          </div>

          {mode === "connection" ? (
            <>
              <h3 className="mb-1 text-sm font-medium text-white">
                Connect your PostgreSQL database
              </h3>
              <p className="mb-3 text-xs text-[#888]">
                Paste your connection string to visualize your schema.
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
              <button
                onClick={() => setMode("query")}
                className="mt-2 w-full text-center text-[11px] text-[#666] hover:text-[#888]"
              >
                Don&apos;t want to paste credentials? Use query mode →
              </button>
            </>
          ) : (
            <>
              <h3 className="mb-1 text-sm font-medium text-white">Paste query result — no credentials needed</h3>
              <p className="mb-3 text-xs leading-relaxed text-[#888]">
                Run the query below in your SQL editor, copy the single JSON value (the <code className="rounded bg-[#252525] px-1 py-0.5 font-mono text-[11px] text-[#aaa]">schema</code> column), and paste it here. No connection string leaves your machine.
              </p>
              <div className="mb-3 rounded-lg border border-[#333] bg-[#0f0f0f]">
                <div className="flex items-center justify-between border-b border-[#252525] px-3 py-2">
                  <span className="font-mono text-[11px] font-medium text-[#888]">magic query (Postgres)</span>
                  <button onClick={handleCopyQuery} className="rounded bg-[#252525] px-2 py-1 text-[11px] font-medium text-[#ccc] hover:bg-[#333] hover:text-white">
                    {copied ? "Copied ✓" : "Copy"}
                  </button>
                </div>
                <pre className="max-h-32 overflow-auto p-3 font-mono text-[10px] leading-relaxed text-[#aaa]">{MAGIC_QUERY}</pre>
              </div>
              <textarea
                value={queryJson}
                onChange={(e) => setQueryJson(e.target.value)}
                placeholder='Paste JSON here — e.g. {"tables": [{"name":"users","columns":[...]}]}'
                rows={4}
                className="mb-3 w-full rounded-lg border border-[#333] bg-[#252525] px-3 py-2 font-mono text-xs text-white placeholder-[#555] outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-2"
              />
              <button
                onClick={handleGenerateQuery}
                disabled={!queryJson.trim()}
                className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Visualize from JSON
              </button>
              <button onClick={() => setMode("connection")} className="mt-2 w-full text-center text-[11px] text-[#666] hover:text-[#888]">
                ← Back to connection string
              </button>
            </>
          )}
        </div>
      )}

      {phase === "loading" && (
        <div className="flex items-center justify-center gap-3 p-6">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#333] border-t-indigo-500" />
          <span className="text-xs text-[#888]">Analyzing schema...</span>
        </div>
      )}

      {phase === "error" && (
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
                Supabase/Neon direct connections often fail from serverless (Vercel). In your DB dashboard: Connect → Transaction pooler → copy the 6543 string and paste it here. Or use the “Paste query result” tab — no credentials needed.
              </p>
            </div>
          )}
          {mode === "query" && errorMsg.includes("pasted the query itself") && (
            <div className="mb-3 rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
              <p className="text-[11px] leading-relaxed text-indigo-300/80">You pasted the SQL query — run it first in your SQL editor, then copy the single JSON value from the <code className="rounded bg-[#252525] px-1 font-mono text-[10px]">schema</code> column and paste that JSON here.</p>
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

      {phase === "result" && (
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
