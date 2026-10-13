"use client";

import { useState } from "react";
import Link from "next/link";

export type SchemaGridEntry = {
  slug: string;
  name: string;
  title: string;
  tableCount: number;
  svg: string;
};

const PAGE = 6;

export default function SchemaGrid({ entries }: { entries: SchemaGridEntry[] }) {
  const [expanded, setExpanded] = useState(false);
  const visible = expanded ? entries : entries.slice(0, PAGE);

  return (
    <>
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((entry) => (
          <Link
            key={entry.slug}
            href={`/schema/${entry.slug}`}
            className="group flex flex-col rounded-[20px] bg-ink p-3 text-white transition-colors hover:bg-pine"
          >
            <div className="relative min-h-[280px] overflow-hidden rounded-[12px] bg-white">
              <div
                className="absolute inset-0 [&_text]:font-mono"
                dangerouslySetInnerHTML={{ __html: entry.svg }}
              />
            </div>
            <div className="flex flex-1 flex-col px-2 pb-2 pt-4">
              <h2 className="text-3xl font-semibold tracking-tight">
                {entry.name}
              </h2>
              <p className="mt-1 text-sm font-medium text-white/60">
                {entry.title}
              </p>
              <div className="mt-4 flex items-center justify-between gap-2">
                <span className="rounded-[20px] border border-punch px-3 py-1 font-mono text-xs font-medium text-punch">
                  {entry.tableCount} tables
                </span>
                <span className="rounded-[20px] bg-accent px-4 py-1.5 font-mono text-xs font-medium text-white transition-colors group-hover:bg-accent-hover">
                  View diagram
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {entries.length > PAGE && (
        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="rounded-[10px] border border-accent px-8 py-3 text-xs font-medium text-accent transition-colors hover:bg-accent-soft"
          >
            {expanded
              ? "Show less"
              : `Show more (${entries.length - PAGE} more)`}
          </button>
        </div>
      )}
    </>
  );
}
