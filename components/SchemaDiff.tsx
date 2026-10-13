"use client";

import { useMemo, useState } from "react";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import {
  diffSchemas,
  diffSummary,
  diffToAlter,
  isEmptyDiff,
} from "@/lib/sql/diffSchemas";
import { goVisualizeWithSql } from "@/lib/preload";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const OLD_SAMPLE = `CREATE TABLE users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  name text
);

CREATE TABLE posts (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES users(id),
  title text NOT NULL
);`;

const NEW_SAMPLE = `CREATE TABLE users (
  id uuid PRIMARY KEY,
  email varchar(320) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE posts (
  id uuid PRIMARY KEY,
  author_id uuid REFERENCES users(id),
  title text NOT NULL,
  published boolean DEFAULT false
);

CREATE TABLE comments (
  id uuid PRIMARY KEY,
  post_id uuid REFERENCES posts(id),
  body text NOT NULL
);`;

export default function SchemaDiff() {
  const [oldSql, setOldSql] = useState(OLD_SAMPLE);
  const [newSql, setNewSql] = useState(NEW_SAMPLE);
  const [copied, setCopied] = useState(false);
  const debouncedOld = useDebouncedValue(oldSql);
  const debouncedNew = useDebouncedValue(newSql);

  const result = useMemo(() => {
    if (!debouncedOld.trim() || !debouncedNew.trim()) {
      return { summary: [] as string[], alter: "", error: null as string | null, identical: false };
    }
    try {
      const oldSchema = parseSqlToSchema(debouncedOld).schema;
      const newSchema = parseSqlToSchema(debouncedNew).schema;
      const diff = diffSchemas(oldSchema, newSchema);
      if (isEmptyDiff(diff)) {
        return { summary: [], alter: "", error: null, identical: true };
      }
      return {
        summary: diffSummary(diff),
        alter: diffToAlter(diff, newSchema).join("\n"),
        error: null as string | null,
        identical: false,
      };
    } catch (err: unknown) {
      return {
        summary: [] as string[],
        alter: "",
        error: err instanceof Error ? err.message : "Could not parse one of the schemas",
        identical: false,
      };
    }
  }, [debouncedOld, debouncedNew]);

  async function copyOutput() {
    if (!result.alter) return;
    await navigator.clipboard.writeText(result.alter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const pane = (label: string, value: string, setValue: (v: string) => void, placeholder: string) => (
    <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-xs font-medium text-muted">
          {label}{value.trim() && ` · ${value.split("\n").length} ${value.split("\n").length === 1 ? "line" : "lines"}`}
        </span>
        {value && (
          <button
            type="button"
            onClick={() => setValue("")}
            className="text-xs font-medium text-muted hover:text-ink"
          >
            Clear
          </button>
        )}
      </div>
      <textarea
        value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          spellCheck={false}
          aria-label={label}
        className="h-[320px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
      />
    </div>
  );

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        {pane("old.sql (current production schema)", oldSql, setOldSql, "Paste the current schema…")}
        {pane("new.sql (proposed schema)", newSql, setNewSql, "Paste the proposed schema…")}
      </div>

      <div className="mt-4 overflow-hidden rounded-[20px] bg-ink shadow-lg">
        <div className="border-b border-white/10 px-4 py-2.5">
          <span className="font-mono text-xs font-medium text-white/50">
            migration.sql
            {result.summary.length > 0 && ` · ${result.summary.length} change${result.summary.length === 1 ? "" : "s"}`}
          </span>
        </div>
        <div className="max-h-[420px] overflow-auto p-4">
          {result.error ? (
            <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
              <p className="font-mono text-sm font-medium text-red-300">
                Could not diff these schemas
              </p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                Both sides must be valid CREATE TABLE statements.
              </p>
              <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-300/80">
                {result.error}
              </p>
            </div>
          ) : result.identical ? (
            <p className="font-mono text-sm leading-relaxed text-emerald-400">
              ✓ Schemas are identical. No migration needed.
            </p>
          ) : result.alter ? (
            <>
              <div className="mb-3 flex flex-wrap gap-2">
                {result.summary.map((s) => (
                  <span key={s} className={`rounded-[20px] px-2.5 py-1 font-mono text-xs ${s.startsWith("+") ? "bg-emerald-900/60 text-emerald-300" : s.startsWith("-") ? "bg-red-900/60 text-red-300" : "bg-amber-900/60 text-amber-300"}`}>
                    {s}
                  </span>
                ))}
              </div>
              <div className="flex min-h-full">
                <div
                  aria-hidden="true"
                  className="w-9 shrink-0 select-none pr-3 text-right font-mono text-sm leading-relaxed text-white/30"
                >
                  {Array.from({ length: result.alter.split("\n").length }, (_, i) => (
                    <div key={i + 1}>{i + 1}</div>
                  ))}
                </div>
                <pre className="min-w-0 flex-1 font-mono text-sm leading-relaxed text-white/85">{result.alter}</pre>
              </div>
              <p className="mt-3 font-mono text-xs leading-relaxed text-white/50">
                Review before running on production. Test on a copy first.
              </p>
            </>
          ) : (
            <div className="flex h-full min-h-[200px] flex-col items-center justify-center text-center">
              <p className="font-mono text-sm text-white/40">
                Paste both schemas above and the migration lands here.
              </p>
              <p className="mt-1 font-mono text-xs text-white/30">
                Structural diff plus the ALTER statements to migrate.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-cream/95 py-3 backdrop-blur-sm md:static md:bg-transparent md:p-0 md:pt-3">
        <button
          type="button"
          onClick={copyOutput}
          disabled={!result.alter}
          className="min-h-[44px] flex-1 rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft disabled:opacity-40 md:flex-none"
        >
          {copied ? "Copied!" : "Copy migration"}
        </button>
        <button
          type="button"
          onClick={() => newSql.trim() && goVisualizeWithSql(newSql)}
          disabled={!newSql.trim()}
          className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
        >
          Visualize the new schema →
        </button>
      </div>
    </div>
  );
}
