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
        className="min-h-[44px] flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-black/5 transition-colors hover:bg-indigo-50 disabled:opacity-40 md:flex-none"
      >
        {copied ? "Copied!" : "Copy SQL"}
      </button>
      <button
        type="button"
        onClick={onVisualize}
        disabled={disabled}
        className="min-h-[44px] flex-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-40 md:flex-none"
      >
        Visualize this schema →
      </button>
      <button
        type="button"
        onClick={onDownload}
        disabled={disabled}
        className="min-h-[44px] rounded-lg bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm ring-1 ring-black/5 transition-colors hover:text-ink disabled:opacity-40"
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

  const result = useMemo(() => {
    if (!input.trim()) return { sql: "", error: null as string | null, cols: [] as InferredColumn[], rowCount: 0 };
    try {
      const parsed = Papa.parse<Record<string, string>>(input, {
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
  }, [input, tableName]);

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
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-muted">Table name:</span>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            spellCheck={false}
            className="w-44 rounded-lg border border-border bg-white px-3 py-1.5 font-mono text-sm text-ink outline-none focus:border-indigo-400"
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="min-h-[44px] rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Upload CSV
          </button>
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE);
              setTableName("imported");
            }}
            className="min-h-[44px] rounded-lg border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
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
          className={`overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition-colors ${isDragging ? "ring-2 ring-indigo-500" : "ring-black/5"}`}
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
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-[#333] px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-[#999]">
              output.sql
              {result.cols.length > 0 &&
                ` · ${result.cols.map((c) => `${c.name}: ${c.pgType}`).join(", ")}`}
            </span>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {result.error ? (
              <p className="font-mono text-sm leading-relaxed text-red-400">
                {result.error}
              </p>
            ) : result.sql ? (
              <pre className="font-mono text-sm leading-relaxed text-[#e5e5e5]">
                {result.sql}
              </pre>
            ) : (
              <p className="font-mono text-sm text-[#666]">
                CREATE TABLE + INSERTs appear here…
              </p>
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
