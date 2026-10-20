import { readdirSync, readFileSync, type Dirent } from "node:fs";
import { join } from "node:path";
import type { Schema } from "./lib/types";
import { parseSqlToSchema } from "./lib/parsePostgres";
import {
  diffSchemas,
  diffToAlter,
  isEmptyDiff,
  type SchemaDiff,
} from "./lib/diffSchemas";
import { schemaToMermaid } from "./lib/schemaExport";
import { matchGlob } from "./lib/glob";

// Core: file content sets -> parsed schemas -> PR comment markdown.
// Pure (no fs/git/github) so the CLI can test it with fixture directories.

export type FileMap = Map<string, string>; // repo-relative path -> SQL content

export type ParseResult = {
  schema: Schema;
  warnings: string[];
  errorFiles: { file: string; message: string }[];
};

export const COMMENT_MARKER = "<!-- pr-schema-diff-erd -->";
export const ERD_START = "<!-- dbdiagramr:erd:start -->";
export const ERD_END = "<!-- dbdiagramr:erd:end -->";
const MAX_MERMAID_TABLES = 60;
const MAX_COMMENT_CHARS = 60000;

/** Mermaid block for a README, wrapped in stable markers. Null when unsuited. */
export function renderErdBlock(schema: Schema): string | null {
  const tableCount = schema.tables.length;
  if (tableCount === 0 || tableCount > MAX_MERMAID_TABLES) return null;
  const mermaid = schemaToMermaid(schema).trimEnd();
  if (mermaid.split("\n").length >= 500) return null;
  return `${ERD_START}\n\`\`\`mermaid\n${mermaid}\n\`\`\`\n${ERD_END}`;
}

/** Replace the marked block in place, or append it when no markers exist. */
export function upsertErdBlock(
  readme: string,
  block: string
): { content: string; changed: boolean } {
  const start = readme.indexOf(ERD_START);
  const end = readme.indexOf(ERD_END);
  let next: string;
  if (start !== -1 && end > start) {
    next = readme.slice(0, start) + block + readme.slice(end + ERD_END.length);
  } else {
    next = `${readme.trimEnd()}\n\n## Database schema\n\n${block}\n`;
  }
  return { content: next, changed: next !== readme };
}

export function collectSqlFiles(root: string, glob: string): string[] {
  const out: string[] = [];
  walk(root, "", glob, out);
  return out.sort();
}

function walk(root: string, rel: string, glob: string, out: string[]): void {
  const abs = rel ? join(root, rel) : root;
  let entries: Dirent[];
  try {
    entries = readdirSync(abs, { withFileTypes: true });
  } catch {
    return;
  }
  for (const e of entries) {
    const childRel = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) {
      if (e.name === "node_modules" || e.name === ".git") continue;
      walk(root, childRel, glob, out);
    } else if (e.isFile() && matchGlob(childRel, glob)) {
      out.push(childRel);
    }
  }
}

export function readFiles(root: string, relPaths: string[]): FileMap {
  const map: FileMap = new Map();
  for (const rel of relPaths) {
    try {
      map.set(rel, readFileSync(join(root, rel), "utf8"));
    } catch {
      // missing file (deleted between listing and read) — skip
    }
  }
  return map;
}

export function parseFileMap(files: FileMap): ParseResult {
  const paths = Array.from(files.keys()).sort();
  const joined = paths.map((p) => files.get(p) ?? "").join("\n");
  const main = parseSqlToSchema(joined);

  // Attribute warnings to files — but only warnings that also appear in the
  // merged parse. A file parsed alone often warns about tables its siblings
  // create (e.g. ALTER before CREATE in an earlier file); those are noise.
  const mergedWarnings = new Set(main.warnings);
  const errorFiles: { file: string; message: string }[] = [];
  const attributed = new Set<string>();
  for (const p of paths) {
    const single = parseSqlToSchema(files.get(p) ?? "");
    for (const w of single.warnings) {
      if (mergedWarnings.has(w) && !attributed.has(w)) {
        errorFiles.push({ file: p, message: w });
        attributed.add(w);
      }
    }
  }
  for (const w of main.warnings) {
    if (!attributed.has(w)) errorFiles.push({ file: "merged schema", message: w });
  }

  return { schema: main.schema, warnings: main.warnings, errorFiles };
}

export type FileStats = {
  added: string[];
  modified: string[];
  removed: string[];
};

