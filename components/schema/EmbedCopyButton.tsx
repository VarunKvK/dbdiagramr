"use client";

import { useState } from "react";

export default function EmbedCopyButton({ html }: { html: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this embed HTML", html);
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft"
    >
      {copied ? "Copied!" : "Copy embed HTML"}
    </button>
  );
}
