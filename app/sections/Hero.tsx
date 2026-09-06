"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MacWindow } from "@/components/ui/mac-window";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { ECOMMERCE_SQL, SUPABASE_SQL } from "@/lib/sql/pgDumpSamples";

type ActiveFile = "ecommerce" | "sample";

export default function Hero() {
  const router = useRouter();
  const [activeFile, setActiveFile] = useState<ActiveFile>("ecommerce");

  const schemas = useMemo(() => {
    try {
      const ecommerce = parseSqlToSchema(ECOMMERCE_SQL).schema;
      const supabase = parseSqlToSchema(SUPABASE_SQL).schema;
      return { ecommerce, supabase };
    } catch {
      return null;
    }
  }, []);

  const activeSchema = activeFile === "ecommerce" ? schemas?.ecommerce ?? null : schemas?.supabase ?? null;

  return (
    <section className="bg-cream pt-[400px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h1 className="text-5xl font-medium leading-tight text-ink md:text-6xl lg:pr-[90px]">
          Stop drawing your{" "}
          <span className="underline decoration-2 underline-offset-4 font-[family-name:var(--font-carattere)] text-[1.15em] font-normal">
            database
          </span>{" "}
          by hand
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted md:text-xl">
          Generate a beautiful ER diagram from your PostgreSQL database in under
          10 seconds. No signup, no setup, no sketching.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <button
            type="button"
            onClick={() => router.push("/visualize")}
            className="rounded-lg bg-[#4F39F6] px-8 py-3 font-medium text-white transition-colors hover:bg-[#4338CA]"
          >
            Try it free
          </button>
          <a
            href="/schema"
            className="text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            Browse popular database schemas →
          </a>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 pb-24 pt-16 lg:px-8">
        <MacWindow url="dbdiagramr.space/visualize">
          <div className="flex gap-2 border-b border-border bg-white px-3 py-3">
            <button
              type="button"
              onClick={() => router.push("/visualize")}
              className="rounded-full border border-border bg-surface px-3 py-1 text-xs font-mono font-medium text-muted transition-colors hover:bg-white hover:text-ink"
            >
              schema.sql
            </button>
            <button
              type="button"
              onClick={() => setActiveFile("ecommerce")}
              aria-pressed={activeFile === "ecommerce"}
              className={`rounded-full border px-3 py-1 text-xs font-mono font-medium transition-colors ${
                activeFile === "ecommerce"
                  ? "border-ink bg-ink text-white shadow"
                  : "border-border bg-surface text-muted hover:bg-white hover:text-ink"
              }`}
            >
              ecommerce.sql
            </button>
            <button
              type="button"
              onClick={() => setActiveFile("sample")}
              aria-pressed={activeFile === "sample"}
              className={`rounded-full border px-3 py-1 text-xs font-mono font-medium transition-colors ${
                activeFile === "sample"
                  ? "border-ink bg-ink text-white shadow"
                  : "border-border bg-surface text-muted hover:bg-white hover:text-ink"
              }`}
            >
              sample.sql
            </button>
          </div>
          <div className="h-[500px]">
            {activeSchema ? (
              <SchemaDiagram schema={activeSchema} className="h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Loading preview...
              </div>
            )}
          </div>
        </MacWindow>
      </div>
    </section>
  );
}
