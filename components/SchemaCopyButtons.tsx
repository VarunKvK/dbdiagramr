"use client";

import { useState } from "react";

export default function SchemaCopyButtons({
  sql,
  mermaid,
  slug,
}: {
  sql: string;
  mermaid: string;
  slug: string;
}) {
  const [copied, setCopied] = useState<"sql" | "mermaid" | null>(null);

  async function copy(kind: "sql" | "mermaid") {
    await navigator.clipboard.writeText(kind === "sql" ? sql : mermaid);
    setCopied(kind);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => copy("sql")}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-black/5 transition-colors hover:bg-indigo-50"
      >
        {copied === "sql" ? "Copied!" : "Copy as SQL"}
      </button>
      <button
        type="button"
        onClick={() => copy("mermaid")}
        className="rounded-lg bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm ring-1 ring-black/5 transition-colors hover:bg-indigo-50"
      >
        {copied === "mermaid" ? "Copied!" : "Copy as Mermaid"}
      </button>
      <a
        href={`/visualize?schema=${slug}`}
        className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
      >
        Open in DBdiagramr to edit →
      </a>
    </div>
  );
}
