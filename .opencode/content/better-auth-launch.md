# Better Auth launch pack — corrected drafts

Internal working file for Wave 1. Everything here describes dbdiagramr as it
exists today. Facts verified 2026-10-20 against:

- Better Auth changelog and 1.7 upgrade guide (issuer identity, 1.7.0 → 1.7.3)
- `better-auth.com/docs/concepts/database`
- This repo: `data/schemas/betterauth.ts`, `/tools` (15 entries), `lib/plans.ts`
- `app/api/schema/route.ts` (pg_catalog queries, no body logging)

Corrections applied vs the first draft:

| Draft said | Corrected to |
|---|---|
| v1.8 beta adds issuer fields | **Stable 1.7.10 has no `issuer`**: identity is `(providerId, accountId)`. 1.7.0–1.7.2 briefly required `issuer`; 1.7.3 reverted it. 1.8 beta docs describe issuer, but the `main` source at 2026-10-20 still does not implement it. |
| 14 free SQL tools | 15 free tools |
| "3 things surprised me" | 4 things |
| "No signup, no limits, no catch" | Accurate: free plan is unlimited diagrams with no account (`lib/plans.ts`). Keep the claim. |
| route reads `information_schema` | route reads Postgres system catalogs (`pg_catalog`) |
| "Nothing is stored" | "We don't persist your connection string or schema" |

**Done:** `issuer` removed from `data/schemas/betterauth.ts` and the registry
intro/facts/FAQ now say `(providerId, accountId)` (2026-10-20).

---

## 1. Teardown #1: Better Auth

Existing canonical page: `https://www.dbdiagramr.space/schema/better-auth`
(already live and in the sitemap; do **not** create a second route).

### Page copy (Wave 2 may adopt the stronger title/meta)

```
URL:   /schema/better-auth (existing)
Title: Better Auth Database Schema: Every Table Explained (ER Diagram)
Meta:  Interactive ER diagram of Better Auth's Postgres schema: what the user,
       session, account and verification tables do, and the queries you'll need.
H1:    Better Auth's database schema, explained
```

**Intro:** Better Auth keeps your users in your own Postgres database, in four
core tables. Here is the full diagram, what each table does, and the details
that trip people up when writing raw SQL against it.

*[interactive diagram]*

**The tables**

- **user:** one row per person, with name, email, whether the email is verified,
  avatar image and timestamps.
- **session:** one row per signed-in device, with a unique token, expiry, IP
  address and user agent. It links to `user` through `userId`.
- **account:** one row per sign-in method linked to a user (Google, GitHub,
  email and password). It holds provider tokens and scope, plus the hashed
  password for email sign-in. Better Auth 1.7.x identifies the provider-side
  identity by the pair `(providerId, accountId)`; the row's own `id` is the
  local identifier used by account APIs.
- **verification:** short-lived tokens for email verification and password
  resets, made up of an identifier, a value and an expiry.

**Relationships:** one user has many sessions and many accounts. `verification`
stands alone.

**Four things worth knowing**

1. **The password lives in `account`, not `user`.** Email and password is
   treated as just another sign-in method, so one person can use Google, GitHub
   and a password without extra tables.
2. **`verification` has no foreign key to `user`.** It has to work before a user
   row exists, for example during sign-up.
3. **Sessions are database rows by default,** so you can revoke them on the
   server. "Sign out of all devices" is a single delete.
4. **`user` is a reserved word in Postgres.** If your generated columns use
   camelCase, raw SQL needs double quotes: `"user"`, `"userId"`, `"expiresAt"`.

**Version note:** this page documents stable Better Auth 1.7.x (verified
2026-10-20). Better Auth 1.7.0 briefly made `issuer` a required account column;
1.7.3 removed it again to keep 1.6 databases compatible, so current stable
identifies accounts by `(providerId, accountId)`. The v1.8 beta documentation
describes an issuer-based model; treat that as unreleased until it ships.

**Index check:** Postgres does not automatically index foreign-key columns.
Check whether your migration indexes the `userId` columns; if it does not:

```sql
create index if not exists session_user_id_idx on session ("userId");
create index if not exists account_user_id_idx on account ("userId");
```

**Queries you'll need**

