// Fixture tests: render the comment for each pair and assert key markers.
import { execFileSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

const cases = [
  {
    name: "add-column",
    expect: [
      "<!-- pr-schema-diff-erd -->",
      "📊 Schema diff",
      "| ➕ added | `comments` |",
      "| ✏️ changed | `users` |",
      "+1 col (email)",
      "ALTER TABLE users ADD COLUMN email",
      "```mermaid",
      "erDiagram",
      "Free tool by [dbdiagramr]",
    ],
    reject: ["No structural schema changes", "Parser warnings"],
  },
  {
    name: "drop-table",
    expect: [
      "| ➖ removed | `legacy_orders` |",
      "| ✏️ changed | `users` | -1 col (email)",
      "DROP TABLE legacy_orders;",
      "still referenced by remaining tables",
      "Migration preview",
    ],
    reject: [],
  },
  {
    name: "incremental",
    expect: [
      "| ➕ added | `categories` |",
      "| ✏️ changed | `products` |",
      "+1 col (category_id)",
      "+1 FK",
      "ALTER TABLE products ADD CONSTRAINT fk_products_category",
      "erDiagram",
    ],
    reject: [],
  },
  {
    name: "no-change",
    expect: ["✅ **No structural schema changes detected**"],
    reject: ["```mermaid"],
  },
];

let failed = 0;
for (const c of cases) {
  let out = "";
  let exitOk = true;
  try {
    out = execFileSync(
      process.execPath,
      [join(root, "dist", "cli.js"), join(root, "fixtures", c.name, "base"), join(root, "fixtures", c.name, "head")],
      { encoding: "utf8" }
    );
  } catch (err) {
    exitOk = false;
    out = String(err.stdout ?? "") + String(err.stderr ?? "");
  }
  const problems = [];
  if (!exitOk) problems.push("CLI exited non-zero");
  for (const s of c.expect) if (!out.includes(s)) problems.push(`missing: ${JSON.stringify(s)}`);
  for (const s of c.reject) if (out.includes(s)) problems.push(`unexpected: ${JSON.stringify(s)}`);
  if (problems.length) {
    failed++;
    console.log(`FAIL ${c.name}`);
    for (const p of problems) console.log(`  - ${p}`);
    console.log("  ---- output ----");
    console.log(out.split("\n").map((l) => `  ${l}`).join("\n"));
  } else {
    console.log(`ok   ${c.name}`);
  }
}

// README ERD: append the marked block, then re-run and expect no change.
const readmeFile = join(mkdtempSync(join(tmpdir(), "erd-")), "README.md");
writeFileSync(readmeFile, "# Demo\n\nIntro paragraph.\n");
const readmeArgs = [
  join(root, "dist", "cli.js"),
  join(root, "fixtures", "add-column", "base"),
  join(root, "fixtures", "add-column", "head"),
  "--readme",
  readmeFile,
];
const first = execFileSync(process.execPath, readmeArgs, { encoding: "utf8" });
const problems = [];
if (!first.includes("<!-- dbdiagramr:erd:start -->")) problems.push("missing start marker");
if (!first.includes("<!-- dbdiagramr:erd:end -->")) problems.push("missing end marker");
if (!first.includes("erDiagram")) problems.push("missing mermaid");
if (!first.includes("## Database schema")) problems.push("missing appended section");
if (!first.startsWith("# Demo")) problems.push("lost existing content");
if (problems.length) {
  failed++;
  console.log("FAIL readme-upsert");
  for (const p of problems) console.log(`  - ${p}`);
} else {
  writeFileSync(readmeFile, first);
  const second = execFileSync(process.execPath, readmeArgs, { encoding: "utf8" });
  if (second !== first) {
    failed++;
    console.log("FAIL readme-idempotent: second run changed the file");
  } else {
    console.log("ok   readme-upsert");
  }
}

// Output length guard: comment must stay under GitHub's limit.
const long = execFileSync(
  process.execPath,
  [join(root, "dist", "cli.js"), join(root, "fixtures", "drop-table", "base"), join(root, "fixtures", "drop-table", "head")],
  { encoding: "utf8" }
);
if (long.length > 65536) {
  failed++;
  console.log("FAIL comment exceeds 65536 chars");
}

process.exit(failed ? 1 : 0);
