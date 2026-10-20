import type { Metadata } from "next";
import Link from "next/link";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";

const URL = "https://www.dbdiagramr.space/github-schema-action";
const TITLE = "GitHub Action: Schema Diff & ER Diagram on Pull Requests";
const DESCRIPTION =
  "Free GitHub Action that comments a schema diff, migration preview, and Mermaid ER diagram on every PR touching Postgres migrations. No database, no API keys.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "github action schema diff, postgres migration pull request review, database diagram github action, er diagram on pr, schema diff comment",
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Does the Action need a database or credentials?",
    a: "No. It reads your migration .sql files at the base and head commits and parses them locally in the CI runner. No Postgres, no Neon account, no connection string, nothing executed.",
  },
  {
    q: "Which files does it look at?",
    a: "SQL files matching the migrations-path input, default **/migrations/**/*.sql. Change the glob for Flyway (db/migration), Liquibase, or any folder you keep DDL in.",
  },
  {
    q: "Will it spam my pull requests?",
    a: "No. It posts one comment with a hidden marker and updates that same comment on every push — reviewers get a single, always-current diff.",
  },
  {
    q: "What SQL does it understand?",
    a: "PostgreSQL DDL: CREATE TABLE, ALTER TABLE, columns, primary keys, foreign keys, defaults, and nullability. Knex or Prisma .js migrations are skipped — keep migrations as .sql files.",
  },
  {
    q: "What about pull requests from forks?",
    a: "Fork PRs receive a read-only token, so the action runs the diff but cannot post a comment. Same-repo branches work out of the box with the permissions block in the README.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "PR Schema Diff & ER Diagram (GitHub Action)",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

const workflow = `# .github/workflows/schema-diff.yml
name: Schema diff
on:
  pull_request:
    paths:
      - "**/migrations/**/*.sql"

permissions:
  contents: read
  pull-requests: write

jobs:
  schema-diff:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0   # the action reads the base commit
      - uses: VarunKvK/dbdiagramr/actions/pr-schema-diff-erd@main`;

const readmeWorkflow = `# Same action, plus a committed ER diagram in README.md
permissions:
  contents: write        # commit the README block
  pull-requests: write   # post the diff comment

steps:
  - uses: actions/checkout@v4
    with:
      fetch-depth: 0
  - uses: VarunKvK/dbdiagramr/actions/pr-schema-diff-erd@main
    with:
      readme-path: README.md`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-[20px] border border-border bg-ink p-6 font-mono text-xs leading-relaxed text-white/90">
      <code>{code}</code>
    </pre>
  );
}

function SampleComment() {
  return (
    <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2 border-b border-border pb-3">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="font-mono text-xs text-muted">
          dbdiagramr[bot] commented · updates on every push
        </span>
      </div>
      <div className="space-y-3 font-mono text-xs leading-relaxed text-ink">
        <p className="text-sm font-semibold">📊 Schema diff</p>
        <p className="text-muted">
          _Migration files changed: <b>2</b> (1 added, 1 modified) — `a7367ba` → `f665d09`._
        </p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-muted">
                <th className="py-1 pr-4 font-medium">Change</th>
                <th className="py-1 pr-4 font-medium">Table</th>
                <th className="py-1 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/60">
                <td className="py-1 pr-4">➕ added</td>
                <td className="py-1 pr-4">products</td>
                <td className="py-1">3 columns</td>
              </tr>
              <tr className="border-b border-border/60">
                <td className="py-1 pr-4">✏️ changed</td>
                <td className="py-1 pr-4">users</td>
                <td className="py-1">+1 col (name)</td>
              </tr>
              <tr>
                <td className="py-1 pr-4">✏️ changed</td>
                <td className="py-1 pr-4">orders</td>
                <td className="py-1">+2 col (status, product_id) · +1 FK</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-muted">💾 Migration preview (ALTER TABLE + safety notes)</p>
        <p className="text-muted">🗺️ ER diagram (head) — renders natively on GitHub</p>
        <p className="border-t border-border pt-3 text-muted">
          Free tool by{" "}
          <Link href="/" className="text-accent hover:text-accent-hover">
            dbdiagramr
          </Link>{" "}
          — paste your connection string, get the live ER diagram in 10s
        </p>
      </div>
    </div>
  );
}

