"use client";

import { useMemo, useState } from "react";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { parseDbmlToSchema } from "@/lib/sql/parseDbml";
import { schemaToDbml } from "@/lib/sql/emitDbml";
import { schemaToSql } from "@/lib/schemaExport";
import { goVisualizeWithSql } from "@/lib/preload";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

type Direction = "sql-to-dbml" | "dbml-to-sql";

const SQL_SAMPLE = `CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL,
  published boolean NOT NULL DEFAULT false
);`;

const DBML_SAMPLE = `Table users {
  id uuid [pk, default: \`gen_random_uuid()\`]
  email text [not null, unique]
  name text
  created_at timestamptz [not null, default: \`now()\`]
}

Table posts {
  id uuid [pk, default: \`gen_random_uuid()\`]
  author_id uuid [not null]
  title text [not null]
  published boolean [not null, default: false]
}

Ref: posts.author_id > users.id`;

export default function DbmlConverter() {
  const [direction, setDirection] = useState<Direction>("sql-to-dbml");
  const [sqlInput, setSqlInput] = useState(SQL_SAMPLE);
  const [dbmlInput, setDbmlInput] = useState(DBML_SAMPLE);
  const [copied, setCopied] = useState(false);

  const input = direction === "sql-to-dbml" ? sqlInput : dbmlInput;
  const setInput = direction === "sql-to-dbml" ? setSqlInput : setDbmlInput;
  const debouncedInput = useDebouncedValue(input);

  const result = useMemo(() => {
    if (!debouncedInput.trim()) return { output: "", error: null as string | null, tableCount: 0 };
    try {
      if (direction === "sql-to-dbml") {
        const { schema } = parseSqlToSchema(debouncedInput);
        return { output: schemaToDbml(schema), error: null as string | null, tableCount: schema.tables.length };
      }
      const { schema } = parseDbmlToSchema(debouncedInput);
      return { output: schemaToSql(schema), error: null as string | null, tableCount: schema.tables.length };
    } catch (err: unknown) {
      return {
        output: "",
        error: err instanceof Error ? err.message : "Could not convert this input",
        tableCount: 0,
      };
    }
  }, [debouncedInput, direction]);

  async function copyOutput() {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const leftLabel = direction === "sql-to-dbml" ? "schema.sql" : "schema.dbml";
  const rightLabel = direction === "sql-to-dbml" ? "schema.dbml" : "schema.sql";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-border bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-muted">Direction:</span>
        <div role="group" aria-label="Direction" className="flex gap-1 rounded-[10px] border border-border bg-surface p-1">
          {(
            [
              ["sql-to-dbml", "SQL → DBML"],
              ["dbml-to-sql", "DBML → SQL"],
            ] as [Direction, string][]
          ).map(([d, label]) => (
            <button
              key={d}
              type="button"
              onClick={() => setDirection(d)}
              aria-pressed={direction === d}
              className={`rounded-[10px] px-4 py-2 font-mono text-xs font-medium transition-colors ${direction === d ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">
              {leftLabel}{input.trim() && ` · ${input.split("\n").length} ${input.split("\n").length === 1 ? "line" : "lines"}`}
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
            placeholder={direction === "sql-to-dbml" ? "Paste CREATE TABLE statements…" : "Paste DBML (Table blocks + Refs)…"}
            spellCheck={false}
            aria-label={direction === "sql-to-dbml" ? "SQL schema to convert to DBML" : "DBML to convert to SQL"}
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-white/50">
              {rightLabel}{result.tableCount > 0 && ` · ${result.tableCount} tables`}
            </span>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {result.error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-mono text-sm font-medium text-red-300">
                  Could not convert this input
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                  Check the syntax for the active direction, then try again.
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-300/80">
                  {result.error}
                </p>
              </div>
            ) : result.output ? (
              <div className="flex min-h-full">
                <div
                  aria-hidden="true"
                  className="w-9 shrink-0 select-none pr-3 text-right font-mono text-sm leading-relaxed text-white/30"
                >
                  {Array.from({ length: result.output.split("\n").length }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                <pre className="min-w-0 flex-1 font-mono text-sm leading-relaxed text-white/85">{result.output}</pre>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <p className="font-mono text-sm text-white/40">
                  Paste input on the left and the converted output lands here.
                </p>
                <p className="mt-1 font-mono text-xs text-white/30">
                  Switch direction above anytime.
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
          disabled={!result.output}
          className="min-h-[44px] flex-1 rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft disabled:opacity-40 md:flex-none"
        >
          {copied ? "Copied!" : "Copy output"}
        </button>
        <button
          type="button"
          onClick={() => {
            const sql = direction === "dbml-to-sql" ? result.output : input;
            if (sql.trim()) goVisualizeWithSql(sql);
          }}
          disabled={!(direction === "dbml-to-sql" ? result.output : input).trim()}
          className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
        >
          Visualize this schema →
        </button>
      </div>
    </div>
  );
}
