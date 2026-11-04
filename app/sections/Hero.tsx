"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { ECOMMERCE_SQL, SUPABASE_SQL } from "@/lib/sql/pgDumpSamples";

type ActiveFile = "ecommerce" | "sample";

const files: { id: ActiveFile; label: string }[] = [
  { id: "ecommerce", label: "ecommerce.sql" },
  { id: "sample", label: "sample.sql" },
];

const badges = [
  {
    href: "https://www.codehype.ai/product/dbdiagramr?utm_source=codehype_badge",
    src: "https://www.codehype.ai/badges/dbdiagramr.svg?variant=find-us&v=20",
    alt: "Featured on CodeHype",
    width: 180,
    height: 65,
    rel: "noopener noreferrer",
  },
  {
    href: "https://noonlaunch.com/product/dbdiagramr",
    src: "https://noonlaunch.com/badges/dbdiagramr.svg",
    alt: "Featured on Noonlaunch",
    width: 220,
    height: 60,
    rel: "noopener noreferrer dofollow",
  },
  {
    href: "https://braginpublic.com/?utm_source=badge&utm_medium=referral",
    src: "https://braginpublic.com/badge?theme=light",
    alt: "Featured on Brag in Public",
    width: 208,
    height: 54,
    rel: "noopener noreferrer",
  },
  {
    href: "https://scrappystartups.com/startup/dbdiagramr",
    src: "https://scrappystartups.com/badge.svg?theme=light",
    alt: "Find us on Scrappy Startups",
    width: 305,
    height: 56,
    rel: "noopener noreferrer",
  },
];

const badgeCopies = [0, 1, 2];

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
  const tableCount = activeSchema?.tables.length ?? 0;

  return (
    <section className="bg-cream pb-16 pt-28 md:pt-36">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
            PostgreSQL ER diagrams · free, no signup, open source (MIT)
          </p>
          <h1 className="mt-6 text-5xl font-semibold leading-[1.02] tracking-tight text-ink md:text-7xl">
            Paste SQL. See Schema. <span className="text-accent">Ship Faster.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg font-medium leading-relaxed text-muted md:text-xl">
            The free PostgreSQL ER diagram tool where you paste SQL and see
            your schema instantly.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => router.push("/visualize")}
              className="rounded-[10px] bg-accent px-6 py-2.5 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Create Your Diagram
            </button>
            <a
              href="#demo"
              className="rounded-[10px] border border-accent px-6 py-2.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
            >
              Watch 30s Demo
            </a>
          </div>
          <div className="badge-marquee-mask mt-6 overflow-hidden" role="group" aria-label="Featured on">
            <div className="badge-marquee flex w-max items-center">
              {badgeCopies.map((copy) => {
                const isDuplicate = copy > 0;
                return (
                  <div
                    key={copy}
                    data-badge-copy
                    data-badge-dup={isDuplicate ? "" : undefined}
                    aria-hidden={isDuplicate || undefined}
                    className="flex shrink-0 items-center gap-3 pr-3"
                  >
                    {badges.map((badge) => (
                      <a
                        key={badge.href}
                        href={badge.href}
                        target="_blank"
                        rel={badge.rel}
                        tabIndex={isDuplicate ? -1 : undefined}
                        className="inline-flex opacity-90 mix-blend-multiply transition-opacity hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                      >
                        <Image
                          src={badge.src}
                          alt={badge.alt}
                          width={badge.width}
                          height={badge.height}
                          unoptimized
                          className="block h-[50px] w-auto"
                        />
                      </a>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {files.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setActiveFile(f.id)}
                aria-pressed={activeFile === f.id}
                className={`rounded-[20px] px-4 py-1.5 font-mono text-xs font-medium transition-colors ${
                  activeFile === f.id
                    ? "bg-accent text-white"
                    : "border border-accent text-accent hover:bg-accent-soft"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="font-mono text-xs text-muted">
            <span className="font-medium text-ink">{tableCount} tables</span>
            {" · "}live preview · hover a table to trace
          </p>
        </div>

        <div className="mt-4 overflow-hidden rounded-[20px] border border-border bg-surface shadow-lg">
          <div className="h-[480px] md:h-[600px]">
            {activeSchema ? (
              <SchemaDiagram
                schema={activeSchema}
                className="heropreview h-full w-full"
                passive
                minimal
              />
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                Loading preview...
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
