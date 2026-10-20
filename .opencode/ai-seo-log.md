# AI SEO log — dbdiagramr

## 2026-10-13 · prompt set v1

Baseline: web-search proxy (agent cannot see assistant answers). For "best database
diagram tool" / "dbdiagram.io alternatives" / "generate ER diagram from live
Postgres", dbdiagramr is absent from every SERP checked. Sources assistants
rely on: dbdiagram.io, drawdb (GitHub, ~39.8k stars), ChartDB (~20k stars,
aggressive /alternatives pages), Lucidchart, SmartDraw, DrawSQL, QuickDBD,
ERDPlus, devart.com listicle, DbSchema blog, ER Flow alternatives pages,
pgAdmin docs. dbdiagramr wins its own brand queries and ranks #1 for
"Supabase schema diagram" (/schema/supabase). GitHub repo: 0 stars, 0 forks,
no topics. Pricing ($0/$8, 5 diagrams/mo) not present as text in homepage HTML
— Pricing.tsx section exists but is not imported in app/page.tsx.

Changes made: audit only, no code changes.
Re-measure on: 2026-11-13

## 2026-10-20 · prompt set v1, first measured run

Prompts run in ChatGPT and Perplexity (answers pasted by owner), 2026-10-20:

| Prompt | ChatGPT | Perplexity |
|---|---|---|
| Database diagram tool for an existing Postgres DB (free, open source, web) | dbdiagramr **#1** | absent |
| Best free ER diagram tools | absent | absent |
| dbdiagram.io alternatives | absent | absent |
| Visualize an existing Postgres schema | absent | absent (ChartDB) |
| Supabase schema diagram | absent | absent (ChartDB) |
| Live Supabase/Postgres ERD | dbdiagramr **#1** | absent (ChartDB) |

Baseline: ChatGPT 2/6, Perplexity 0/6.

Wrong claims in ChatGPT's answer about dbdiagramr: "Verify repository licence" (site is MIT), "Free to try" (free, no diagram limit, no account).

Sources the answers actually cited (outreach targets, validated live on 2026-10-20):
- Cited and editable: owox.com/blog/articles/database-diagram-design-tools (updated 2026-10-07), trevor.io/blog/top-7-entity-relationship-diagram-tools, airbyte.com/data-engineering-resources/relational-database-schema-design-tools, skyvia.com/blog/top-data-modeling-tools, wildandfreetools.com, enlisted.directory, github.com/Wolfsrudel/awesome-list-database-tools, alternativeto.net.
- Cited but not editable: chartdb.io, dbschema.com, devart.com, erstudio.com, bytebase.com, erflow.io, holistics.io (owns dbdiagram.io), supabase partner catalog (application only).
- Cited but dead: atlassian.com/data/databases/7-free-database-diagramming-tools (404).

None of the cited pages mention dbdiagramr in their roundups (checked owox, trevor, airbyte, skyvia).

Changes made: homepage states open source (MIT) in hero and footer; SoftwareApplication JSON-LD added with price 0, MIT licence, codeRepository; llms.txt now links GitHub and MIT.
Re-measure on: 2026-11-13.

## 2026-10-20 · second pass: query map, ChartDB page, real contact routes

- Added `.opencode/seo/query-map.md`: 50 customer searches, expected page-1 format, our URL, and 10 gaps. Built from andrei saioc's SEO process post (list queries, study intent, match format, link-build, iterate on Search Console).
- Built `/chartdb-alternative`: direct comparison (query-and-paste import vs direct connection), FAQPage + Article + breadcrumb JSON-LD, linked from /alternatives and sitemap.
- Contact routes resolved without a branded email: OWOX (@owoxbi / LinkedIn / form), Trevor (ella@trevor.io / @trevor_io), Airbyte (@AirbyteHQ), Skyvia (@SkyviaService / support@skyvia.com), Enlisted (enlisteddirectory@gmail.com), awesome list (PR), AlternativeTo (account), Supabase (/partners#become-a-partner).
- Reference schema count corrected to 16 in the outreach kit.
- Still blocked: Search Console not verified for dbdiagramr.space, so the weekly query refresh has no data source.
