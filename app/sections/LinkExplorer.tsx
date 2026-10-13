"use client";

import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type ExplorerLink = { href: string; label: string };

export default function LinkExplorer({
  tools,
  schemas,
}: {
  tools: ExplorerLink[];
  schemas: ExplorerLink[];
}) {
  const [tab, setTab] = useState<"tools" | "schemas">("tools");
  const links = tab === "tools" ? tools : schemas;

  return (
    <div className="rounded-[20px] border border-border bg-surface p-6 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h3 className="font-mono text-xs font-medium uppercase tracking-widest text-ink">
          Keep exploring
        </h3>
        <div className="flex gap-1 rounded-md border border-border bg-white p-1">
          {(
            [
              { id: "tools", label: `Free tools (${tools.length})` },
              { id: "schemas", label: `Schemas (${schemas.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-pressed={tab === t.id}
              className={cn(
                "rounded-md px-4 py-1.5 font-mono text-xs font-medium transition-colors",
                tab === t.id
                  ? "bg-ink text-white"
                  : "text-muted hover:text-ink"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group rounded-[20px] border border-border bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft"
          >
            {l.label}{" "}
            <span className="text-muted transition-colors group-hover:text-accent">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
