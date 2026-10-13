"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { SqlError } from "libpg-query";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { goVisualizeWithSql } from "@/lib/preload";

const SAMPLE = `SELECT u.id u.email, COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.created_at > now() - interval '30 days'
ORDER BY post_count DESC;`;

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "valid"; statements: number; visualizable: boolean }
  | { kind: "error"; message: string; line: number; column: number };

function offsetToLineCol(sql: string, offset: number): { line: number; column: number } {
  const clamped = Math.max(0, Math.min(offset, sql.length));
  const before = sql.slice(0, clamped);
  const line = before.split("\n").length;
  const lastNl = before.lastIndexOf("\n");
  return { line, column: clamped - lastNl };
}

export default function SqlValidator() {
  const [input, setInput] = useState(SAMPLE);
  const [wasmReady, setWasmReady] = useState(false);
  const [wasmFailed, setWasmFailed] = useState(false);
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const parseRef = useRef<((query: string) => Promise<unknown>) | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    import("libpg-query")
      .then((m) => {
        if (cancelled) return;
        parseRef.current = m.parse as (query: string) => Promise<unknown>;
        setWasmReady(true);
      })
      .catch(() => {
        if (!cancelled) setWasmFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!wasmReady || !parseRef.current) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = input.trim();
    if (!trimmed) {
      setStatus({ kind: "idle" });
      return;
    }
    setStatus({ kind: "loading" });
    debounceRef.current = setTimeout(async () => {
      try {
        const res = (await parseRef.current!(trimmed)) as {
          stmts?: unknown[];
        };
        let visualizable = false;
        try {
          visualizable = parseSqlToSchema(trimmed).schema.tables.length > 0;
        } catch {
          visualizable = false;
        }
        setStatus({
          kind: "valid",
          statements: Array.isArray(res.stmts) ? res.stmts.length : 1,
          visualizable,
        });
      } catch (err: unknown) {
        const sqlErr = err as SqlError;
        const pos = sqlErr.sqlDetails?.cursorPosition ?? -1;
        const { line, column } =
          pos >= 0
            ? offsetToLineCol(trimmed, pos)
            : { line: 1, column: 1 };
        const message = (sqlErr.message || "Syntax error").replace(/^Error:\s*/, "");
        setStatus({ kind: "error", message, line, column });
      }
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [input, wasmReady]);

  const errorLine = useMemo(() => {
    if (status.kind !== "error") return null;
    const lines = input.split("\n");
    return lines[status.line - 1] ?? "";
  }, [status, input]);

  return (
    <div>
      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
          <span className="font-mono text-xs font-medium text-muted">
            query.sql{input.trim() && ` · ${input.split("\n").length} ${input.split("\n").length === 1 ? "line" : "lines"}`}
          </span>
          <div className="flex items-center gap-2">
            {wasmFailed ? (
              <span className="font-mono text-xs text-red-500">
                Parser failed to load. Check connection and reload
              </span>
            ) : !wasmReady ? (
              <span className="font-mono text-xs text-muted">
                Loading Postgres parser…
              </span>
            ) : (
              <span className="font-mono text-xs text-emerald-600">
                Real PostgreSQL parser ready
              </span>
            )}
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
        </div>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste PostgreSQL here to check its syntax…"
          spellCheck={false}
          aria-label="SQL to validate"
          className="h-[300px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
        />
      </div>

      <div className="mt-4 min-h-[120px] overflow-hidden rounded-[20px] bg-ink p-5 shadow-lg">
        {status.kind === "idle" && (
          <p className="font-mono text-sm text-white/40">
            Validation results appear here…
          </p>
        )}
        {status.kind === "loading" && (
          <p className="font-mono text-sm text-white/50">Checking…</p>
        )}
        {status.kind === "valid" && (
          <div>
            <p className="font-mono text-sm font-medium text-emerald-400">
              ✓ Valid PostgreSQL: {status.statements}{" "}
              {status.statements === 1 ? "statement" : "statements"}, no syntax
              errors.
            </p>
            {status.visualizable && (
              <button
                type="button"
                onClick={() => goVisualizeWithSql(input)}
                className="mt-4 min-h-[44px] rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-accent-soft"
              >
                Visualize this schema →
              </button>
            )}
          </div>
        )}
        {status.kind === "error" && (
          <div>
            <p className="font-mono text-sm font-medium text-red-400">
              ✗ {status.message}
            </p>
            <p className="mt-1 font-mono text-xs text-white/50">
              Line {status.line}, column {status.column}
            </p>
            {errorLine !== null && (
              <div className="mt-3 overflow-x-auto rounded-[10px] bg-black/40 p-3">
                <pre className="font-mono text-sm leading-relaxed text-white/85">
                  {errorLine || " "}
                </pre>
                <pre className="font-mono text-sm leading-relaxed text-red-400" aria-hidden="true">
                  {" ".repeat(Math.max(0, status.column - 1))}^
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
