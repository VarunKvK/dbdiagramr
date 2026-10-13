"use client";

import { useMemo, useState } from "react";
import {
  formatInsertValue,
  inferJsonValueType,
  sanitizeIdent,
  type InferredColumn,
} from "@/lib/sql/inferTypes";
import { goVisualizeWithSql } from "@/lib/preload";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const SAMPLE = `[
  {
    "id": 1,
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "is_active": true,
    "address": {
      "city": "London",
      "postcode": "W1A 1AA"
    },
    "orders": [
      { "order_id": "a1", "total": 49.99, "placed_at": "2024-01-15T10:00:00Z" },
      { "order_id": "a2", "total": 19.5, "placed_at": "2024-02-01T12:30:00Z" }
    ]
  },
  {
    "id": 2,
    "name": "Grace Hopper",
    "email": null,
    "is_active": true,
    "address": {
      "city": "New York",
      "postcode": "10001"
    },
    "orders": []
  }
]`;

type FlatTable = {
  name: string;
  cols: InferredColumn[];
  rows: Record<string, unknown>[];
  pkName: string;
  pkType: string;
};

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function mergeTypes(a: string, b: string): string {
  if (a === b) return a;
  if (a === "text" || b === "text") return "text";
  const numeric = new Set(["integer", "bigint", "double precision"]);
  if (numeric.has(a) && numeric.has(b)) {
    if (a === "double precision" || b === "double precision") return "double precision";
    if (a === "bigint" || b === "bigint") return "bigint";
    return "integer";
  }
  if ((a === "date" && b === "timestamptz") || (b === "date" && a === "timestamptz"))
    return "timestamptz";
  return "text";
}

/**
 * Flatten parsed JSON into relational tables. Nested objects and arrays of
 * objects become child tables with an FK back to the parent; arrays of
 * scalars collapse to jsonb.
 */
