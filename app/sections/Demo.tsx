"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";

const SAMPLE_SCHEMA: Schema = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "name", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "email", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "YES", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [],
    },
    {
      name: "posts",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "user_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "title", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "body", type: "text", nullable: "YES", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "YES", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [{ column: "user_id", referencesTable: "users", referencesColumn: "id" }],
    },
    {
      name: "tags",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "name", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [],
    },
    {
      name: "comments",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "post_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "user_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "content", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ],
    },
    {
      name: "post_tags",
      columns: [
        { name: "post_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "tag_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "tag_id", referencesTable: "tags", referencesColumn: "id" },
      ],
    },
  ],
};

/* ─── Main Demo Component ─── */
type Phase = "form" | "loading" | "result" | "error";
type Tab = "sample" | "connect";

export default function Demo() {
  const [tab, setTab] = useState<Tab>("sample");
  const [connectionString, setConnectionString] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [schema, setSchema] = useState<Schema | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [visible, setVisible] = useState(false);
  const [isLiveSite, setIsLiveSite] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (tab === "sample") {
      setSchema(SAMPLE_SCHEMA);
      setPhase("result");
    } else {
      setSchema(null);
      setPhase("form");
    }
  }, [tab]);

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
          toast.error("Localhost detected", {
            description:
              "This app is running on a remote server, so localhost refers to the server itself, not your machine.\n\nTo visualize your local database, deploy this app locally (clone + npm run dev), use a cloud database like Supabase or Neon, or expose your local DB via ngrok / Cloudflare Tunnel.",
            duration: 8000,
          });
        }
        if (data.dnsError) {
          toast.error("DNS resolution failed", {
            description:
              "The database hostname could not be resolved. This can happen with IPv6 addresses on some serverless platforms.\n\nTry using your database's connection pooler (port 6543) instead of the direct connection, or check that the hostname is correct.",
            duration: 10000,
          });
        }
        throw new Error(data.details || data.error || "API error");
      }
      setSchema(data);
      setPhase("result");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      setPhase("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && phase === "form") handleGenerate();
  }

  function downloadSVG() {
    const svg = document.querySelector("#diagram-svg svg");
    if (!svg) return;
    const blob = new Blob([svg.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema-diagram.svg";
    a.click();
    URL.revokeObjectURL(url);
  }

  const tableCount = schema?.tables.length ?? 0;
  const relCount =
    schema?.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0) ?? 0;

  return (
    <section id="demo" ref={sectionRef} className="bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Interactive Preview
          </span>
        </div>
        <h2 className="mb-6 text-center text-3xl font-medium text-[#1a1a1a] md:text-4xl">
          See your database, visually
        </h2>
        <p className="mx-auto mb-16 max-w-lg text-center text-[#737373]">
          Hover tables to trace relationships. Switch to the{" "}
          <strong>Your Database</strong> tab to connect your own PostgreSQL
          instance.
        </p>

        <div
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Window chrome */}
          <div className="flex h-10 items-center justify-between bg-[#252525] px-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            </div>
            <div className="flex items-center gap-1 rounded-lg bg-[#1a1a1a] p-1">
              <button
                onClick={() => setTab("sample")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  tab === "sample"
                    ? "bg-[#333] text-white"
                    : "text-[#888] hover:text-[#ccc]"
                }`}
              >
                Sample Schema
              </button>
              <button
                onClick={() => setTab("connect")}
                className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                  tab === "connect"
                    ? "bg-[#333] text-white"
                    : "text-[#888] hover:text-[#ccc]"
                }`}
              >
                Your Database
              </button>
            </div>
            <div className="w-16" />
          </div>

          {/* Content */}
          <div className="relative min-h-[360px]">
            {tab === "connect" && phase === "form" && (
              <div className="flex flex-col items-center justify-center px-8 py-20">
                <div className="mb-6 text-center">
                  <h3 className="mb-2 text-lg font-medium text-white">
                    Connect your PostgreSQL database
                  </h3>
                  <p className="text-sm text-[#888]">
                    Paste your connection string below. We never store it.
                  </p>
                </div>
                <div className="flex w-full max-w-lg flex-col gap-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={connectionString}
                      onChange={(e) => setConnectionString(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="postgresql://user:pass@host:5432/dbname"
                      className="flex-1 rounded-lg border border-[#333] bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder-[#555] outline-none ring-indigo-500/20 transition-all focus:border-indigo-500 focus:ring-2"
                    />
                    <button
                      onClick={handleGenerate}
                      disabled={!connectionString.trim() || showLocalhostWarning}
                      className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Generate
                    </button>
                  </div>
                  {showLocalhostWarning && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2">
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
                    <p className="text-[10px] text-[#666]">
                      Tip: If connecting from Vercel, Netlify, or other serverless
                      platforms, use your database&apos;s connection pooler (port 6543)
                      instead of the direct connection.
                    </p>
                  )}
                </div>
                <p className="mt-4 text-xs text-[#555]">
                  Example: postgresql://postgres:secret@localhost:5432/mydb
                </p>
              </div>
            )}

            {phase === "loading" && (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="mb-4 h-8 w-8 animate-spin rounded-full border-2 border-[#333] border-t-indigo-500" />
                <p className="text-sm text-[#888]">Analyzing schema...</p>
              </div>
            )}

            {phase === "error" && (
              <div className="flex flex-col items-center justify-center px-8 py-20">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10">
                  <svg
                    className="h-6 w-6 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium text-white">
                  Connection failed
                </h3>
                <p className="mb-6 max-w-md text-center text-sm text-[#888]">
                  {errorMsg}
                </p>
                <button
                  onClick={() => setPhase("form")}
                  className="rounded-lg bg-[#333] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#444]"
                >
                  Try Again
                </button>
              </div>
            )}

            {phase === "result" && schema && (
              <>
                <div
                  id="diagram-svg"
                  className="overflow-hidden"
                >
                  <SchemaDiagram schema={schema} />
                </div>

                {/* Footer bar */}
                <div className="flex items-center justify-between border-t border-[#252525] bg-[#1a1a1a] px-6 py-3">
                  <div className="flex items-center gap-4 text-xs text-[#888]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      {tableCount} table{tableCount !== 1 ? "s" : ""}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#6366f1]" />
                      {relCount} relation{relCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <button
                    onClick={downloadSVG}
                    className="flex items-center gap-2 rounded-lg bg-[#252525] px-3 py-1.5 text-xs font-medium text-[#ccc] transition-colors hover:bg-[#333] hover:text-white"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                    Download SVG
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}