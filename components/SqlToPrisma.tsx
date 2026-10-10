"use client";

import { useMemo, useState } from "react";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { schemaToPrisma } from "@/lib/sql/emitPrisma";
import { ECOMMERCE_SQL } from "@/lib/sql/pgDumpSamples";
import { goVisualizeWithSql } from "@/lib/preload";

export default function SqlToPrisma() {
  const [input, setInput] = useState(ECOMMERCE_SQL);
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    if (!input.trim()) return { output: "", error: null as string | null, tableCount: 0 };
    try {
      const { schema } = parseSqlToSchema(input);
      return {
        output: schemaToPrisma(schema),
        error: null as string | null,
        tableCount: schema.tables.length,
      };
    } catch (err: unknown) {
      return {
        output: "",
        error: err instanceof Error ? err.message : "Could not parse this SQL",
        tableCount: 0,
      };
    }
  }, [input]);

  async function copyOutput() {
    if (!result.output) return;
    await navigator.clipboard.writeText(result.output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">schema.sql</span>
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
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-sm ring-1 ring-black/5">
          <div className="flex items-center justify-between border-b border-[#333] px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-[#999]">
              schema.prisma{result.tableCount > 0 && ` · ${result.tableCount} models`}
            </span>
            <button
              type="button"
              onClick={copyOutput}
              disabled={!result.output}
              className="text-xs font-medium text-indigo-300 hover:text-indigo-200 disabled:opacity-40"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="h-[380px] overflow-auto p-4">
            {result.error ? (
              <p className="font-mono text-sm leading-relaxed text-red-400">{result.error}</p>
            ) : result.output ? (
              <pre className="font-mono text-sm leading-relaxed text-[#e5e5e5]">{result.output}</pre>
            ) : (
              <p className="font-mono text-sm text-[#666]">schema.prisma appears here…</p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-cream/95 py-3 backdrop-blur-sm md:static md:bg-transparent md:p-0 md:pt-3">
        <button
          type="button"
          onClick={copyOutput}
          disabled={!result.output}
          className="min-h-[44px] flex-1 rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-black/5 transition-colors hover:bg-indigo-50 disabled:opacity-40 md:flex-none"
        >
          {copied ? "Copied!" : "Copy schema.prisma"}
        </button>
        <button
          type="button"
          onClick={() => input.trim() && goVisualizeWithSql(input)}
          disabled={!input.trim()}
          className="min-h-[44px] flex-1 rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600 disabled:opacity-40 md:flex-none"
        >
          Visualize this schema →
        </button>
      </div>
    </div>
  );
}