function flattenJson(root: unknown, rootName: string): FlatTable[] {
  const tables: FlatTable[] = [];
  const rows: Record<string, unknown>[] =
    Array.isArray(root) ? root.filter(isPlainObject) : isPlainObject(root) ? [root] : [];

  function build(
    tableName: string,
    objs: Record<string, unknown>[],
    parent: { table: string; pkName: string; pkType: string } | null
  ): void {
    // Collect scalar keys (stable order: first-seen)
    const keys: string[] = [];
    for (const o of objs) {
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (isPlainObject(v)) continue;
        if (Array.isArray(v) && v.length > 0 && v.every(isPlainObject)) continue;
        if (!keys.includes(k)) keys.push(k);
      }
    }
    // Infer scalar column types
    const typeOf = (key: string): { pgType: string; nullable: boolean } => {
      let t: string | null = null;
      let nullable = false;
      for (const o of objs) {
        const v = o[key];
        if (v === null || v === undefined) {
          nullable = true;
          continue;
        }
        if (Array.isArray(v)) {
          t = t === null ? "jsonb" : mergeTypes(t, "jsonb");
          continue;
        }
        const it = inferJsonValueType(v);
        t = t === null ? it : mergeTypes(t, it);
      }
      return { pgType: t ?? "text", nullable };
    };

    // Primary key: natural `id` when unique, else surrogate SERIAL
    const idKey = keys.find((k) => k.toLowerCase() === "id");
    let pkName = "id";
    let pkType = "SERIAL";
    let naturalPk = false;
    if (idKey) {
      const vals = objs
        .map((o) => o[idKey])
        .filter((v) => v !== null && v !== undefined);
      const uniq = new Set(vals.map((v) => String(v)));
      if (vals.length === objs.length && uniq.size === objs.length && vals.length > 0) {
        const it = inferJsonValueType(vals[0]);
        pkName = sanitizeIdent(idKey, "id");
        pkType = ["integer", "bigint", "text", "uuid"].includes(it) ? (it === "integer" ? "integer" : it === "bigint" ? "bigint" : it) : "text";
        naturalPk = true;
      }
    }

    const cols: InferredColumn[] = [];
    if (!naturalPk) cols.push({ name: "id", pgType: "SERIAL", nullable: false });
    for (const k of keys) {
      if (naturalPk && k === idKey) {
        cols.push({ name: pkName, pgType: pkType, nullable: false });
        continue;
      }
      if (!naturalPk && k.toLowerCase() === "id") {
        // keep the source field under a non-colliding name
        cols.push({ name: "source_id", pgType: typeOf(k).pgType, nullable: typeOf(k).nullable });
        continue;
      }
      const { pgType, nullable } = typeOf(k);
      cols.push({ name: sanitizeIdent(k, `column_${cols.length + 1}`), nullable, pgType });
    }
    if (parent) {
      cols.push({
        name: `${sanitizeIdent(parent.table, "parent")}_id`,
        pgType: parent.pkType === "SERIAL" ? "integer" : parent.pkType,
        nullable: false,
        fk: { referencesTable: parent.table, referencesColumn: parent.pkName },
      });
    }

    // Assign row ids + parent FK values
    const tableRows: Record<string, unknown>[] = objs.map((o, i) => {
      const row: Record<string, unknown> = {};
      const myId = naturalPk ? o[idKey!] : i + 1;
      row[pkName] = myId;
      for (const c of cols) {
        if (c.name === pkName) continue;
        if (parent && c.name === `${sanitizeIdent(parent.table, "parent")}_id`) continue; // set below
        const srcKey = keys.find((k) => sanitizeIdent(k, "") === c.name || (k.toLowerCase() === "id" && c.name === "source_id"));
        row[c.name] = srcKey ? o[srcKey] : undefined;
      }
      return { __src: o, __row: row, __id: myId } as unknown as Record<string, unknown>;
    });

    const table: FlatTable = { name: tableName, cols, rows: [], pkName, pkType: pkType === "SERIAL" ? "SERIAL" : pkType };
    tables.push(table);

    // Recurse into nested structures, then finalize rows with FK values
    const childJobs: { key: string; childName: string; childObjs: Record<string, unknown>[]; parentId: unknown }[] = [];
    tableRows.forEach((wrapper) => {
      const o = (wrapper as unknown as { __src: Record<string, unknown> }).__src;
      const myId = (wrapper as unknown as { __id: unknown }).__id;
      for (const k of Object.keys(o)) {
        const v = o[k];
        if (isPlainObject(v)) {
          childJobs.push({ key: k, childName: `${tableName}_${sanitizeIdent(k, "child")}`, childObjs: [v], parentId: myId });
        } else if (Array.isArray(v) && v.length > 0 && v.every(isPlainObject)) {
          childJobs.push({ key: k, childName: `${tableName}_${sanitizeIdent(k, "child")}`, childObjs: v as Record<string, unknown>[], parentId: myId });
        }
      }
    });
    // Group child jobs by table name (arrays across parents merge into one table)
    const grouped = new Map<string, { objs: Record<string, unknown>[]; parentIds: unknown[] }>();
    for (const j of childJobs) {
      const g = grouped.get(j.childName) ?? { objs: [], parentIds: [] };
      j.childObjs.forEach((o) => {
        g.objs.push(o);
        g.parentIds.push(j.parentId);
      });
      grouped.set(j.childName, g);
    }
    // NOTE: parent-FK cells stay unset here; they are stamped in matching
    // order right after the recursive build() call below.
    table.rows = tableRows.map((wrapper) => {
      const w = wrapper as unknown as { __row: Record<string, unknown> };
      return w.__row;
    });

    grouped.forEach((g, childName) => {
      const before = tables.length;
      build(childName, g.objs, { table: tableName, pkName, pkType: table.pkType });
      // stamp parent FK values onto the child rows just created (same order)
      const child = tables[before];
      const fk = `${sanitizeIdent(tableName, "parent")}_id`;
      child.rows.forEach((r, i) => {
        r[fk] = g.parentIds[i];
      });
    });
  }

  if (rows.length === 0) throw new Error("No objects found. Paste a JSON object or an array of objects.");
  build(sanitizeIdent(rootName, "root"), rows, null);
  return tables;
}

function emitTables(tables: FlatTable[]): string {
  const parts: string[] = [];
  for (const t of tables) {
    const lines = t.cols.map((c) => {
      const isPk = c.name === t.pkName;
      const pk = isPk ? " PRIMARY KEY" : "";
      const nn = !c.nullable || isPk ? " NOT NULL" : "";
      return `  ${c.name} ${c.pgType}${pk}${nn}`;
    });
    // FK constraints appended as table-level clauses
    parts.push(`CREATE TABLE ${t.name} (\n${lines.join(",\n")}\n);`);
  }
  // ALTER TABLE FKs (order-safe, only for columns flagged at build time)
  for (const t of tables) {
    for (const c of t.cols) {
      if (!c.fk) continue;
      parts.push(
        `ALTER TABLE ${t.name} ADD CONSTRAINT fk_${t.name}_${c.name} FOREIGN KEY (${c.name}) REFERENCES ${c.fk.referencesTable} (${c.fk.referencesColumn});`
      );
    }
  }
  return parts.join("\n");
}

