"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";

type Phase = "form" | "loading" | "result" | "error";

interface TryModalProps {
  onSchemaGenerated: (schema: Schema) => void;
  onSchemaCleared: () => void;
}

export default function TryModal({ onSchemaGenerated, onSchemaCleared }: TryModalProps) {
  const [connectionString, setConnectionString] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [tableCount, setTableCount] = useState(0);
  const [relCount, setRelCount] = useState(0);
  const [isLiveSite, setIsLiveSite] = useState(false);

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

  async function handleGenerate() {
    if (!connectionString.trim() || showLocalhostWarning) return;
    setPhase("loading");
    setErrorMsg("");
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
          toast.error("Localhost won't work here", {
            description:
              "You're on the hosted version of dbdiagramr, so \"localhost\" points to this server, not your computer.\n\nTo visualize your local database, run dbdiagramr locally (git clone + npm run dev) or use a cloud database like Supabase, Neon, or Railway.",
          });
        }
        if (data.dnsError) {
          toast.error("Database not found", {
            description:
              "We couldn't find that database — the hostname doesn't seem to exist.\n\nThis often happens when:\n• The database is paused (Supabase free tier pauses after 7 days of inactivity)\n• The hostname has a typo\n• The server uses IPv6 and your hosting platform needs the connection pooler (port 6543)\n\nCheck your connection string and try again.",
          });
        }
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
    if (e.key === "Enter" && phase === "form") handleGenerate();
  }

  function handleNewConnection() {
    setPhase("form");
    onSchemaCleared();
  }

  return (
    <div className="w-80 rounded-xl border border-white/10 bg-[#1a1a1a]/95 shadow-2xl backdrop-blur-sm">
      {phase === "form" && (
        <div className="p-4">
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
            <p className="mb-3 text-[10px] text-[#666]">
              Tip: If connecting from Vercel, Netlify, or other serverless
              platforms, use your database&apos;s connection pooler (port 6543)
              instead of the direct connection.
            </p>
          )}

          <button
            onClick={handleGenerate}
            disabled={!connectionString.trim() || showLocalhostWarning}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Generate Diagram
          </button>
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
          <p className="mb-3 text-xs text-[#888]">{errorMsg}</p>
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
