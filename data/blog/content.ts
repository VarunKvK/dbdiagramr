// Blog post bodies as HTML strings (converted from markdown drafts in Odyssey/Content/Blogs).
// Keep each body self-contained: headings, tables, code blocks, FAQ.

export const blogBodies: Record<string, string> = {
  "visualize-postgres-schema-5-ways": `
    <h2>The short version</h2>
    <p>Your Postgres schema is perfectly readable to the database and almost unreadable to a human. The tables, columns, and foreign keys you need are spread across <code>pg_catalog</code>, <code>information_schema</code>, and a few hundred lines of migration SQL. Visualization means collapsing all of that into a picture you can actually reason about.</p>
    <p>There are five practical ways to get there. They are not equivalent. Each makes a different trade between speed, depth, and how current the diagram stays.</p>

    <h2>The five ways at a glance</h2>
    <table>
      <thead><tr><th>Method</th><th>Setup</th><th>Interactive</th><th>Stays current</th><th>Best for</th></tr></thead>
      <tbody>
        <tr><td><code>psql</code> + <code>pg_catalog</code></td><td>Zero</td><td>No</td><td>Always (it's live)</td><td>Quick inspection</td></tr>
        <tr><td>IDE built-ins (pgAdmin, DBeaver)</td><td>Already installed</td><td>Partly</td><td>Snapshot, manual re-run</td><td>One-off look</td></tr>
        <tr><td>Manual diagramming (draw.io, dbdiagram.io)</td><td>Short</td><td>Yes</td><td>Drifts (you maintain it)</td><td>Designing a new schema</td></tr>
        <tr><td>Migrations → DDL (Prisma, Rails)</td><td>Medium</td><td>No</td><td>Re-run on change</td><td>Documenting from code</td></tr>
        <tr><td>Live connection string (dbdiagramr)</td><td>None (paste URL)</td><td>Yes</td><td>Regenerate in 10 seconds</td><td>Understanding a real DB</td></tr>
      </tbody>
    </table>

    <h2>1. psql and pg_catalog: the baseline</h2>
    <p>The fastest text-only view is <code>psql</code>. <code>\\dt</code> lists all tables, <code>\\d table_name</code> shows one table's structure including its foreign keys. To see every relationship in one shot, query <code>information_schema</code> directly:</p>
    <pre><code>SELECT tc.table_name, kcu.column_name,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';</code></pre>
    <p>Precise and always available. But it's a list, not a picture. Past a dozen tables you're reconstructing the graph in your head, which is exactly what visualization is supposed to remove.</p>

    <h2>2. IDE built-ins: pgAdmin, DBeaver, DataGrip</h2>
    <p>If you already have a GUI client, it probably ships with an ER diagram generator:</p>
    <ul>
      <li><strong>pgAdmin 4</strong>: right-click the database → <em>ERD For Database</em>. Free, already installed. Auto-layout struggles past a few dozen tables.</li>
      <li><strong>DBeaver</strong> (Community is enough): open the <em>ER Diagram</em> tab. Genuinely free, cross-platform, exports PNG/SVG.</li>
      <li><strong>DataGrip</strong>: <em>Diagrams → Show Visualization</em>. Best interactive feel; paid, single-user.</li>
    </ul>
    <p>The honest limitation they all share: <strong>any IDE-based diagram is a snapshot</strong>. Nothing to share but an exported image, and it drifts the moment someone runs a migration.</p>

    <h2>3. Manual diagramming: draw.io, dbdiagram.io, DrawSQL</h2>
    <p>Great for designing a schema you haven't built yet. dbdiagram.io and DrawSQL are excellent editors — write DBML or drag tables, get a clean diagram.</p>
    <p>The catch is <strong>drift</strong>. The diagram is a hand-made copy at one moment in time. The day someone adds a column or foreign key, the diagram is wrong. A wrong diagram is worse than none, because people trust it. Building it takes 30 minutes to an hour, and it's stale the moment a migration lands. Use these when you're <em>designing</em>. They struggle to <em>document a real schema over time</em>.</p>

    <h2>4. Generate from your migrations</h2>
    <p>If your schema lives in migration files (Prisma, Drizzle, Rails, Flyway), derive structure from code instead of a live connection:</p>
    <pre><code>pg_dump --schema-only mydb &gt; schema.sql</code></pre>
    <p>Then feed the DDL to any SQL-to-diagram tool. This documents the migrations, not necessarily what's actually deployed. Regenerating on every change is automation you have to build and maintain.</p>

    <h2>5. Paste a live connection string: the "always current in 10 seconds" option</h2>
    <p>Point a tool at the <strong>real database</strong> and let it introspect the schema itself. No schema code, no hand-arranging, nothing to keep in sync. The diagram <em>is</em> what's in your database right now.</p>
    <p>That's what <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> does. You paste a PostgreSQL connection string and it queries <code>information_schema</code> for tables, columns, primary keys, and foreign keys, then renders an interactive ER diagram you can pan, zoom, drag, and export as SVG or PNG. Because it introspects the live database, there's no drift — change a migration, paste the same string again, up-to-date in under 10 seconds.</p>
    <p>Not sure what an ER diagram looks like yet? The <a href="https://www.dbdiagramr.space/schema">schema library</a> has live diagrams of Supabase, NextAuth.js, Laravel, and Django schemas you can explore before connecting your own database.</p>

    <h2>Why you should care about "stays current"</h2>
    <p>Every method above the last one shares the same failure mode: the diagram is a snapshot, and keeping it current is your problem. Walk into any team that's been around a while and you'll find a "schema diagram" in a wiki from eight months ago. A wrong diagram is worse than none — it's confidently wrong.</p>
    <p>The test that settles it: <strong>how much work does it take to make this picture true again?</strong> If the answer is "re-export from my IDE" or "drag the boxes by hand," humans will stop doing it and the diagram will lie to you.</p>

    <h2>FAQ</h2>
    <p><strong>What's the easiest way to generate an ER diagram from a Postgres database?</strong><br/>If you have a GUI client open, its built-in diagram is fastest. For a shareable diagram that matches your database <em>as it is right now</em>, a live-introspection tool is fastest because there's nothing to maintain.</p>
    <p><strong>Can I create a Postgres ERD without connecting to the live database?</strong><br/>Yes. Run <code>pg_dump --schema-only</code> and feed the DDL to a SQL-to-diagram tool, or parse migration files. Safer when you can't expose production credentials.</p>
    <p><strong>How do I keep a schema diagram up to date?</strong><br/>Manual tools require manual regeneration, so they drift. The reliable fix is introspection: regenerate straight from the live database or wire documentation generation into CI.</p>
    <p><strong>Does pgAdmin make ER diagrams?</strong><br/>Yes. pgAdmin 4 includes an ERD tool — right-click the database → <em>ERD For Database</em>, or <em>Tools → ERD Tool</em>. Free and built in, best on small-to-medium schemas.</p>

    <h2>How to choose</h2>
    <ul>
      <li>Just want a quick look? <code>psql</code> or your IDE's built-in diagram. Fast, local, gone tomorrow.</li>
      <li>Designing a new schema? draw.io, dbdiagram.io, or DrawSQL are the right tools.</li>
      <li>Need to <em>understand a database that already exists</em>, or document one that keeps changing? Introspect the live schema.</li>
    </ul>
  `,
  "postgres-connection-string-supabase-neon-railway": `
    <h2>The short version</h2>
    <p>A PostgreSQL connection string is a single URL that tells a client how to reach your database. It looks like this:</p>
    <pre><code>postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghij.supabase.co:5432/postgres</code></pre>
    <p>Every provider builds on the same format, and the differences that trip people up are almost never the syntax. They're the <strong>port and host</strong> your provider hands you. Supabase alone has three different strings for the same database, and two of them won't work from serverless apps.</p>

    <h2>Anatomy of a connection string</h2>
    <pre><code>postgresql://  user  :  password   @     host        :  port  /  database
     |          |         |              |              |          |
  protocol    username  secret         server        port       db name</code></pre>
    <table>
      <thead><tr><th>Part</th><th>Example</th><th>Notes</th></tr></thead>
      <tbody>
        <tr><td>Protocol</td><td><code>postgresql://</code></td><td><code>postgres://</code> also works</td></tr>
        <tr><td>User</td><td><code>postgres</code></td><td>In Supabase: <code>postgres.[project-ref]</code> on pooler URLs</td></tr>
        <tr><td>Password</td><td><code>[your-password]</code></td><td>URL-encode special chars (<code>@</code> → <code>%40</code>)</td></tr>
        <tr><td>Host</td><td><code>db.xxxx.supabase.co</code></td><td>Provider-specific</td></tr>
        <tr><td>Port</td><td><code>5432</code></td><td><strong>6543 = transaction pooler</strong></td></tr>
        <tr><td>Database</td><td><code>postgres</code></td><td>Default database name</td></tr>
      </tbody>
    </table>
    <p>You can append query parameters: <code>?sslmode=require</code> (force TLS) and <code>?channel_binding=require</code>.</p>

    <h2>Supabase: three strings for one database</h2>
    <p>Supabase is where most people hit the wall, because the <em>right</em> string depends on where your code runs:</p>
    <table>
      <thead><tr><th>Mode</th><th>Host</th><th>Port</th><th>Best for</th></tr></thead>
      <tbody>
        <tr><td><strong>Direct</strong></td><td><code>db.[project-ref].supabase.co</code></td><td><code>5432</code></td><td>Migrations, <code>pg_dump</code>, long-lived backend</td></tr>
        <tr><td><strong>Shared pooler (session)</strong></td><td><code>aws-[region].pooler.supabase.com</code></td><td><code>5432</code></td><td>Persistent backend on IPv4</td></tr>
        <tr><td><strong>Shared pooler (transaction)</strong></td><td><code>aws-[region].pooler.supabase.com</code></td><td><strong><code>6543</code></strong></td><td><strong>Serverless / edge / short-lived connections</strong></td></tr>
      </tbody>
    </table>
    <pre><code># Direct
postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres

# Shared pooler session mode
postgres://postgres.[project-ref]:[YOUR-PASSWORD]@aws-[REGION].pooler.supabase.com:5432/postgres

# Shared pooler transaction mode (the one most apps want)
postgres://postgres.[project-ref]:[YOUR-PASSWORD]@aws-[REGION].pooler.supabase.com:6543/postgres</code></pre>
    <p><strong>The gotcha:</strong> direct connections run on <strong>IPv6</strong>. On an IPv4-only network you get <code>ENOTFOUND</code>, not a friendly error. The shared pooler is IPv4-only and fixes it. For serverless (Vercel, edge, Lambda) use <strong>transaction mode (port 6543)</strong>.</p>
    <p>This is why tools like <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> ask for the <em>transaction pooler</em> URL — otherwise the connection silently fails from IPv4-only hosts.</p>

    <h2>Neon: pooled vs direct</h2>
    <pre><code># Pooled (through PgBouncer, use by default)
postgresql://user:pass@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Direct
postgresql://user:pass@ep-cool-rain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require</code></pre>
    <p>Rule of thumb: use the <code>-pooler</code> host unless you have a specific reason not to. Grab both from the <em>Connect</em> button in the Neon dashboard.</p>

    <h2>Railway: the plain standard</h2>
    <pre><code>postgresql://postgres:[YOUR-PASSWORD]@[host].railway.app:5432/railway</code></pre>
    <p>No pooler decision — textbook format, easiest to read and to misplace a password in. Store in <code>DATABASE_URL</code>, never in code.</p>

    <h2>All the formats in one table</h2>
    <table>
      <thead><tr><th>Provider</th><th>Connection string shape</th></tr></thead>
      <tbody>
        <tr><td>Standard / Railway</td><td><code>postgresql://user:pass@host:5432/db</code></td></tr>
        <tr><td>Supabase (direct)</td><td><code>postgresql://postgres:pass@db.[ref].supabase.co:5432/postgres</code></td></tr>
        <tr><td>Supabase (session)</td><td><code>postgres://postgres.[ref]:pass@aws-[region].pooler.supabase.com:5432/postgres</code></td></tr>
        <tr><td>Supabase (transaction)</td><td><code>postgres://postgres.[ref]:pass@aws-[region].pooler.supabase.com:6543/postgres</code></td></tr>
        <tr><td>Neon (pooled)</td><td><code>postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/db?sslmode=require</code></td></tr>
        <tr><td>Neon (direct)</td><td><code>postgresql://user:pass@ep-xxx.region.aws.neon.tech/db?sslmode=require</code></td></tr>
      </tbody>
    </table>

    <h2>Gotchas that will actually bite you</h2>
    <ul>
      <li><strong>IPv4 vs IPv6.</strong> Supabase direct is IPv6. IPv4-only hosts get <code>ENOTFOUND</code>. The pooler strings are IPv4 and sidestep it.</li>
      <li><strong>Serverless wants the transaction pooler.</strong> Long-lived backends can hold a connection; serverless functions open one per invocation. Session pooling chokes; transaction pooling (port <strong>6543</strong>) exists for it.</li>
      <li><strong>A connection string is a secret.</strong> Password in plain text. Never commit it, never paste into a shared doc. Most good tools never store it beyond one request.</li>
      <li><strong>URL-encode passwords.</strong> A password with <code>@</code>, <code>:</code>, or <code>/</code> breaks the URL. Encode those.</li>
    </ul>
    <p>Curious what that pooler URL contains after it connects? The <a href="https://www.dbdiagramr.space/schema/supabase">Supabase auth schema diagram</a> was created by introspecting a live Supabase database through a transaction pooler string.</p>

    <h2>FAQ</h2>
    <p><strong>What is a PostgreSQL connection string?</strong><br/>A single URL with everything needed to reach a Postgres database: protocol, username, password, host, port, and database name.</p>
    <p><strong>Should I use a direct connection or a pooler?</strong><br/>Persistent backend → direct is fine. Serverless/edge → use a pooler (Supabase transaction mode port 6543 or Neon <code>-pooler</code> host).</p>
    <p><strong>Why does my Supabase connection fail with ENOTFOUND?</strong><br/>You're using the direct string over IPv4, and Supabase's direct endpoint is IPv6. Switch to a shared pooler string.</p>
    <p><strong>Is my connection string a secret?</strong><br/>Yes — password in plain text. Keep in environment variables, rotate if leaked, only hand to tools that won't store it.</p>
  `,
  "supabase-auth-schema-explained": `
    <h2>The short version</h2>
    <p>Supabase stores auth in a separate <code>auth</code> schema — not your <code>public</code> schema. Every user has exactly <strong>one row in <code>auth.users</code></strong>, one or more rows in <strong><code>auth.identities</code></strong> (one per login provider), and can hold <strong>multiple active <code>auth.sessions</code></strong>, each backed by a <code>refresh_tokens</code> row. If you've seen tables you didn't create, these are the ones.</p>
    <pre><code>auth.users 1───* auth.identities
auth.users 1───* auth.sessions
auth.sessions 1───* auth.refresh_tokens</code></pre>

    <h2>Why an <code>auth</code> schema at all</h2>
    <p>Supabase keeps auth separate from your app's tables. Your <code>public</code> schema is where your models live; <code>auth</code> is locked down and managed by GoTrue. You read from it, you don't write to it. That separation is why your migrations never touch these tables — and why introspecting a Supabase database shows a schema you didn't write.</p>

    <h2>The four tables that matter</h2>
    <p><strong><code>auth.users</code> — one row per user.</strong></p>
    <table>
      <thead><tr><th>Column</th><th>What it holds</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>UUID PK; stable identifier</td></tr>
        <tr><td><code>email</code> / <code>phone</code></td><td>Contact + login identity</td></tr>
        <tr><td><code>encrypted_password</code></td><td>Bcrypt hash (email/password only)</td></tr>
        <tr><td><code>raw_app_meta_data</code></td><td>Provider claims: <code>provider</code>, <code>providers</code>, <code>email</code></td></tr>
        <tr><td><code>raw_user_meta_data</code></td><td>Custom metadata you set</td></tr>
        <tr><td><code>is_sso_user</code></td><td>True when sign-in came via SSO</td></tr>
        <tr><td><code>confirmed_at</code></td><td>When primary identity was confirmed</td></tr>
      </tbody>
    </table>
    <p><strong><code>auth.identities</code> — one row per login method.</strong> Email <strong>and</strong> GitHub = two rows. <code>provider_id</code> is the provider's identifier; <code>identity_data</code> is the raw claim payload. FK <code>user_id → users.id</code>.</p>
    <p><strong><code>auth.sessions</code> — a browser/token session.</strong> One per device roughly. <code>aal</code>, <code>user_agent</code>, <code>ip</code>, <code>not_after</code>, <code>factor_id</code> (MFA).</p>
    <p><strong><code>auth.refresh_tokens</code> — the long-lived token backing a session.</strong> Access tokens ~1h (JWT). Refresh tokens are long, with <code>revoked</code> flag and <code>parent</code> for token reuse detection.</p>

    <h2>How they relate (the joins you'll actually write)</h2>
    <pre><code>select u.email, i.provider, s.id as session_id
from auth.users u
join auth.identities i on i.user_id = u.id
join auth.sessions  s on s.user_id = u.id;</code></pre>
    <p>The 80% case: "who is signed in, through which provider, on which sessions." Every relationship is a plain foreign key — <code>identities.user_id</code>, <code>sessions.user_id</code>, <code>refresh_tokens.session_id</code> — exactly what a diagram turns into readable arrows. Paste a read-only connection string into <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> to trace them visually.</p>

    <h2>What's usually NOT your business</h2>
    <p><code>auth.instances</code>, <code>auth.audit_log_entries</code>, and <code>auth.schema_migrations</code> are Supabase bookkeeping. <code>audit_log_entries</code> records admin actions; <code>instances</code> is multi-tenancy plumbing. If a diagram shows them, ignore them — your reads live in the other four.</p>

    <h2>Practical tips</h2>
    <ul>
      <li><strong>Never write to <code>auth</code> tables directly.</strong> Use the Supabase client / Admin API. Direct inserts create orphaned identities, unhashed passwords.</li>
      <li><strong>Foreign-key joins work across schemas.</strong> <code>auth.users.id</code> is the same UUID you'd use in <code>public</code> — join <code>public.profiles.user_id → auth.users.id</code>.</li>
      <li><strong>A user with no identity row is a sign of trouble.</strong> Every normal user has at least one. Orphaned identities without a users row = import bug.</li>
      <li><strong>Sessions accumulate.</strong> Many sessions per user isn't a leak, it's devices and tabs.</li>
    </ul>
    <p>See it live: the <a href="https://www.dbdiagramr.space/schema/supabase">Supabase auth schema diagram</a> was generated by introspecting a live database — users, identities, sessions, and refresh_tokens with foreign keys rendered as relationships.</p>

    <h2>FAQ</h2>
    <p><strong>Where is the Supabase auth schema?</strong><br/>In the <code>auth</code> schema, separate from <code>public</code> — <code>auth.users</code>, <code>auth.identities</code>, <code>auth.sessions</code>, <code>auth.refresh_tokens</code>, plus internal tables.</p>
    <p><strong>What is <code>auth.users</code> used for?</strong><br/>Single source of truth for who can sign in. One row per user, with email/phone, password hash, metadata, and provider flags.</p>
    <p><strong>Why does one user have multiple identities?</strong><br/>Each login method is a separate <code>auth.identities</code> row. Email + GitHub + Google = three rows, all pointing at the same <code>users.id</code>.</p>
    <p><strong>What's the difference between a session and a refresh token?</strong><br/>Session is device/token context; refresh token is the long-lived credential that renews the short-lived JWT. One session maps to one refresh token chain.</p>
    <p><strong>Can I join auth tables to my public tables?</strong><br/>Yes — use <code>auth.users.id</code> as the join key with your <code>public.*</code> tables.</p>
  `,
  "what-is-an-er-diagram": `
    <h2>The short version</h2>
    <p>An <strong>entity-relationship (ER) diagram</strong> is a picture of your database structure. Each <strong>entity</strong> (table) is a box, each <strong>attribute</strong> (column) is a row inside it, and each <strong>relationship</strong> (foreign key) is a line between boxes. Cardinality markers tell you whether one row relates to one or many. If you can read those three elements, you can read any ER diagram.</p>

    <h2>What an ER diagram shows</h2>
    <table>
      <thead><tr><th>Symbol</th><th>Meaning</th><th>In PostgreSQL</th></tr></thead>
      <tbody>
        <tr><td>Box / entity</td><td>A table</td><td><code>CREATE TABLE users</code></td></tr>
        <tr><td>Rows inside box</td><td>Columns + types</td><td><code>id uuid PRIMARY KEY</code></td></tr>
        <tr><td>PK badge</td><td>Primary key</td><td>Unique row identifier</td></tr>
        <tr><td>FK badge</td><td>Foreign key</td><td>Reference to another table</td></tr>
        <tr><td>Line with crow's foot</td><td>One-to-many relationship</td><td><code>REFERENCES users(id)</code></td></tr>
      </tbody>
    </table>

    <h2>The three relationship types</h2>
    <p><strong>One-to-many (1:N)</strong> — the most common. One user has many orders. The "many" side holds the foreign key: <code>orders.user_id → users.id</code>. Drawn as a line with a crow's foot (three prongs) on the many end.</p>
    <p><strong>Many-to-many (M:N)</strong> — via a join table. Users and groups need <code>user_groups(user_id, group_id)</code>. Django's <code>auth_user_groups</code> is a classic example. The join table has two foreign keys.</p>
    <p><strong>One-to-one (1:1)</strong> — rare, usually a vertical split. <code>users</code> and <code>profiles</code> where each user has exactly one profile. Enforced by a <code>UNIQUE</code> on the foreign key.</p>

    <h2>How to read an ER diagram in 60 seconds</h2>
    <ol>
      <li><strong>Find the core entity.</strong> Usually <code>users</code> — most lines point to it.</li>
      <li><strong>Follow the FK lines.</strong> Each line is a <code>FOREIGN KEY</code> you could write as a <code>JOIN</code>.</li>
      <li><strong>Check cardinality.</strong> Crow's foot = many. No crow's foot = one.</li>
      <li><strong>Look for join tables.</strong> Two FKs, often just two columns + PK = M:N.</li>
      <li><strong>Read PKs first.</strong> The PK tells you what makes a row unique.</li>
    </ol>
    <p>Example: In the <a href="https://www.dbdiagramr.space/schema/supabase">Supabase auth diagram</a>, <code>auth.users</code> is the core. Lines radiate to <code>identities</code> and <code>sessions</code> — one user, many identities and many sessions. Each line is a foreign key you can follow with a query.</p>

    <h2>Why ER diagrams matter for PostgreSQL</h2>
    <p>PostgreSQL doesn't show you relationships — <code>\\d</code> shows one table at a time, <code>information_schema</code> is a wall of text. An ER diagram collapses that into one picture where you can see at a glance: which tables exist, how they connect, where the join tables are, and what you'd need to <code>JOIN</code> to answer a question.</p>
    <p>Live-introspected diagrams (like <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a>) guarantee the picture matches production — no drift, no hand-updating. Paste a connection string, get the truth.</p>

    <h2>FAQ</h2>
    <p><strong>What is an ER diagram?</strong><br/>A visual map of a database: boxes are tables, rows are columns, lines are foreign key relationships with cardinality (one-to-many, etc.).</p>
    <p><strong>What does the crow's foot mean?</strong><br/>It marks the "many" end of a relationship. A line from <code>users</code> to <code>orders</code> with a crow's foot at <code>orders</code> means one user can have many orders.</p>
    <p><strong>What's the difference between ER diagram and schema diagram?</strong><br/>They're the same thing in practice. "Schema diagram" emphasizes the PostgreSQL schema; "ER diagram" emphasizes the entity-relationship model. Both show tables, columns, and foreign keys.</p>
    <p><strong>How do I make an ER diagram from a PostgreSQL database?</strong><br/>Use <code>pgAdmin</code>'s ERD tool for a quick snapshot, or paste your connection string into a live-introspection tool to generate an interactive diagram in 10 seconds.</p>
  `,
  "stripe-billing-schema-postgres": `
    <h2>The short version</h2>
    <p>If you sync Stripe into your own database (or are building Stripe-like billing), you need 9 tables: <code>customers</code>, <code>products</code>, <code>prices</code>, <code>subscriptions</code>, <code>subscription_items</code>, <code>invoices</code>, <code>invoice_line_items</code>, <code>payment_methods</code>, and <code>payment_intents</code>. Customers own everything; subscriptions compose prices; invoices snapshot what was billed; payment intents move the money. This is the full Stripe billing model as PostgreSQL.</p>

    <h2>The 9 tables and how they connect</h2>
    <table>
      <thead><tr><th>Table</th><th>What it holds</th><th>Key FK</th></tr></thead>
      <tbody>
        <tr><td><code>customers</code></td><td>Who pays (email, name, balance)</td><td>— (core)</td></tr>
        <tr><td><code>products</code></td><td>What you sell (name, active)</td><td>—</td></tr>
        <tr><td><code>prices</code></td><td>How much + how often (unit_amount, interval)</td><td><code>product_id → products.id</code></td></tr>
        <tr><td><code>subscriptions</code></td><td>A customer's recurring purchase</td><td><code>customer_id → customers.id</code></td></tr>
        <tr><td><code>subscription_items</code></td><td>Each price in a subscription (quantity)</td><td><code>subscription_id, price_id</code></td></tr>
        <tr><td><code>invoices</code></td><td>A bill for a period</td><td><code>customer_id, subscription_id</code></td></tr>
        <tr><td><code>invoice_line_items</code></td><td>Line on an invoice</td><td><code>invoice_id, price_id</code></td></tr>
        <tr><td><code>payment_methods</code></td><td>Card / bank on file</td><td><code>customer_id</code></td></tr>
        <tr><td><code>payment_intents</code></td><td>An attempt to charge</td><td><code>customer_id, invoice_id, payment_method_id</code></td></tr>
      </tbody>
    </table>

    <h2>The billing flow as joins</h2>
    <pre><code>-- What is this customer subscribed to, at what price?
select c.email, pr.name as product, p.unit_amount, si.quantity
from customers c
join subscriptions s on s.customer_id = c.id
join subscription_items si on si.subscription_id = s.id
join prices p on p.id = si.price_id
join products pr on pr.id = p.product_id
where s.status = 'active';

-- Unpaid invoices with their payment attempt
select i.id, i.amount_due, pi.status as payment_status
from invoices i
left join payment_intents pi on pi.invoice_id = i.id
where i.status != 'paid';</code></pre>

    <h2>Design details worth copying</h2>
    <ul>
      <li><strong>Prices, not products, are what you bill.</strong> One product ("Pro Plan") can have many prices ($10/mo, $100/yr). Subscriptions reference prices, not products directly.</li>
      <li><strong>Subscription items allow multi-product subscriptions.</strong> One subscription can contain multiple prices (base + add-on) with independent quantities.</li>
      <li><strong>Invoices are snapshots.</strong> <code>invoice_line_items</code> copies price and amount at invoice time — even if the price later changes, the invoice stays truthful.</li>
      <li><strong>Payment intents are the audit trail.</strong> Every charge attempt is a row, even failed ones. Join to invoices to see what was paid and what wasn't.</li>
    </ul>
    <p>See it visually: the <a href="https://www.dbdiagramr.space/schema/stripe">Stripe billing schema diagram</a> renders all 9 tables with foreign keys as navigable relationships — the same picture you'd get introspecting a live Stripe-synced database.</p>

    <h2>FAQ</h2>
    <p><strong>What tables does a Stripe billing schema need?</strong><br/>9 tables: customers, products, prices, subscriptions, subscription_items, invoices, invoice_line_items, payment_methods, and payment_intents.</p>
    <p><strong>Should subscriptions reference products or prices?</strong><br/>Prices. A product is a catalog entry; a price is a purchasable variant (amount + interval). Subscriptions are composed of subscription_items that each reference a price.</p>
    <p><strong>How does Stripe handle multiple products in one subscription?</strong><br/>Through <code>subscription_items</code> — one row per price in the subscription, each with its own quantity. One subscription, many items.</p>
    <p><strong>What's the difference between an invoice and a payment intent?</strong><br/>An invoice is a bill (what is owed). A payment intent is an attempt to collect it (what was charged, status, method). One invoice can have multiple payment intents (retries).</p>
  `,
  "ecommerce-database-schema-postgres": `
    <h2>The short version</h2>
    <p>Every online store is the same 11 tables with different CSS. <code>customers</code> have <code>addresses</code> and <code>carts</code>; carts hold <code>cart_items</code> that reference <code>products</code>; products belong to <code>categories</code> and have <code>product_images</code>; orders snapshot cart items into <code>order_items</code> and collect <code>payments</code>; <code>reviews</code> link customers to products. This is the PostgreSQL schema behind Shopify, WooCommerce, and most custom storefronts.</p>

    <h2>The 11 tables at a glance</h2>
    <table>
      <thead><tr><th>Table</th><th>Purpose</th><th>Key FK</th></tr></thead>
      <tbody>
        <tr><td><code>customers</code></td><td>Who shops</td><td>— (core)</td></tr>
        <tr><td><code>addresses</code></td><td>Where to ship/bill</td><td><code>customer_id</code></td></tr>
        <tr><td><code>categories</code></td><td>Catalog taxonomy (self-referential)</td><td><code>parent_id → categories.id</code></td></tr>
        <tr><td><code>products</code></td><td>What you sell</td><td><code>category_id</code></td></tr>
        <tr><td><code>product_images</code></td><td>Product photos</td><td><code>product_id</code></td></tr>
        <tr><td><code>carts</code></td><td>Active shopping session</td><td><code>customer_id</code></td></tr>
        <tr><td><code>cart_items</code></td><td>Mutable cart lines</td><td><code>cart_id, product_id</code></td></tr>
        <tr><td><code>orders</code></td><td>Placed order (snapshot)</td><td><code>customer_id, shipping/billing address</code></td></tr>
        <tr><td><code>order_items</code></td><td>Immutable order lines</td><td><code>order_id, product_id</code></td></tr>
        <tr><td><code>payments</code></td><td>Payment attempt</td><td><code>order_id</code></td></tr>
        <tr><td><code>reviews</code></td><td>Post-purchase feedback</td><td><code>product_id, customer_id</code></td></tr>
      </tbody>
    </table>

    <h2>The three flows</h2>
    <p><strong>Browse → cart:</strong> Customer browses <code>products</code> (joined to <code>categories</code> and <code>product_images</code>), adds to <code>carts</code> via <code>cart_items</code>. Cart is mutable — quantities change, items are removed.</p>
    <p><strong>Cart → order:</strong> At checkout, cart items are <em>copied</em> into <code>order_items</code> as an immutable snapshot. Even if the product price later changes, the order preserves what was actually purchased. The <code>orders</code> row records total, addresses, and timestamps (<code>placed_at, paid_at, shipped_at</code>).</p>
    <p><strong>Order → payment → review:</strong> <code>payments</code> records each charge attempt against the order. After fulfillment, <code>reviews</code> lets the customer rate the product.</p>
    <pre><code>-- Order history with items and payment status
select o.id, o.status, o.total_cents, p.status as payment_status,
       oi.quantity, pr.title
from orders o
join order_items oi on oi.order_id = o.id
join products pr on pr.id = oi.product_id
left join payments p on p.order_id = o.id
where o.customer_id = $1
order by o.placed_at desc;</code></pre>

    <h2>Design decisions that matter</h2>
    <ul>
      <li><strong>Cart vs order: mutable vs immutable.</strong> <code>cart_items</code> can change; <code>order_items</code> never should. Copy, don't move, at checkout.</li>
      <li><strong>Addresses are separate from customers.</strong> One customer has many addresses (home, work). Orders reference specific address rows so the address at order time is preserved even if the customer later moves.</li>
      <li><strong>Categories are self-referential.</strong> <code>categories.parent_id → categories.id</code> builds a tree (Electronics → Phones → Cases) without a separate hierarchy table.</li>
      <li><strong>Prices in cents as integers.</strong> Avoid floating-point rounding. <code>price_cents integer</code> with a <code>currency</code> column is the safe default.</li>
    </ul>
    <p>Explore it: the <a href="https://www.dbdiagramr.space/schema/ecommerce">e-commerce schema diagram</a> renders all 11 tables with foreign keys you can hover to trace — the same view you'd get introspecting a live store database.</p>

    <h2>FAQ</h2>
    <p><strong>What tables does an e-commerce database need?</strong><br/>11 tables: customers, addresses, categories, products, product_images, carts, cart_items, orders, order_items, payments, and reviews.</p>
    <p><strong>What is the difference between cart_items and order_items?</strong><br/>Cart items are mutable until checkout. Order items are immutable snapshots copied at order time, preserving price and product as purchased.</p>
    <p><strong>Should I store prices as float or integer?</strong><br/>Integer cents. Float rounding corrupts money. Store <code>price_cents integer</code> and divide by 100 only at display time.</p>
    <p><strong>How do categories handle subcategories?</strong><br/>Self-referential foreign key: <code>categories.parent_id → categories.id</code>. Top-level categories have <code>parent_id = NULL</code>; children point at their parent.</p>
  `,
};
