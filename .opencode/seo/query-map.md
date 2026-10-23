# Query map (50 searches)

From the plan in andrei saioc's (@asaio87) 2026-10-20 post: list what customers type, check what ranks, match the format, link-build, then iterate from Search Console.

"Format to beat" is the expected page-1 format, inferred from the 2026-10-20 AI answers. It is a hypothesis until each row is checked in Google manually. Do not treat it as measured.

Status: cover | gap | out of scope

## A. Core tool intent (1-10)

| # | Query | Intent | Format to beat | Our page | Status |
|---|---|---|---|---|---|
| 1 | postgres er diagram | tool | tool landing page | / | cover |
| 2 | postgresql er diagram | tool | tool landing page | / | cover |
| 3 | database diagram tool | tool | listicle | / | cover |
| 4 | free er diagram tool | tool | listicle | / | cover |
| 5 | er diagram generator from sql | tool | tool page | /visualize | cover |
| 6 | sql to er diagram | tool | tool page | /visualize | cover |
| 7 | database schema visualizer | tool | tool page | /visualize | cover |
| 8 | visualize postgres schema | tool | tutorial + tool | /blog/database-schema-diagram-tool | cover |
| 9 | postgres schema diagram | tool | tool page | / | cover |
| 10 | database schema diagram online | tool | tool page | /visualize | cover |

## B. Supabase (11-18)

| # | Query | Intent | Format to beat | Our page | Status |
|---|---|---|---|---|---|
| 11 | supabase schema diagram | tool | tool landing page | /supabase-er-diagram | cover (built 2026-10-20) |
| 12 | supabase er diagram | tool | tool landing page | /supabase-er-diagram | cover (built 2026-10-20) |
| 13 | supabase database diagram | tool | tool page | /supabase-er-diagram | cover (built 2026-10-20) |
| 14 | supabase visualizer | tool | tool page | /supabase-er-diagram | cover (built 2026-10-20) |
| 15 | supabase erd | tool | tool page | /supabase-er-diagram | cover (built 2026-10-20) |
| 16 | supabase rls check | tool | tool page | /supabase-rls-check | cover |
| 17 | supabase auth schema diagram | reference | schema reference page | /schema/supabase | cover |
| 18 | visualize supabase database | tool | tutorial + tool | /supabase-er-diagram | cover (built 2026-10-20) |

## C. Comparisons (19-26)

| # | Query | Intent | Format to beat | Our page | Status |
|---|---|---|---|---|---|
| 19 | dbdiagram alternative | compare | listicle | /alternatives | cover |
| 20 | dbdiagram.io alternative | compare | listicle | /alternatives | cover |
| 21 | chartdb alternative | compare | listicle or vs page | /chartdb-alternative | cover (built 2026-10-20) |
| 22 | drawsql alternative | compare | listicle or vs page | /drawsql-vs-dbdiagramr | cover |
| 23 | dbdiagram vs chartdb | compare | vs page | /chartdb-alternative | gap: no head-to-head rows |
| 24 | chartdb vs dbdiagram | compare | vs page | /chartdb-alternative | gap: same |
| 25 | pgadmin er diagram | compare | tutorial | none | gap |
| 26 | dbeaver er diagram | compare | tutorial | none | gap |

## D. Templates and reference schemas (27-38)

| # | Query | Intent | Format to beat | Our page | Status |
|---|---|---|---|---|---|
| 27 | stripe database schema | reference | schema diagram page | /schema/stripe | cover |
| 28 | stripe billing schema postgres | learn | tutorial | /schema/stripe | cover |
| 29 | ecommerce database schema postgres | reference | schema diagram page | /schema/ecommerce | cover |
| 30 | library management system er diagram | reference | diagram page | /schema/library-management-system | cover |
| 31 | hospital management system er diagram | reference | diagram page | /schema/hospital-management-system | cover |
| 32 | northwind database er diagram | reference | diagram page | /schema/northwind | cover |
| 33 | dvd rental er diagram | reference | diagram page | /schema/dvd-rental | cover |
| 34 | chinook database diagram | reference | diagram page | /schema/chinook | cover |
| 35 | multi tenant saas database schema | reference | diagram page | /schema/multi-tenant-saas | cover |
| 36 | rbac database schema | reference | diagram page | /schema/rbac | cover |
| 37 | laravel database schema diagram | reference | diagram page | /schema/laravel | cover |
| 38 | django auth database schema | reference | diagram page | /schema/django | cover |

## E. How-to (39-46)

| # | Query | Intent | Format to beat | Our page | Status |
|---|---|---|---|---|---|
| 39 | how to visualize postgres schema | learn | tutorial | /blog/database-schema-diagram-tool | cover |
| 40 | how to create er diagram from sql | learn | tutorial | /blog/database-schema-diagram-tool | cover |
| 41 | how to document database schema | learn | tutorial | /blog/database-schema-documentation | cover |
| 42 | postgres show table relationships | learn | tutorial | /blog/database-schema-diagram-tool | cover |
| 43 | information_schema vs pg_catalog | learn | explainer | /blog/information-schema-vs-pg-catalog | cover |
| 44 | supabase connection string ipv6 enotfound | fix | troubleshooting post | /blog/supabase-connection-string-ipv6-enotfound | cover |
| 45 | postgres connection string supabase neon railway | learn | reference post | /blog/postgres-connection-string-supabase-neon-railway | cover |
| 46 | database schema documentation drift | learn | explainer | /blog/database-schema-documentation | cover |

## F. Adjacent tools (47-50)

| # | Query | Intent | Format to beat | Our page | Status |
|---|---|---|---|---|---|
| 47 | sql to mermaid er diagram | tool | tool page | /sql-to-mermaid | cover |
| 48 | sql to prisma schema | tool | tool page | /sql-to-prisma | cover |
| 49 | prisma erd generator | tool | tool page | /prisma-erd-generator | cover |
| 50 | sql schema diff | tool | tool page | /sql-schema-diff | cover |

## Coverage check (2026-10-20)

GSC URL Inspection on all 58 sitemap URLs before the 2026-10-20 cleanup: **1 indexed**, **28 crawled - currently not indexed**, **27 unknown to Google**, **1 duplicate without user-selected canonical**, **1 timeout**. The duplicate was `/blog/django-auth-schema-explained`, whose Google-selected canonical was an external gambling domain; it is now 308-redirected to `/schema/django`, with the permission explanation moved onto that page. The sitemap is now 57 URLs.

## Score

- Cover: 46
- Gap: 4 (23-26)
- Out of scope: 0

## Highest-value gaps

1. **pgAdmin / DBeaver comparisons (25-26).** High-volume searchers who already have the database and are looking for a diagram. Both are "how do I see relationships in X" tutorials; we do not have one.
2. **dbdiagram vs chartdb head-to-head (23-24).** /chartdb-alternative is vendor-framed. Add a direct comparison block targeting the "vs" phrasing.

## Weekly loop (from the post)

1. Export Search Console queries for the last 28 days (Performance → Queries). Filter to positions 4-20: those are the pages worth editing, not new pages.
2. For each query in this map, check the actual page-1 format in an incognito Google search. Update the "Format to beat" column; it is currently inferred, not observed.
3. Edit the matching page to match the winning format and re-state the query in the H1 or first paragraph.
4. Add internal links from the two strongest pages to the page being refreshed.
5. Re-check the same 6 AI prompts on the 13th of each month and log the count in ai-seo-log.md.

Search Console is verified for `sc-domain:dbdiagramr.space`; use `~/Odyssey/Content/scripts/gsc/weekly.sh` for the 28-day query export.
