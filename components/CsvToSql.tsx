"use client";

import { useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import {
  emitCreateTable,
  emitInserts,
  inferColumns,
  inferStringValueType,
  isUniqueColumn,
  sanitizeIdent,
  type InferredColumn,
} from "@/lib/sql/inferTypes";
import { goVisualizeWithSql } from "@/lib/preload";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const SAMPLE = `id,name,email,signup_date,is_active,score
1,Ada Lovelace,ada@example.com,2024-01-15,true,98.5
2,Grace Hopper,grace@example.com,2024-02-20,true,87
3,Alan Turing,,2024-03-10,false,92.25`;

function ActionRow({
  disabled,
  onCopy,
  copied,
  onVisualize,
  onDownload,
}: {
  disabled: boolean;
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
        disabled={disabled}
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

export default function CsvToSql() {
  const [input, setInput] = useState(SAMPLE);
  const [tableName, setTableName] = useState("imported");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const debouncedInput = useDebouncedValue(input);

  const result = useMemo(() => {
    if (!debouncedInput.trim()) return { sql: "", error: null as string | null, cols: [] as InferredColumn[], rowCount: 0 };
    try {
      const parsed = Papa.parse<Record<string, string>>(debouncedInput, {
        header: true,
        skipEmptyLines: "greedy",
      });
      if (parsed.errors.length > 0 && parsed.data.length === 0) {
        return { sql: "", error: parsed.errors[0].message, cols: [], rowCount: 0 };
      }
      const fields = parsed.meta.fields ?? [];
      if (fields.length === 0) {
        return { sql: "", error: "No header row found. The first row must contain column names.", cols: [], rowCount: 0 };
      }
      const rows = parsed.data.filter((r) =>
        fields.some((f) => r[f] !== undefined && String(r[f]).trim() !== "")
      );
      if (rows.length === 0) return { sql: "", error: "No data rows found.", cols: [], rowCount: 0 };
      const table = sanitizeIdent(tableName, "imported");
      const cols = inferColumns(rows, fields, (r, f) => r[f], (v) =>
        inferStringValueType(String(v ?? ""))
      );
      const uniqueFirst = isUniqueColumn(rows, (r) => r[fields[0]]);
      const create = emitCreateTable(table, cols, { primaryKey: uniqueFirst });
      const inserts = emitInserts(
        table,
        cols,
        rows.slice(0, 1000),
        (r, key) => r[key],
        fields
      );
      const truncated = rows.length > 1000 ? `\n-- (${rows.length - 1000} more rows omitted; split large files before importing)\n` : "";
      return {
        sql: `${create}\n\n${inserts}${truncated}`,
        error: null as string | null,
        cols,
        rowCount: rows.length,
      };
    } catch (err: unknown) {
      return {
        sql: "",
        error: err instanceof Error ? err.message : "Could not parse this CSV",
        cols: [] as InferredColumn[],
        rowCount: 0,
      };
    }
  }, [debouncedInput, tableName]);

  async function copyOutput() {
    if (!result.sql) return;
    await navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadSql() {
    if (!result.sql) return;
    const blob = new Blob([result.sql], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizeIdent(tableName, "imported")}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setInput(String(reader.result ?? ""));
      const base = file.name.replace(/\.[^.]+$/, "");
      if (base) setTableName(sanitizeIdent(base, "imported"));
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-muted">Table name:</span>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            spellCheck={false}
            className="w-44 rounded-[10px] border border-border bg-white px-3 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] rounded-[10px] border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Upload CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE);
              setTableName("imported");
            }}
            className="min-h-[44px] rounded-[10px] border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Reset sample
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.txt"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
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
              input.csv{result.rowCount > 0 && ` · ${result.rowCount} rows`}
            </span>
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
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Paste CSV here (first row = headers), or drag-drop a file…"
            spellCheck={false}
            aria-label="CSV to convert"
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-white/50">
              output.sql
              {result.cols.length > 0 &&
                ` · ${result.cols.map((c) => `${c.name}: ${c.pgType}`).join(", ")}`}
            </span>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {result.error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-mono text-sm font-medium text-red-300">
                  Could not convert this CSV
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                  Make sure the first row holds column names and each row has
                  the same field count.
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-300/80">
                  {result.error}
                </p>
              </div>
            ) : result.sql ? (
              <div className="flex min-h-full">
                <div
                  aria-hidden="true"
                  className="w-9 shrink-0 select-none pr-3 text-right font-mono text-sm leading-relaxed text-white/60"
                >
                  {Array.from({ length: result.sql.split("\n").length }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                <pre className="min-w-0 flex-1 font-mono text-sm leading-relaxed text-white/85">
                  {result.sql}
                </pre>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-mono text-sm text-white/60">
                  Drop a CSV on the left and CREATE TABLE + INSERTs land here.
                </p>
                <p className="mt-1 font-mono text-xs text-white/60">
                  Your file never leaves the browser.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ActionRow
        disabled={!result.sql}
        onCopy={copyOutput}
        copied={copied}
        onVisualize={() => result.sql && goVisualizeWithSql(result.sql)}
        onDownload={downloadSql}
      />
    </div>
  );
}
