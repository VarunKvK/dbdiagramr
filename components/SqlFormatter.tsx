"use client";

import { useMemo, useRef, useState } from "react";
import { formatDialect, postgresql } from "sql-formatter";
import { ECOMMERCE_SQL } from "@/lib/sql/pgDumpSamples";

type KeywordCase = "preserve" | "upper" | "lower";

const MESSY_SAMPLE = `select u.email, count(p.id) as post_count from users u left join posts p on p.user_id = u.id where u.created_at > now() - interval '30 days' and p.published = true group by u.email order by post_count desc limit 20;`;

export default function SqlFormatter() {
  const [input, setInput] = useState("");
  const [keywordCase, setKeywordCase] = useState<KeywordCase>("upper");
  const [tabWidth, setTabWidth] = useState(2);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { output, error } = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null };
    try {
      return {
        output: formatDialect(input, {
          dialect: postgresql,
          keywordCase,
          tabWidth,
        }),
        error: null as string | null,
      };
    } catch (err: unknown) {
      return {
        output: "",
        error: err instanceof Error ? err.message : "Could not format this SQL",
      };
    }
  }, [input, keywordCase, tabWidth]);

  const hasCreateTable = /create\s+table/i.test(input);
  const lineCount = output ? output.split("\n").length : 0;

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadSql() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.sql";
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setInput(String(reader.result ?? ""));
    reader.readAsText(file);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-muted">Keywords:</span>
          {(["upper", "lower", "preserve"] as KeywordCase[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKeywordCase(k)}
              aria-pressed={keywordCase === k}
              className={`rounded-full px-3 py-1.5 font-mono text-xs font-medium transition-colors ${keywordCase === k ? "bg-ink text-white" : "bg-cream text-muted hover:text-ink"}`}
            >
              {k === "upper" ? "UPPER" : k === "lower" ? "lower" : "Preserve"}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-muted">Indent:</span>
          {[2, 4].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setTabWidth(w)}
              aria-pressed={tabWidth === w}
              className={`rounded-full px-3 py-1.5 font-mono text-xs font-medium transition-colors ${tabWidth === w ? "bg-ink text-white" : "bg-cream text-muted hover:text-ink"}`}
            >
              {w} spaces
            </button>
          ))}
        </div>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => setInput(MESSY_SAMPLE)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Try a messy query
          </button>
          <button
            type="button"
            onClick={() => setInput(ECOMMERCE_SQL)}
            className="rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Try schema SQL
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFile(e.dataTransfer.files?.[0]);
          }}
          className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-colors ${isDragging ? "ring-2 ring-indigo-500" : "ring-black/5"}`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">
              input.sql
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                Upload file
              </button>
              {input && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="text-xs font-medium text-muted hover:text-ink"
                >
                  Clear
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".sql,.txt"
              className="hidden"
              onChange={(e) => handleFile(e.target.files?.[0])}
            />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="-- Paste messy SQL here (SELECTs, CREATE TABLEs, anything Postgres)…"
            spellCheck={false}
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-sm leading-relaxed text-ink outline-none placeholder:text-muted/60"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-[#333] px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-[#999]">
              formatted.sql{lineCount > 0 && ` · ${lineCount} lines`}
            </span>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={copyOutput}
                disabled={!output}
                className="text-xs font-medium text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                onClick={downloadSql}
                disabled={!output}
                className="text-xs font-medium text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
              >
                Download
              </button>
            </div>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {error ? (
              <p className="font-mono text-sm leading-relaxed text-red-400">
                {error}
              </p>
            ) : output ? (
              <pre className="font-mono text-sm leading-relaxed text-[#e5e5e5]">
                {output}
              </pre>
            ) : (
              <p className="font-mono text-sm text-[#666]">
                Formatted SQL appears here…
              </p>
            )}
          </div>
        </div>
      </div>

      {hasCreateTable && output && (
        <div className="mt-4 rounded-xl bg-indigo-50 p-5 ring-1 ring-indigo-200">
          <span className="text-sm text-indigo-900">
            This looks like schema SQL — want to see it as a diagram or check
            its health?{" "}
          </span>
          <a
            href="/visualize"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Visualize it →
          </a>{" "}
          <a
            href="/database-schema-analyzer"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Analyze it →
          </a>
        </div>
      )}
    </div>
  );
}