function emitAllInserts(tables: FlatTable[], cap: number): { sql: string; truncated: boolean } {
  const parts: string[] = [];
  let count = 0;
  let truncated = false;
  for (const t of tables) {
    const colList = t.cols.map((c) => c.name).join(", ");
    const lines: string[] = [];
    for (const r of t.rows) {
      if (count >= cap) {
        truncated = true;
        break;
      }
      const vals = t.cols.map((c) => formatInsertValue(r[c.name], c.pgType));
      lines.push(`(${vals.join(", ")})`);
      count++;
    }
    if (lines.length > 0) {
      parts.push(`INSERT INTO ${t.name} (${colList}) VALUES\n${lines.join(",\n")};`);
    }
    if (truncated) break;
  }
  return { sql: parts.join("\n\n"), truncated };
}

export default function JsonToSql() {
  const [input, setInput] = useState(SAMPLE);
  const [tableName, setTableName] = useState("root");
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebouncedValue(input);

  const result = useMemo(() => {
    if (!debouncedInput.trim()) return { sql: "", error: null as string | null, summary: "" };
    if (debouncedInput.length > 500_000) {
      return { sql: "", error: "Input is over 500KB. Split the file and convert in parts.", summary: "" };
    }
    try {
      const parsed: unknown = JSON.parse(debouncedInput);
      const tables = flattenJson(parsed, sanitizeIdent(tableName, "root"));
      const ddl = emitTables(tables);
      const { sql: inserts, truncated } = emitAllInserts(tables, 1000);
      const summary = tables
        .map((t) => `${t.name} (${t.rows.length} rows)`)
        .join(" · ");
      return {
        sql: `${ddl}\n\n${inserts}${truncated ? "\n\n-- (INSERTs capped at 1000 rows; convert the remainder separately)\n" : ""}`,
        error: null as string | null,
        summary,
      };
    } catch (err: unknown) {
      return {
        sql: "",
        error: err instanceof Error ? err.message : "Could not parse this JSON",
        summary: "",
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
    a.download = `${sanitizeIdent(tableName, "root")}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 rounded-[20px] border border-border bg-white p-4 shadow-sm">
        <label className="flex items-center gap-2 text-sm">
          <span className="font-medium text-muted">Root table:</span>
          <input
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            spellCheck={false}
            className="w-44 rounded-[10px] border border-border bg-white px-3 py-1.5 font-mono text-sm text-ink outline-none focus:border-accent"
          />
        </label>
        <div className="ml-auto">
          <button
            type="button"
            onClick={() => {
              setInput(SAMPLE);
              setTableName("root");
            }}
            className="min-h-[44px] rounded-[10px] border border-border bg-white px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-ink"
          >
            Reset sample
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">input.json</span>
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
            placeholder="Paste a JSON object or array of objects…"
            spellCheck={false}
            aria-label="JSON to convert"
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-white/50">
              output.sql{result.summary && ` · ${result.summary}`}
            </span>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {result.error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-mono text-sm font-medium text-red-300">
                  Could not convert this JSON
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                  Paste a JSON object or an array of objects with consistent
                  keys.
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-300/80">
                  {result.error}
                </p>
              </div>
            ) : result.sql ? (
              <div className="flex min-h-full">
                <div
                  aria-hidden="true"
                  className="w-9 shrink-0 select-none pr-3 text-right font-mono text-sm leading-relaxed text-white/30"
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
                <p className="font-mono text-sm text-white/40">
                  Paste JSON on the left and CREATE TABLE + INSERTs land here.
                </p>
                <p className="mt-1 font-mono text-xs text-white/30">
                  Nested objects become linked child tables.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-cream/95 py-3 backdrop-blur-sm md:static md:bg-transparent md:p-0 md:pt-3">
        <button
          type="button"
          onClick={copyOutput}
          disabled={!result.sql}
          className="min-h-[44px] flex-1 rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft disabled:opacity-40 md:flex-none"
        >
          {copied ? "Copied!" : "Copy SQL"}
        </button>
        <button
          type="button"
          onClick={() => result.sql && goVisualizeWithSql(result.sql)}
          disabled={!result.sql}
          className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
        >
          Visualize this schema →
        </button>
        <button
          type="button"
          onClick={downloadSql}
          disabled={!result.sql}
          className="min-h-[44px] rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-muted shadow-sm transition-colors hover:text-ink disabled:opacity-40"
        >
          Download .sql
        </button>
      </div>
    </div>
  );
}