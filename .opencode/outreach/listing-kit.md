# dbdiagramr listing kit

Use these exact facts when pitching directories and roundups. Verified 2026-10-20.

## Core facts

- Name: dbdiagramr
- URL: https://www.dbdiagramr.space
- Category: database diagram / ER diagram tool
- Price: free, no diagram limit, no account
- Licence: MIT, source at https://github.com/VarunKvK/dbdiagramr
- Reads: live PostgreSQL and Supabase schemas over the connection string, or pasted SQL
- PostgreSQL system catalogs (`pg_catalog`), metadata only, no row data
- Connection string sent for one request, then discarded; not stored
- Output: interactive diagram, SVG and PNG export, table search, foreign-key tracing
- Extra: per-table Row Level Security status on live connections
- Reference diagrams: 18 PostgreSQL schemas at https://www.dbdiagramr.space/schema
- Free utilities: 15 at https://www.dbdiagramr.space/tools
- Contact: X https://x.com/im_daedalus

## One-liner (40 words)

dbdiagramr turns a PostgreSQL or Supabase connection string into an interactive ER diagram in seconds. Free, no signup, no diagram limit, MIT licensed. Paste SQL or connect live, search tables, trace foreign keys, export SVG or PNG.

## Short entry (100 words)

dbdiagramr is a free, open-source (MIT) browser tool for visualising an existing PostgreSQL database. Paste a connection string and it reads the schema from `pg_catalog` and renders an interactive ER diagram in about ten seconds: tables, columns, primary and foreign keys. Search tables, hover to trace relationships, check per-table Row Level Security status, and export SVG or PNG. Paste-SQL mode parses in the browser. No signup, no diagram limit, and the connection string is used for one request and discarded. Also has reference diagrams for 18 popular schemas, including Supabase auth and Better Auth.

## Differentiators to use

- Against dbdiagram.io: no DBML to write, no email, no 10-diagram cap; it reads the database you already have.
- Against ChartDB: no metadata query to copy and run; connect directly and the diagram appears.
- Against DBeaver / pgAdmin: browser-based, nothing to install, shareable link.
- Against DrawDB: for existing databases, not drawing from scratch.

## Assets

- 1200x630: https://www.dbdiagramr.space/og/blog/betterauth-schema-explained.png (example; replace with a product screenshot if asked)
- 1800x945: https://www.dbdiagramr.space/BetterAuth-DbDiagramr-OG.png
- Live demo: https://www.dbdiagramr.space/visualize
- Supabase-specific redirect: https://www.dbdiagramr.space/supabase-schema-diagram

## Suggested table row

| dbdiagramr | Visualise an existing PostgreSQL/Supabase database | Yes, direct connection | Yes (MIT) | Free, unlimited, no account | Web |
