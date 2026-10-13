# PR Schema Diff & ER Diagram

A zero-config GitHub Action that comments a **schema diff + migration preview + Mermaid ER diagram** on every PR that touches SQL migration files.

**No database. No Neon account. No API keys.** It parses your migration files at the base and head commits — nothing is executed.

## What the comment looks like

```
## 📊 Schema diff
_Migration files changed: **2** (1 added, 1 modified) — `8a3f21c` → `c91d04e`._

| Change    | Table      | Details              |
|-----------|------------|----------------------|
| ➕ added   | `comments` | 5 columns            |
| ✏️ changed | `users`    | +1 col (email)       |

💾 Migration preview (review before running)   ← ALTER TABLE statements + safety notes
🗺️ ER diagram (head)                          ← renders natively on GitHub
```

Re-pushes **update the same comment** (sticky) — no notification spam.

## Usage

```yaml
# .github/workflows/schema-diff.yml
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
          fetch-depth: 0   # required: the action reads the base commit
      - uses: VarunKvK/dbdiagramr/actions/pr-schema-diff-erd@main
```

### Inputs

| Input | Default | Description |
|---|---|---|
| `migrations-path` | `**/migrations/**/*.sql` | Glob matching your SQL migration files |
| `github-token` | `${{ github.token }}` | Token used to create/update the comment |

### Outputs

| Output | Values |
|---|---|
| `changed` | `true` if migration files changed, else `false` |

## How it works

1. Diffs the PR's base and head commits for files matching the glob.
2. Parses all matching files at both commits into a schema (best-effort, PostgreSQL DDL — `CREATE TABLE`, `ALTER TABLE`, constraints).
3. Structurally diffs the two schemas: added/removed tables, added/removed/changed columns, FK changes, PK changes.
4. Emits a migration preview (`ALTER TABLE …`) with safety notes (backfill warnings for `NOT NULL` without default, dependent warnings before `DROP`).
5. Renders the head schema as a Mermaid `erDiagram`.
6. Creates one comment, then updates it on every push.

## Limitations (v1)

- PostgreSQL DDL only. MySQL/SQLite dialects are not supported yet.
- `.sql` files only — ORM migrations (knex/prisma `.js`) are ignored.
- Files are parsed in sorted-filename order as one cumulative script; keep migration filenames sortable (`001_…`, `2026-01-01-…`).
- Best-effort parser: warnings are surfaced in the comment, not hidden.

## Development

```bash
npm install
npm test        # build + fixture tests (render comment for 4 migration pairs)
npm run build   # bundle dist/index.js + dist/cli.js
node dist/cli.js <baseDir> <headDir>   # render a comment locally
```

The parser, diff engine, and Mermaid emitter are vendored from [dbdiagramr](https://www.dbdiagramr.space) (`lib/sql/parsePostgres.ts`, `lib/sql/diffSchemas.ts`, `lib/schemaExport.ts`).

---

Free tool by [dbdiagramr](https://www.dbdiagramr.space) — paste your PostgreSQL connection string, get an interactive ER diagram in 10 seconds. ⭐ [Star the repo](https://github.com/VarunKvK/dbdiagramr).
