"use client";

import { useMemo, useState } from "react";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parsePrismaToSchema } from "@/lib/sql/parsePrisma";
import { schemaToSql } from "@/lib/schemaExport";
import { goVisualizeWithSql } from "@/lib/preload";
import { useDebouncedValue } from "@/lib/useDebouncedValue";

const SAMPLE = `model User {
  id        String    @id @default(uuid())
  email     String    @unique
  name      String?
  createdAt DateTime  @default(now())
  posts     Post[]
}

model Post {
  id        String   @id @default(uuid())
  authorId  String
  author    User     @relation(fields: [authorId], references: [id], onDelete: Cascade)
  title     String
  published Boolean  @default(false)
}`;

export default function PrismaErd() {
  const [input, setInput] = useState(SAMPLE);
  const [copied, setCopied] = useState(false);
  const debouncedInput = useDebouncedValue(input);

  const result = useMemo(() => {
    if (!debouncedInput.trim())
      return { schema: null, sql: "", error: null as string | null, warnings: [] as string[] };
    try {
      const { schema, warnings } = parsePrismaToSchema(debouncedInput);
      return { schema, sql: schemaToSql(schema), error: null as string | null, warnings };
    } catch (err: unknown) {
      return {
        schema: null,
        sql: "",
        error: err instanceof Error ? err.message : "Could not parse this schema.prisma",
        warnings: [] as string[],
      };
    }
  }, [debouncedInput]);

  async function copySql() {
    if (!result.sql) return;
    await navigator.clipboard.writeText(result.sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-muted">
              schema.prisma{input.trim() && ` · ${input.split("\n").length} ${input.split("\n").length === 1 ? "line" : "lines"}`}
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
            placeholder="Paste your schema.prisma models…"
            spellCheck={false}
            aria-label="Prisma schema to visualize"
            className="h-[380px] w-full resize-none bg-white p-4 font-mono text-base leading-relaxed text-ink outline-none placeholder:text-muted/60 md:text-sm"
          />
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-2.5">
            <span className="font-mono text-xs font-medium text-white/50">
              ER diagram
              {result.schema && ` · ${result.schema.tables.length} models`}
            </span>
          </div>
          <div className="h-[380px] overflow-hidden">
            {result.error ? (
              <div className="m-4 rounded-xl border border-red-400/30 bg-red-500/10 p-4">
                <p className="font-mono text-sm font-medium text-red-300">
                  Could not parse this schema.prisma
                </p>
                <p className="mt-1 font-mono text-xs leading-relaxed text-white/50">
                  Check model blocks and @relation attributes, then try again.
                </p>
                <p className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-300/80">
                  {result.error}
                </p>
              </div>
            ) : result.schema ? (
              <SchemaDiagram schema={result.schema} className="h-full w-full" />
            ) : (
              <div className="flex h-full flex-col items-center justify-center p-4 text-center">
                <p className="font-mono text-sm text-white/40">
                  Paste schema.prisma on the left and the diagram lands here.
                </p>
                <p className="mt-1 font-mono text-xs text-white/30">
                  Every model and relation, no install.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">
          {result.warnings.slice(0, 4).map((w) => (
            <p key={w} className="font-mono text-xs leading-relaxed text-amber-800">
              Note: {w}
            </p>
          ))}
        </div>
      )}

      <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-cream/95 py-3 backdrop-blur-sm md:static md:bg-transparent md:p-0 md:pt-3">
        <button
          type="button"
          onClick={copySql}
          disabled={!result.sql}
          className="min-h-[44px] flex-1 rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft disabled:opacity-40 md:flex-none"
        >
          {copied ? "Copied!" : "Copy as SQL"}
        </button>
        <button
          type="button"
          onClick={() => result.sql && goVisualizeWithSql(result.sql)}
          disabled={!result.sql}
          className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
        >
          Open in dbdiagramr →
        </button>
      </div>
    </div>
  );
}