```sql
-- Signed-in devices for one user
select id, "ipAddress", "userAgent", "createdAt", "expiresAt"
from session
where "userId" = $1 and "expiresAt" > now()
order by "createdAt" desc;

-- Sign a user out everywhere
delete from session where "userId" = $1;

-- Which sign-in methods a user has linked
select "providerId", "createdAt" from account where "userId" = $1;

-- Users with their active session count (note the quoted "user")
select u.id, u.email, count(s.id) as active_sessions
from "user" u
left join session s on s."userId" = u.id and s."expiresAt" > now()
group by u.id, u.email;

-- Clear expired verification tokens
delete from verification where "expiresAt" < now();
```

**Call to action:** See your own auth tables: paste your migration SQL or
connection string into dbdiagramr.

### X thread

Free X accounts are limited to 280 characters per post, so this is a thread.
Attach the diagram image to post 1 and tag Better Auth's official account.

```
1/ Better Auth runs on 4 Postgres tables. I diagrammed them, and 4 things surprised me.

2/ Your password isn't in the user table. It's in "account", because email/password is treated as just another sign-in method, same as Google or GitHub.

3/ "verification" has no foreign key to "user". It has to work before a user exists: sign-up, password resets.

4/ Sessions are plain rows by default, so "sign out everywhere" is one DELETE.

5/ No "issuer" column in stable 1.7.10: it was added in 1.7.0, then removed in 1.7.3. Accounts are keyed by (providerId, accountId).

Bonus trap: "user" is a reserved word in Postgres. Raw SQL needs it in quotes.

6/ Full interactive diagram + the queries you'll need: [link]
```

### LinkedIn carousel (7 slides)

```
1  Better Auth's database, explained in 7 slides
2  The 4 tables (diagram)
3  Passwords live in "account", not "user": every sign-in method is an account
4  "verification" stands alone: it works before a user exists
5  Sessions are rows you can revoke: "sign out everywhere" = one DELETE
6  Two traps: "user" is a reserved word, and Postgres doesn't index foreign keys for you
7  See your own schema in 10 seconds -> dbdiagramr.space (link in comments)
```

**Caption:** "I diagrammed the database behind Better Auth. Four tables, a few
design choices worth stealing, and two traps for anyone writing raw SQL. Full
interactive diagram in the comments."

### dev.to cross-post front matter

```
---
title: Better Auth's Database Schema, Explained
published: true
tags: postgres, database, authentication, nextjs
canonical_url: https://www.dbdiagramr.space/schema/better-auth
---
```

---

## 2. Launch copy

### Show HN

Hacker News rules: never ask anyone for upvotes. Post only after the schema page
and blog post are live.

**Title:** `Show HN: dbdiagramr – Interactive ER diagrams from a Postgres connection string`

**First comment:**

```
Hi HN. Database diagrams in wikis go stale after the next migration, so I built
one that's generated from what's actually deployed.

Paste a Postgres connection string (or CREATE TABLE statements) and you get an
interactive ER diagram in seconds. Hover a table to highlight its foreign keys,
press / to search tables and columns, export SVG or PNG.

How it works: the connection string goes to a stateless API route that reads the
Postgres system catalogs and returns JSON. We don't persist your connection
string or schema. Paste mode parses SQL entirely in the browser. It's MIT
licensed if you'd rather self-host: [GitHub link]

Supabase users: use the transaction pooler URL (port 6543). Direct connections
are IPv6-only and fail from serverless hosts.

Stack: Next.js, node-postgres, React Flow + dagre.

I'd especially like feedback on large schemas (100+ tables) and anything that
breaks on your setup.
```

### Peerlist Launchpad, DevHunt and Product Hunt

```
Tagline:      ER diagrams from your live Postgres database in seconds

Description:  Paste a Postgres connection string or CREATE TABLE SQL and get an
              interactive ER diagram. Hover to trace foreign keys, search with /,
              export SVG/PNG. No signup, we don't persist your schema, open
              source (MIT). Plus 15 free tools.

Maker comment: Hand-drawn schema diagrams are wrong the moment a migration lands.
               dbdiagramr reads your actual database, so the diagram is always
               current. Works with Supabase, Neon, Railway and any Postgres. I'd
               love to know what breaks, and what you'd want next.
```

