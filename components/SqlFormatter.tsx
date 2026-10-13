"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { formatDialect, postgresql } from "sql-formatter";
import { ECOMMERCE_SQL } from "@/lib/sql/pgDumpSamples";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { goVisualizeWithSql } from "@/lib/preload";
import { MetaPill } from "@/components/ui/pills";

type KeywordCase = "preserve" | "upper" | "lower";

const MESSY_SAMPLE = `select u.email, count(p.id) as post_count from users u left join posts p on p.user_id = u.id where u.created_at > now() - interval '30 days' and p.published = true group by u.email order by post_count desc limit 20;`;

const CASE_KEY = "dbdiagramr:fmt-keyword-case";
const INDENT_KEY = "dbdiagramr:fmt-tab-width";
const DEBOUNCE_MS = 200;

function loadCase(): KeywordCase {
  try {
    const v = window.localStorage.getItem(CASE_KEY);
    return v === "upper" || v === "lower" || v === "preserve" ? v : "upper";
  } catch {
    return "upper";
  }
}

function loadIndent(): number {
  try {
    const v = window.localStorage.getItem(INDENT_KEY);
    return v === "4" ? 4 : 2;
  } catch {
    return 2;
  }
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted">{label}:</span>
      <div
        role="group"
        aria-label={label}
        className="flex gap-1 rounded-[10px] border border-border bg-surface p-1"
      >
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={value === o.value}
            className={`rounded-[10px] px-4 py-2 font-mono text-xs font-medium transition-colors ${
              value === o.value
                ? "bg-ink text-white"
                : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function ActionRow({
  disabled,
  visualizable,
  onCopy,
  copied,
  onVisualize,
  onDownload,
}: {
  disabled: boolean;
  visualizable: boolean;
  onCopy: () => void;
  copied: boolean;
  onVisualize: () => void;
  onDownload: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-cream/95 py-3 backdrop-blur-sm md:static md:bg-transparent md:p-0 md:pt-3">
      <button
        type="button"
        onClick={onCopy}
        disabled={disabled}
        className="min-h-[44px] flex-1 rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft disabled:opacity-40 md:flex-none"
      >
        {copied ? "Copied!" : "Copy SQL"}
      </button>
      <button
        type="button"
        onClick={onVisualize}
        disabled={disabled || !visualizable}
        title={
          visualizable
            ? "Open the formatted schema as an ER diagram"
            : "Formatting a CREATE TABLE shows this button"
        }
        className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
      >
        Visualize this schema →
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className="min-h-[44px] rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm transition-colors hover:text-ink disabled:opacity-40"
      >
        Download .sql
      </button>
    </div>
  );
}

export default function SqlFormatter() {
  const [input, setInput] = useState(MESSY_SAMPLE);
  const [debounced, setDebounced] = useState(MESSY_SAMPLE);
  const [keywordCase, setKeywordCase] = useState<KeywordCase>(loadCase);
  const [tabWidth, setTabWidth] = useState<number>(loadIndent);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(input), DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [input]);

  useEffect(() => {
    try {
      window.localStorage.setItem(CASE_KEY, keywordCase);
    } catch {
      /* private mode */
    }
  }, [keywordCase]);

  useEffect(() => {
    try {
      window.localStorage.setItem(INDENT_KEY, String(tabWidth));
    } catch {
      /* private mode */
    }
  }, [tabWidth]);

  const { output, error, errorLine, errorColumn } = useMemo(() => {
    if (!debounced.trim())
      return {
        output: "",
        error: null as string | null,
        errorLine: null as number | null,
        errorColumn: null as number | null,
      };
    try {
      return {
        output: formatDialect(debounced, {
          dialect: postgresql,
          keywordCase,
          tabWidth,
        }),
        error: null as string | null,
        errorLine: null as number | null,
        errorColumn: null as number | null,
      };
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Could not format this SQL";
      const m = message.match(/line (\d+).*?column (\d+)/i);
      return {
        output: "",
        error: message,
        errorLine: m ? Number(m[1]) : null,
        errorColumn: m ? Number(m[2]) : null,
      };
    }
  }, [debounced, keywordCase, tabWidth]);

  const visualizable = useMemo(() => {
    if (!output) return false;
    try {
      return parseSqlToSchema(output).schema.tables.length > 0;
    } catch {
      return false;
    }
  }, [output]);

  const inputLines = debounced.trim() ? debounced.split("\n").length : 0;
  const outputLines = output ? output.split("\n").length : 0;
  const alreadyFormatted =
    !!output && !!debounced.trim() && output.trim() === debounced.trim();

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
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3 rounded-[20px] border border-border bg-white p-4 shadow-sm">
        <Segmented<KeywordCase>
          label="Keywords"
          value={keywordCase}
          onChange={setKeywordCase}
          options={[
            { value: "upper", label: "UPPER" },
            { value: "lower", label: "lower" },
            { value: "preserve", label: "Preserve" },
          ]}
        />
        <Segmented<number>
          label="Indent"
          value={tabWidth}
          onChange={setTabWidth}
          options={[
            { value: 2, label: "2 spaces" },
            { value: 4, label: "4 spaces" },
          ]}
        />
        <MetaPill>PostgreSQL</MetaPill>
        <div className="ml-auto flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setInput(MESSY_SAMPLE)}
            aria-pressed={input === MESSY_SAMPLE}
            className={`min-h-[44px] rounded-[20px] border border-accent px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
              input === MESSY_SAMPLE
                ? "bg-accent text-white"
                : "text-accent hover:bg-accent-soft"
            }`}
          >
            messy.sql
          </button>
          <button
            type="button"
            onClick={() => setInput(ECOMMERCE_SQL)}
            aria-pressed={input === ECOMMERCE_SQL}
            className={`min-h-[44px] rounded-[20px] border border-accent px-3 py-1.5 font-mono text-xs font-medium transition-colors ${
              input === ECOMMERCE_SQL
                ? "bg-accent text-white"
                : "text-accent hover:bg-accent-soft"
            }`}
          >
            schema.sql
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
          className={`overflow-hidden rounded-[20px] border border-border bg-white shadow-sm transition-colors ${isDragging ? "border-accent ring-2 ring-accent/40" : ""}`}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">
              input.sql{inputLines > 0 && ` · ${inputLines} ${inputLines === 1 ? "line" : "lines"}`}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-medium text-accent hover:text-accent-hover"
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
            aria-label="SQL to format"
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-white/50">
              formatted.sql
              {outputLines > 0 &&
                ` · ${inputLines} → ${outputLines} ${outputLines === 1 ? "line" : "lines"}`}
            </span>
            {alreadyFormatted && (
              <span className="rounded-[20px] border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 font-mono text-xs font-medium text-emerald-300">
                Already formatted
              </span>
            )}
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-mono text-sm font-medium text-red-300">
                  Could not format this SQL
                  {errorLine !== null &&
                    errorColumn !== null &&
                    ` · line ${errorLine}, column ${errorColumn}`}
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                  Check for unbalanced quotes or parentheses, then try again.
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-300/80">
                  {error}
                </p>
              </div>
            ) : output ? (
              <div className="flex min-h-full">
                <div
                  aria-hidden="true"
                  className="w-9 shrink-0 select-none pr-3 text-right font-mono text-sm leading-relaxed text-white/30"
                >
                  {Array.from({ length: outputLines }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                <pre className="min-w-0 flex-1 font-mono text-sm leading-relaxed text-white/85">
                  {output}
                </pre>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-mono text-sm text-white/40">
                  Paste SQL on the left and the formatted version lands here.
                </p>
                <p className="mt-1 font-mono text-xs text-white/30">
                  Or drop a .sql file onto the input panel.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActionRow
        disabled={!output}
        visualizable={visualizable}
        onCopy={copyOutput}
        copied={copied}
        onVisualize={() => output && goVisualizeWithSql(output)}
        onDownload={downloadSql}
      />
    </div>
  );
}
