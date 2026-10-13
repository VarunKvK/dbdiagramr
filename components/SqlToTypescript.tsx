"use client";

import { useMemo, useState } from "react";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { schemaToTypescript, schemaToZod } from "@/lib/sql/emitTypescript";
import { ECOMMERCE_SQL } from "@/lib/sql/pgDumpSamples";
import { goVisualizeWithSql } from "@/lib/preload";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

type Mode = "ts" | "zod";

export default function SqlToTypescript() {
  const [input, setInput] = useState(ECOMMERCE_SQL);
  const [mode, setMode] = useState<Mode>("ts");
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebouncedValue(input);

  const result = useMemo(() => {
    if (!debouncedInput.trim()) return { output: "", error: null as string | null };
    try {
      const { schema } = parseSqlToSchema(debouncedInput);
      return {
        output: mode === "ts" ? schemaToTypescript(schema) : schemaToZod(schema),
        error: null as string | null,
      };
    } catch (err: unknown) {
      return {
        output: "",
        error: err instanceof Error ? err.message : "Could not parse this SQL",
      };
    }
  }, [debouncedInput, mode]);

  async function copyOutput() {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 rounded-[20px] border border-border bg-white p-4 shadow-sm">
        <span className="text-sm font-medium text-muted">Output:</span>
        <div role="group" aria-label="Output" className="flex gap-1 rounded-[10px] border border-border bg-surface p-1">
          {(["ts", "zod"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`rounded-[10px] px-4 py-2 font-mono text-xs font-medium transition-colors ${mode === m ? "bg-ink text-white" : "text-muted hover:text-ink"}`}
            >
              {m === "ts" ? "TypeScript interfaces" : "Zod schemas"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">
              schema.sql{input.trim() && ` · ${input.split("\n").length} ${input.split("\n").length === 1 ? "line" : "lines"}`}
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
            placeholder="Paste CREATE TABLE statements…"
            spellCheck={false}
            aria-label="SQL schema to convert to TypeScript"
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-white/50">
              {mode === "ts" ? "types.ts" : "schemas.ts"}
              {result.output && ` · ${result.output.split("\n").length} lines`}
            </span>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {result.error ? (
              <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-mono text-sm font-medium text-red-300">
                  Could not parse this SQL
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                  Check for unbalanced quotes or parentheses, then try again.
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
                  Paste CREATE TABLE on the left and generated types land here.
                </p>
                <p className="mt-1 font-mono text-xs text-white/30">
                  Pick TypeScript interfaces or Zod schemas above.
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
          onClick={() => input.trim() && goVisualizeWithSql(input)}
          disabled={!input.trim()}
          className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
        >
          Visualize this schema →
        </button>
      </div>
    </div>
  );
}