---

## 3. X profile and first two weeks

**Bio:** `Building dbdiagramr: ER diagrams from your live Postgres database. Open source. Postgres & Supabase schema tips.`

**Posting plan:** one post per weekday. Upload images and videos directly to X
rather than linking out.

```
1 (pin it, attach your 30s demo video)
Paste a Postgres connection string. Get an interactive ER diagram in seconds.
No signup, open source.
I built dbdiagramr because hand-drawn schema diagrams lie after every migration.

2
Every team has a database diagram in a wiki that stopped being true months ago.
A wrong diagram is worse than none.
That's the problem I'm working on.

3 (attach a diagram with an unindexed FK highlighted)
Postgres does NOT automatically index foreign key columns.
If you filter or join on user_id a lot, check that it has an index.
Easiest way to find the missing ones: run a schema health check on your tables.

4
Supabase tip: if a database tool can't connect, you're probably using the direct
connection string.
Direct connections are IPv6-only. From serverless hosts, use the Transaction
pooler URL (port 6543).

5 Better Auth teardown thread (from section 1)

6
Postgres trap: "user" is a reserved word.
select * from user; -> syntax error
select * from "user"; -> works
Auth libraries love naming a table "user". Quote it.

7 (attach a screen recording of hover-to-trace)
Hover any table and every foreign key connection lights up.
Unrelated tables fade out.
The fastest way I've found to understand someone else's schema.

8 (attach a screenshot)
Free tool: paste CREATE TABLE statements, get TypeScript types or a Prisma schema.
Runs entirely in your browser. Nothing uploaded.
One of 15 free tools on dbdiagramr.

9
Which open-source app's database should I diagram next?
Top reply gets a full teardown: every table explained, interactive diagram,
the queries you'll need.

10 (every Friday)
Week [N] building dbdiagramr:
- [X] visitors, [Y] diagrams generated
- Shipped: [feature]
- Learned: [one honest lesson]
- Next: [feature]
```

---

## 4. Outreach templates

### Maintainer GitHub Discussion

Only use this for projects whose docs don't already include a schema diagram.

```
Title: Interactive ER diagram of [Project]'s database (free, for contributor docs)

Hi! I make dbdiagramr, an open-source Postgres ER diagram tool. While studying
[Project]'s schema I diagrammed it and wrote up how the core tables relate: [link]

If it would help new contributors, you're welcome to link it from your docs or
use the exported SVG directly, no strings attached. Happy to fix anything I got wrong.
```

### Awesome-list pull request

Match each list's section format and contribution rules.

```
- [dbdiagramr](https://www.dbdiagramr.space) - Interactive ER diagrams from a PostgreSQL connection string or SQL. Open source (MIT).
```

### Newsletter pitch (Postgres Weekly, Console.dev)

```
Subject: Better Auth's Postgres schema, explained (interactive diagram)

Hi [name],

I wrote a teardown of the four tables behind Better Auth: why passwords live in
the account table, why verification has no foreign key, and the quoting traps in
raw SQL: [link]

It's built with dbdiagramr, an open-source tool I make that generates ER diagrams
from a live Postgres database.

Thanks for considering it,
[Your name]
```

### Stack Overflow and Discord answers

Answer the question fully first. Where relevant, mention the built-in options
(pgAdmin, DBeaver), then add:

```
Disclosure: I built dbdiagramr, a free open-source tool that generates this
diagram from a connection string: [link]
```

---

## 5. GitHub repo setup

```
Description: Interactive ER diagrams from a PostgreSQL connection string or SQL. No signup. Open source.
Website:     https://www.dbdiagramr.space
Topics:      postgresql, postgres, er-diagram, erd, database-schema,
             schema-visualization, database-diagram, supabase, nextjs, react-flow
```

---

## Publishing checklist

- [ ] Wave 2 merged: diagram corrected (`issuer` removed, registry FAQ fixed), blog post live, schema page updated, "no limits" copy verified accurate
- [ ] OG images resolve on the live page
- [ ] Every claim dated and sourced
- [ ] dev.to canonical points at the schema page
- [ ] HN posted without an upvote request
- [ ] Affiliation disclosed in every community answer
- [ ] Prompt set v1 rerun 30 days after publishing