export function renderComment(args: {
  baseSha: string;
  headSha: string;
  stats: FileStats;
  base: ParseResult;
  head: ParseResult;
  repoUrl?: string;
  siteUrl?: string;
}): string {
  const { baseSha, headSha, stats, base, head } = args;
  const siteUrl = args.siteUrl ?? "https://www.dbdiagramr.space";
  const diff = diffSchemas(base.schema, head.schema);

  const changedCount =
    stats.added.length + stats.modified.length + stats.removed.length;
  const statBits: string[] = [];
  if (stats.added.length) statBits.push(`${stats.added.length} added`);
  if (stats.modified.length) statBits.push(`${stats.modified.length} modified`);
  if (stats.removed.length) statBits.push(`${stats.removed.length} removed`);

  const parts: string[] = [];
  parts.push(COMMENT_MARKER);
  parts.push("## 📊 Schema diff");
  const statText = statBits.length ? ` (${statBits.join(", ")})` : "";
  parts.push(
    `_Migration files changed: **${changedCount}**${statText} — \`${baseSha.slice(0, 7)}\` → \`${headSha.slice(0, 7)}\`._`
  );
  parts.push("");

  const errorFiles = [...base.errorFiles, ...head.errorFiles];
  if (errorFiles.length > 0) {
    const shown = errorFiles.slice(0, 5);
    parts.push("> ⚠️ **Parser warnings** (best-effort — verify manually):");
    for (const e of shown) {
      parts.push(`> - \`${e.file}\`: ${e.message}`);
    }
    if (errorFiles.length > shown.length) {
      parts.push(`> - …and ${errorFiles.length - shown.length} more`);
    }
    parts.push("");
  }

  if (isEmptyDiff(diff)) {
    parts.push("✅ **No structural schema changes detected** between the two versions.");
    parts.push("");
  } else {
    parts.push("| Change | Table | Details |");
    parts.push("|---|---|---|");
    for (const t of diff.addedTables) {
      parts.push(
        `| ➕ added | \`${escapePipes(t.name)}\` | ${t.columns.length} columns |`
      );
    }
    for (const name of diff.removedTables) {
      parts.push(`| ➖ removed | \`${escapePipes(name)}\` | — |`);
    }
    for (const td of diff.changedTables) {
      const bits: string[] = [];
      if (td.addedCols.length)
        bits.push(`+${td.addedCols.length} col (${td.addedCols.map((c) => c.name).join(", ")})`);
      if (td.removedCols.length)
        bits.push(`-${td.removedCols.length} col (${td.removedCols.join(", ")})`);
      for (const ch of td.changedCols) {
        bits.push(`\`${ch.name}\`: ${ch.changes.join("; ")}`);
      }
      if (td.addedFks.length) bits.push(`+${td.addedFks.length} FK`);
      if (td.removedFks.length) bits.push(`-${td.removedFks.length} FK`);
      if (td.pkChanged)
        bits.push(`PK (${td.pkChanged.from.join(",") || "none"}) → (${td.pkChanged.to.join(",") || "none"})`);
      parts.push(`| ✏️ changed | \`${escapePipes(td.table)}\` | ${escapePipes(bits.join(" · "))} |`);
    }
    parts.push("");

    const alters = diffToAlter(diff, head.schema);
    if (alters.length > 0) {
      parts.push("<details><summary>💾 <b>Migration preview</b> (review before running)</summary>");
      parts.push("");
      parts.push("```sql");
      parts.push(alters.join("\n"));
      parts.push("```");
      parts.push("");
      parts.push("</details>");
      parts.push("");
    }
  }

  const tableCount = head.schema.tables.length;
  if (isEmptyDiff(diff)) {
    // Nothing structural changed — skip the diagram, keep the comment short.
  } else if (tableCount === 0) {
    // nothing to draw
  } else if (tableCount > MAX_MERMAID_TABLES) {
    parts.push(
      `_ER diagram skipped: ${tableCount} tables exceeds the ${MAX_MERMAID_TABLES}-table render limit._`
    );
    parts.push("");
  } else {
    const mermaid = schemaToMermaid(head.schema).trimEnd();
    if (mermaid.split("\n").length < 500) {
      parts.push("<details open><summary>🗺️ <b>ER diagram</b> (head)</summary>");
      parts.push("");
      parts.push("```mermaid");
      parts.push(mermaid);
      parts.push("```");
      parts.push("");
      parts.push("</details>");
      parts.push("");
    }
  }

  parts.push("---");
  const repoBit = args.repoUrl
    ? ` · [⭐ star the repo](${args.repoUrl})`
    : "";
  parts.push(
    `Free tool by [dbdiagramr](${siteUrl}) — paste your connection string, get the live ER diagram in 10s${repoBit}`
  );

  let out = parts.join("\n");
  if (out.length > MAX_COMMENT_CHARS) {
    out =
      out.slice(0, MAX_COMMENT_CHARS) +
      "\n\n…_(truncated — too many changes for one comment)_" +
      `\n${COMMENT_MARKER}`;
  }
  return out;
}

function escapePipes(s: string): string {
  return s.replace(/\|/g, "\\|");
}
