# dbdiagramr

> **Paste your PostgreSQL connection string. Get a beautiful, interactive ER diagram in seconds.**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-dbdiagramr.space-indigo?style=flat-square)](https://www.dbdiagramr.space)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/VarunKvK/dbdiagramr?style=flat-square&logo=github)](https://github.com/VarunKvK/dbdiagramr/stargazers)

![Screenshot of dbdiagramr showing an interactive ER diagram](https://www.dbdiagramr.space/DbDiagramr-OG.png)

**[Try it live →](https://www.dbdiagramr.space/visualize)** — No signup. Paste a connection string, see your schema in under 10 seconds.

---

## Why dbdiagramr?

Every team has a stale database diagram in a wiki — drawn by hand months ago, wrong the moment a migration landed. A wrong diagram is worse than none.

dbdiagramr solves the drift problem by **introspecting your live database**. No hand-drawing, no DBML to maintain, no manual re-export from pgAdmin. Paste the same connection string after any migration and you have a truthful diagram in 10 seconds.

```
You → paste connection string → dbdiagramr queries information_schema → interactive SVG diagram
                                          ↑
                                     always reflects what's actually deployed
```

## Features

| Feature | Details |
|---|---|
| **Instant** | Connects to your PostgreSQL database and generates a diagram in under 10 seconds |
| **Interactive** | Pan, zoom, drag tables, hover to trace foreign key relationships |
| **Secure** | Your connection string is never stored — introspected and discarded immediately. No row data is read, only schema structure. |
| **Shareable** | Export as SVG/PNG or share an interactive link (Pro) |
| **Self-hostable** | Open source (MIT). Run it yourself or use the hosted version. |
| **Any Postgres** | Works with Supabase, Neon, Railway, or any PostgreSQL provider. Handles transaction pooler (port 6543). |

## Quick Start

### Hosted (Easiest)

Visit **[dbdiagramr.space](https://www.dbdiagramr.space)** → paste your connection string → done.

> **Supabase users:** In your dashboard, click **Connect** → select **Transaction pooler** (port 6543) → copy that URL. Direct connections are IPv6-only and will fail from serverless hosts.

### Self-hosted

```bash
git clone https://github.com/VarunKvK/dbdiagramr
cd dbdiagramr
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and paste your connection string.

## Schema Library

Explore real database schemas before connecting your own — every table, column, and foreign key visualized:

- [Supabase auth](https://www.dbdiagramr.space/schema/supabase) — 7 tables (auth.users, identities, sessions…)
- [NextAuth.js / Auth.js](https://www.dbdiagramr.space/schema/nextauth) — 4 tables (users, accounts, sessions…)
- [Laravel 11](https://www.dbdiagramr.space/schema/laravel) — 7 tables (users, sessions, jobs…)
- [Django auth](https://www.dbdiagramr.space/schema/django) — 9 tables (auth_user, groups, permissions…)

Want another schema added? [Open an issue](https://github.com/VarunKvK/dbdiagramr/issues).

## How It Compares

|  | dbdiagramr | dbdiagram.io / DrawSQL | pgAdmin / DBeaver | Raw SQL |
|---|---|---|---|---|
| Setup | 10 seconds | 30 min of DBML / dragging | Click → image | Instant but no picture |
| Always up to date? | Yes (re-introspect) | No — drifts | Manual re-export | Yes but unreadable |
| Interactive? | Yes | Yes | Partly | No |
| Free? | Free tier + $8 Pro | Free tier | Free | Free |

Full comparisons: [dbdiagram.io vs dbdiagramr](https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr) | [DrawSQL vs dbdiagramr](https://www.dbdiagramr.space/drawsql-vs-dbdiagramr)

## Tech Stack

- **Next.js 14** + TypeScript
- **Tailwind CSS**
- **PostgreSQL** (`pg`) for schema introspection via `information_schema`
- **@xyflow/react** + **dagre** for interactive diagram rendering
- **SVG** — no Canvas, no proprietary dependencies

## Contributing

Issues and PRs welcome. This is a solo indie project built in public — a star helps more than you think.

```bash
npm run dev        # start dev server
npm run build      # production build
npm run seo:run    # SEO audit pipeline
```

## License

MIT — see [LICENSE](LICENSE).

---

Built by [@im_daedalus](https://x.com/im_daedalus) · [Live Demo](https://www.dbdiagramr.space) · [Schema Library](https://www.dbdiagramr.space/schema) · [Report a Bug](https://github.com/VarunKvK/dbdiagramr/issues)