export default function GithubSchemaActionPage() {
  return (
    <ToolPageShell
      appName="PR Schema Diff & ER Diagram"
      h1="Schema diff & ER diagram on every pull request"
      intro="A free GitHub Action that comments what your migration changed — added and dropped tables, column changes, a ready-to-review ALTER preview, and a Mermaid ER diagram — the moment a PR touches Postgres migrations. No database, no API keys."
      badge="GitHub Action"
      current="/github-schema-action"
      siblings={["/sql-schema-diff", "/database-schema-analyzer", "/"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/sql-schema-diff", label: "Schema Diff in the browser" },
        { href: "/visualize", label: "Live Postgres ER diagram" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className="mb-12 grid gap-8 md:grid-cols-3">
        {[
          {
            t: "Reads files, not databases",
            d: "Parses migrations at the base and head commits inside the CI runner. Nothing is executed, no credentials exist.",
          },
          {
            t: "One sticky comment",
            d: "Every push updates the same comment — the current diff is always the latest, never buried under spam.",
          },
          {
            t: "Migration preview included",
            d: "ALTER TABLE statements with backfill and drop-dependency warnings, so reviewers see the plan with the diff.",
          },
        ].map((f) => (
          <div key={f.t} className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-ink">{f.t}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{f.d}</p>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
          What the comment looks like
        </h2>
        <SampleComment />
        <p className="mt-3 text-sm text-muted">
          Real output from{" "}
          <a
            href="https://github.com/VarunKvK/schema-diff-action-test/pull/1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:text-accent-hover"
          >
            a live test PR →
          </a>
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
          Add it to your repo in 30 seconds
        </h2>
        <p className="mb-4 max-w-3xl leading-relaxed text-muted">
          Drop this workflow into <code className="font-mono text-sm">.github/workflows/</code>.
          That is the whole install — no app to authorize, no service to sign up for.
        </p>
        <CodeBlock code={workflow} />
        <p className="mt-4 text-sm text-muted">
          Advanced: set the <code className="font-mono text-sm">migrations-path</code> input to
          match your folder (for example{" "}
          <code className="font-mono text-sm">db/migration/*.sql</code> for Flyway).
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
          Keep the ER diagram in your README
        </h2>
        <p className="mb-4 max-w-3xl leading-relaxed text-muted">
          Add <code className="font-mono text-sm">readme-path: README.md</code> and grant{" "}
          <code className="font-mono text-sm">contents: write</code>. The action rewrites a
          marked Mermaid block with the head schema and commits it to the PR branch. Repeat
          runs only touch that block, and nothing is committed when the diagram is unchanged.
        </p>
        <CodeBlock code={readmeWorkflow} />
        <p className="mt-4 text-sm text-muted">
          The block is wrapped in{" "}
          <code className="font-mono text-sm">{"<!-- dbdiagramr:erd:start -->"}</code> and{" "}
          <code className="font-mono text-sm">{"<!-- dbdiagramr:erd:end -->"}</code>. If the
          markers are missing, the action appends a “Database schema” section. Fork PRs are
          skipped because the token cannot write to the fork.
        </p>
      </section>

      <section className="mb-12">
        <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
          What it does not do (v1)
        </h2>
        <ul className="grid max-w-3xl gap-2 leading-relaxed text-muted">
          <li>· Postgres DDL only — MySQL and SQLite dialects are not parsed yet.</li>
          <li>· .sql migrations only — knex and Prisma .js migration files are skipped.</li>
          <li>· Best-effort parser: anything it cannot read is flagged in the comment, not hidden.</li>
          <li>· Fork PRs: the read-only token cannot post comments (see FAQ).</li>
        </ul>
        <p className="mt-4 text-sm text-muted">
          Want the same diff in the browser on two pasted schemas?{" "}
          <Link href="/sql-schema-diff" className="text-accent hover:text-accent-hover">
            Use Schema Diff →
          </Link>
        </p>
      </section>
    </ToolPageShell>
  );
}
