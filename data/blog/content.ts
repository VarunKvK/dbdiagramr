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
    <p>Great for designing a schema you haven't built yet. dbdiagram.io and DrawSQL are excellent editors -- write DBML or drag tables, get a clean diagram.</p>
    <p>The catch is <strong>drift</strong>. The diagram is a hand-made copy at one moment in time. The day someone adds a column or foreign key, the diagram is wrong. A wrong diagram is worse than none, because people trust it. Building it takes 30 minutes to an hour, and it's stale the moment a migration lands. Use these when you're <em>designing</em>. They struggle to <em>document a real schema over time</em>.</p>

    <h2>4. Generate from your migrations</h2>
    <p>If your schema lives in migration files (Prisma, Drizzle, Rails, Flyway), derive structure from code instead of a live connection:</p>
    <pre><code>pg_dump --schema-only mydb &gt; schema.sql</code></pre>
    <p>Then feed the DDL to any SQL-to-diagram tool. This documents the migrations, not necessarily what's actually deployed. Regenerating on every change is automation you have to build and maintain.</p>

    <h2>5. Paste a live connection string: the "always current in 10 seconds" option</h2>
    <p>Point a tool at the <strong>real database</strong> and let it introspect the schema itself. No schema code, no hand-arranging, nothing to keep in sync. The diagram <em>is</em> what's in your database right now.</p>
    <p>That's what <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> does. You paste a PostgreSQL connection string and it queries <code>information_schema</code> for tables, columns, primary keys, and foreign keys, then renders an interactive ER diagram you can pan, zoom, drag, and export as SVG or PNG. Because it introspects the live database, there's no drift -- change a migration, paste the same string again, up-to-date in under 10 seconds.</p>
    <p>Not sure what an ER diagram looks like yet? The <a href="https://www.dbdiagramr.space/schema">schema library</a> has live diagrams of Supabase, NextAuth.js, Laravel, and Django schemas you can explore before connecting your own database.</p>

    <h2>Why you should care about "stays current"</h2>
    <p>Every method above the last one shares the same failure mode: the diagram is a snapshot, and keeping it current is your problem. Walk into any team that's been around a while and you'll find a "schema diagram" in a wiki from eight months ago. A wrong diagram is worse than none -- it's confidently wrong.</p>
    <p>The test that settles it: <strong>how much work does it take to make this picture true again?</strong> If the answer is "re-export from my IDE" or "drag the boxes by hand," humans will stop doing it and the diagram will lie to you.</p>

    <h2>FAQ</h2>
    <p><strong>What's the easiest way to generate an ER diagram from a Postgres database?</strong><br/>If you have a GUI client open, its built-in diagram is fastest. For a shareable diagram that matches your database <em>as it is right now</em>, a live-introspection tool is fastest because there's nothing to maintain.</p>
    <p><strong>Can I create a Postgres ERD without connecting to the live database?</strong><br/>Yes. Run <code>pg_dump --schema-only</code> and feed the DDL to a SQL-to-diagram tool, or parse migration files. Safer when you can't expose production credentials.</p>
    <p><strong>How do I keep a schema diagram up to date?</strong><br/>Manual tools require manual regeneration, so they drift. The reliable fix is introspection: regenerate straight from the live database or wire documentation generation into CI.</p>
    <p><strong>Does pgAdmin make ER diagrams?</strong><br/>Yes. pgAdmin 4 includes an ERD tool -- right-click the database → <em>ERD For Database</em>, or <em>Tools → ERD Tool</em>. Free and built in, best on small-to-medium schemas.</p>

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
    <p>This is why tools like <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> ask for the <em>transaction pooler</em> URL -- otherwise the connection silently fails from IPv4-only hosts.</p>

    <h2>Neon: pooled vs direct</h2>
    <pre><code># Pooled (through PgBouncer, use by default)
postgresql://user:pass@ep-cool-rain-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require

# Direct
postgresql://user:pass@ep-cool-rain-123456.us-east-2.aws.neon.tech/neondb?sslmode=require</code></pre>
    <p>Rule of thumb: use the <code>-pooler</code> host unless you have a specific reason not to. Grab both from the <em>Connect</em> button in the Neon dashboard.</p>

    <h2>Railway: the plain standard</h2>
    <pre><code>postgresql://postgres:[YOUR-PASSWORD]@[host].railway.app:5432/railway</code></pre>
    <p>No pooler decision -- textbook format, easiest to read and to misplace a password in. Store in <code>DATABASE_URL</code>, never in code.</p>

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
    <p><strong>Is my connection string a secret?</strong><br/>Yes -- password in plain text. Keep in environment variables, rotate if leaked, only hand to tools that won't store it.</p>
  `,
  "supabase-auth-schema-explained": `
    <h2>The short version</h2>
    <p>Supabase stores auth in a separate <code>auth</code> schema -- not your <code>public</code> schema. Every user has exactly <strong>one row in <code>auth.users</code></strong>, one or more rows in <strong><code>auth.identities</code></strong> (one per login provider), and can hold <strong>multiple active <code>auth.sessions</code></strong>, each backed by a <code>refresh_tokens</code> row. If you've seen tables you didn't create, these are the ones.</p>
    <pre><code>auth.users 1───* auth.identities
auth.users 1───* auth.sessions
auth.sessions 1───* auth.refresh_tokens</code></pre>

    <h2>Why an <code>auth</code> schema at all</h2>
    <p>Supabase keeps auth separate from your app's tables. Your <code>public</code> schema is where your models live; <code>auth</code> is locked down and managed by GoTrue. You read from it, you don't write to it. That separation is why your migrations never touch these tables -- and why introspecting a Supabase database shows a schema you didn't write.</p>

    <h2>The four tables that matter</h2>
    <p><strong><code>auth.users</code> -- one row per user.</strong></p>
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
    <p><strong><code>auth.identities</code> -- one row per login method.</strong> Email <strong>and</strong> GitHub = two rows. <code>provider_id</code> is the provider's identifier; <code>identity_data</code> is the raw claim payload. FK <code>user_id → users.id</code>.</p>
    <p><strong><code>auth.sessions</code> -- a browser/token session.</strong> One per device roughly. <code>aal</code>, <code>user_agent</code>, <code>ip</code>, <code>not_after</code>, <code>factor_id</code> (MFA).</p>
    <p><strong><code>auth.refresh_tokens</code> -- the long-lived token backing a session.</strong> Access tokens ~1h (JWT). Refresh tokens are long, with <code>revoked</code> flag and <code>parent</code> for token reuse detection.</p>

    <h2>How they relate (the joins you'll actually write)</h2>
    <pre><code>select u.email, i.provider, s.id as session_id
from auth.users u
join auth.identities i on i.user_id = u.id
join auth.sessions  s on s.user_id = u.id;</code></pre>
    <p>The 80% case: "who is signed in, through which provider, on which sessions." Every relationship is a plain foreign key -- <code>identities.user_id</code>, <code>sessions.user_id</code>, <code>refresh_tokens.session_id</code> -- exactly what a diagram turns into readable arrows. Paste a read-only connection string into <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> to trace them visually.</p>

    <h2>What's usually NOT your business</h2>
    <p><code>auth.instances</code>, <code>auth.audit_log_entries</code>, and <code>auth.schema_migrations</code> are Supabase bookkeeping. <code>audit_log_entries</code> records admin actions; <code>instances</code> is multi-tenancy plumbing. If a diagram shows them, ignore them -- your reads live in the other four.</p>

    <h2>Practical tips</h2>
    <ul>
      <li><strong>Never write to <code>auth</code> tables directly.</strong> Use the Supabase client / Admin API. Direct inserts create orphaned identities, unhashed passwords.</li>
      <li><strong>Foreign-key joins work across schemas.</strong> <code>auth.users.id</code> is the same UUID you'd use in <code>public</code> -- join <code>public.profiles.user_id → auth.users.id</code>.</li>
      <li><strong>A user with no identity row is a sign of trouble.</strong> Every normal user has at least one. Orphaned identities without a users row = import bug.</li>
      <li><strong>Sessions accumulate.</strong> Many sessions per user isn't a leak, it's devices and tabs.</li>
    </ul>
    <p>See it live: the <a href="https://www.dbdiagramr.space/schema/supabase">Supabase auth schema diagram</a> was generated by introspecting a live database -- users, identities, sessions, and refresh_tokens with foreign keys rendered as relationships.</p>

    <h2>FAQ</h2>
    <p><strong>Where is the Supabase auth schema?</strong><br/>In the <code>auth</code> schema, separate from <code>public</code> -- <code>auth.users</code>, <code>auth.identities</code>, <code>auth.sessions</code>, <code>auth.refresh_tokens</code>, plus internal tables.</p>
    <p><strong>What is <code>auth.users</code> used for?</strong><br/>Single source of truth for who can sign in. One row per user, with email/phone, password hash, metadata, and provider flags.</p>
    <p><strong>Why does one user have multiple identities?</strong><br/>Each login method is a separate <code>auth.identities</code> row. Email + GitHub + Google = three rows, all pointing at the same <code>users.id</code>.</p>
    <p><strong>What's the difference between a session and a refresh token?</strong><br/>Session is device/token context; refresh token is the long-lived credential that renews the short-lived JWT. One session maps to one refresh token chain.</p>
    <p><strong>Can I join auth tables to my public tables?</strong><br/>Yes -- use <code>auth.users.id</code> as the join key with your <code>public.*</code> tables.</p>
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
    <p><strong>One-to-many (1:N)</strong> -- the most common. One user has many orders. The "many" side holds the foreign key: <code>orders.user_id → users.id</code>. Drawn as a line with a crow's foot (three prongs) on the many end.</p>
    <p><strong>Many-to-many (M:N)</strong> -- via a join table. Users and groups need <code>user_groups(user_id, group_id)</code>. Django's <code>auth_user_groups</code> is a classic example. The join table has two foreign keys.</p>
    <p><strong>One-to-one (1:1)</strong> -- rare, usually a vertical split. <code>users</code> and <code>profiles</code> where each user has exactly one profile. Enforced by a <code>UNIQUE</code> on the foreign key.</p>

    <h2>How to read an ER diagram in 60 seconds</h2>
    <ol>
      <li><strong>Find the core entity.</strong> Usually <code>users</code> -- most lines point to it.</li>
      <li><strong>Follow the FK lines.</strong> Each line is a <code>FOREIGN KEY</code> you could write as a <code>JOIN</code>.</li>
      <li><strong>Check cardinality.</strong> Crow's foot = many. No crow's foot = one.</li>
      <li><strong>Look for join tables.</strong> Two FKs, often just two columns + PK = M:N.</li>
      <li><strong>Read PKs first.</strong> The PK tells you what makes a row unique.</li>
    </ol>
    <p>Example: In the <a href="https://www.dbdiagramr.space/schema/supabase">Supabase auth diagram</a>, <code>auth.users</code> is the core. Lines radiate to <code>identities</code> and <code>sessions</code> -- one user, many identities and many sessions. Each line is a foreign key you can follow with a query.</p>

    <h2>Why ER diagrams matter for PostgreSQL</h2>
    <p>PostgreSQL doesn't show you relationships -- <code>\\d</code> shows one table at a time, <code>information_schema</code> is a wall of text. An ER diagram collapses that into one picture where you can see at a glance: which tables exist, how they connect, where the join tables are, and what you'd need to <code>JOIN</code> to answer a question.</p>
    <p>Live-introspected diagrams (like <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a>) guarantee the picture matches production -- no drift, no hand-updating. Paste a connection string, get the truth.</p>

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
        <tr><td><code>customers</code></td><td>Who pays (email, name, balance)</td><td>-- (core)</td></tr>
        <tr><td><code>products</code></td><td>What you sell (name, active)</td><td>--</td></tr>
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
      <li><strong>Invoices are snapshots.</strong> <code>invoice_line_items</code> copies price and amount at invoice time -- even if the price later changes, the invoice stays truthful.</li>
      <li><strong>Payment intents are the audit trail.</strong> Every charge attempt is a row, even failed ones. Join to invoices to see what was paid and what wasn't.</li>
    </ul>
    <p>See it visually: the <a href="https://www.dbdiagramr.space/schema/stripe">Stripe billing schema diagram</a> renders all 9 tables with foreign keys as navigable relationships -- the same picture you'd get introspecting a live Stripe-synced database.</p>

    <h2>FAQ</h2>
    <p><strong>What tables does a Stripe billing schema need?</strong><br/>9 tables: customers, products, prices, subscriptions, subscription_items, invoices, invoice_line_items, payment_methods, and payment_intents.</p>
    <p><strong>Should subscriptions reference products or prices?</strong><br/>Prices. A product is a catalog entry; a price is a purchasable variant (amount + interval). Subscriptions are composed of subscription_items that each reference a price.</p>
    <p><strong>How does Stripe handle multiple products in one subscription?</strong><br/>Through <code>subscription_items</code> -- one row per price in the subscription, each with its own quantity. One subscription, many items.</p>
    <p><strong>What's the difference between an invoice and a payment intent?</strong><br/>An invoice is a bill (what is owed). A payment intent is an attempt to collect it (what was charged, status, method). One invoice can have multiple payment intents (retries).</p>
  `,
  "ecommerce-database-schema-postgres": `
    <h2>The short version</h2>
    <p>Every online store is the same 11 tables with different CSS. <code>customers</code> have <code>addresses</code> and <code>carts</code>; carts hold <code>cart_items</code> that reference <code>products</code>; products belong to <code>categories</code> and have <code>product_images</code>; orders snapshot cart items into <code>order_items</code> and collect <code>payments</code>; <code>reviews</code> link customers to products. This is the PostgreSQL schema behind Shopify, WooCommerce, and most custom storefronts.</p>

    <h2>The 11 tables at a glance</h2>
    <table>
      <thead><tr><th>Table</th><th>Purpose</th><th>Key FK</th></tr></thead>
      <tbody>
        <tr><td><code>customers</code></td><td>Who shops</td><td>-- (core)</td></tr>
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
    <p><strong>Browse → cart:</strong> Customer browses <code>products</code> (joined to <code>categories</code> and <code>product_images</code>), adds to <code>carts</code> via <code>cart_items</code>. Cart is mutable -- quantities change, items are removed.</p>
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
    <p>Explore it: the <a href="https://www.dbdiagramr.space/schema/ecommerce">e-commerce schema diagram</a> renders all 11 tables with foreign keys you can hover to trace -- the same view you'd get introspecting a live store database.</p>

    <h2>FAQ</h2>
    <p><strong>What tables does an e-commerce database need?</strong><br/>11 tables: customers, addresses, categories, products, product_images, carts, cart_items, orders, order_items, payments, and reviews.</p>
    <p><strong>What is the difference between cart_items and order_items?</strong><br/>Cart items are mutable until checkout. Order items are immutable snapshots copied at order time, preserving price and product as purchased.</p>
    <p><strong>Should I store prices as float or integer?</strong><br/>Integer cents. Float rounding corrupts money. Store <code>price_cents integer</code> and divide by 100 only at display time.</p>
    <p><strong>How do categories handle subcategories?</strong><br/>Self-referential foreign key: <code>categories.parent_id → categories.id</code>. Top-level categories have <code>parent_id = NULL</code>; children point at their parent.</p>
  `,

  "nextauth-auth-schema-explained": `
    <h2>The short version</h2>
    <p>NextAuth (Auth.js) creates 4 tables in your database: <code>users</code>, <code>accounts</code>, <code>sessions</code>, and <code>verification_tokens</code>. The <code>users</code> and <code>accounts</code> tables have a one-to-one relationship via <code>accounts.user_id</code>. Sessions link to users via <code>sessions.user_id</code>. Verification tokens are short-lived and self-cleaning.</p>

    <h2>The 4 tables</h2>
    <h3>users</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>text / UUID</td><td>Primary key. Generated by NextAuth.</td></tr>
        <tr><td><code>name</code></td><td>text</td><td>Display name from the OAuth provider.</td></tr>
        <tr><td><code>email</code></td><td>text</td><td>User's email. May be null if the provider doesn't share it.</td></tr>
        <tr><td><code>email_verified</code></td><td>timestamp</td><td>When the email was verified. Null if never verified.</td></tr>
        <tr><td><code>image</code></td><td>text</td><td>Profile picture URL from the provider.</td></tr>
        <tr><td><code>created_at</code></td><td>timestamp</td><td>When the user first signed in.</td></tr>
        <tr><td><code>updated_at</code></td><td>timestamp</td><td>Last profile sync from the provider.</td></tr>
      </tbody>
    </table>

    <h3>accounts</h3>
    <p>Links a user to an OAuth provider. One user can have multiple accounts (Google + GitHub).</p>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>text / UUID</td><td>Primary key.</td></tr>
        <tr><td><code>user_id</code></td><td>text</td><td>Foreign key → <code>users.id</code>.</td></tr>
        <tr><td><code>provider</code></td><td>text</td><td><code>"google"</code>, <code>"github"</code>, <code>"discord"</code>, etc.</td></tr>
        <tr><td><code>provider_account_id</code></td><td>text</td><td>The provider's unique ID for this user.</td></tr>
        <tr><td><code>access_token</code></td><td>text</td><td>OAuth access token (encrypted in production).</td></tr>
        <tr><td><code>refresh_token</code></td><td>text</td><td>OAuth refresh token (encrypted in production).</td></tr>
        <tr><td><code>expires_at</code></td><td>integer</td><td>When the access token expires (Unix timestamp).</td></tr>
      </tbody>
    </table>

    <h3>sessions</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>text / UUID</td><td>Primary key.</td></tr>
        <tr><td><code>session_token</code></td><td>text</td><td>The session token stored in the user's cookie.</td></tr>
        <tr><td><code>user_id</code></td><td>text</td><td>Foreign key → <code>users.id</code>.</td></tr>
        <tr><td><code>expires</code></td><td>timestamp</td><td>When this session expires.</td></tr>
      </tbody>
    </table>

    <h3>verification_tokens</h3>
    <p>Short-lived tokens for email verification and password reset. Self-cleaning.</p>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>identifier</code></td><td>text</td><td>Email or user ID the token is for.</td></tr>
        <tr><td><code>token</code></td><td>text</td><td>The actual token value.</td></tr>
        <tr><td><code>expires</code></td><td>timestamp</td><td>When this token expires.</td></tr>
      </tbody>
    </table>

    <h2>How they connect</h2>
    <p><code>users → accounts</code> is one-to-one per provider. <code>users → sessions</code> is one-to-many (different devices). <code>verification_tokens</code> is temporary and doesn't have a foreign key.</p>

    <h2>FAQ</h2>
    <p><strong>Does NextAuth store passwords?</strong><br/>No. NextAuth is OAuth-first. If you need email/password, use <code>next-auth/providers/credentials</code> with bcrypt.</p>
    <p><strong>Can I add custom fields to the users table?</strong><br/>Yes. Add columns directly. NextAuth ignores columns it doesn't know about.</p>
    <p><strong>What happens when a user deletes their account?</strong><br/>NextAuth doesn't cascade deletes. Manually delete from <code>users</code>, <code>accounts</code>, and <code>sessions</code>.</p>
  `,

  "laravel-database-schema-explained": `
    <h2>The short version</h2>
    <p>A fresh Laravel install creates 7-8 tables depending on your packages. The core ones are <code>users</code>, <code>password_resets</code>, <code>failed_jobs</code>, and <code>personal_access_tokens</code>. The <code>cache</code>, <code>sessions</code>, <code>jobs</code>, and <code>batches</code> tables are only created if you run the corresponding Artisan commands.</p>

    <h2>The core tables</h2>
    <h3>users</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>bigint (PK)</td><td>Auto-incrementing primary key.</td></tr>
        <tr><td><code>name</code></td><td>varchar(255)</td><td>User's display name.</td></tr>
        <tr><td><code>email</code></td><td>varchar(255)</td><td>Unique email address.</td></tr>
        <tr><td><code>email_verified_at</code></td><td>timestamp</td><td>When email was verified. Null if unverified.</td></tr>
        <tr><td><code>password</code></td><td>varchar(255)</td><td>Hashed password (bcrypt). Never store plain text.</td></tr>
        <tr><td><code>remember_token</code></td><td>varchar(100)</td><td>Token for "remember me" functionality.</td></tr>
      </tbody>
    </table>

    <h3>password_resets</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>email</code></td><td>varchar(255)</td><td>The email requesting a reset.</td></tr>
        <tr><td><code>token</code></td><td>varchar(255)</td><td>The reset token (hashed).</td></tr>
        <tr><td><code>created_at</code></td><td>timestamp</td><td>When the token was generated.</td></tr>
      </tbody>
    </table>

    <h3>failed_jobs</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>bigint (PK)</td><td>Auto-incrementing ID.</td></tr>
        <tr><td><code>uuid</code></td><td>varchar(255)</td><td>Unique identifier for the job.</td></tr>
        <tr><td><code>connection</code></td><td>text</td><td>Queue connection that failed.</td></tr>
        <tr><td><code>queue</code></td><td>varchar</td><td>Which queue the job was on.</td></tr>
        <tr><td><code>payload</code></td><td>longText</td><td>The job's serialized data.</td></tr>
        <tr><td><code>exception</code></td><td>longText</td><td>The full exception stack trace.</td></tr>
      </tbody>
    </table>

    <h3>personal_access_tokens</h3>
    <p>Created by Laravel Sanctum for API token authentication.</p>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>bigint (PK)</td><td>Auto-incrementing ID.</td></tr>
        <tr><td><code>tokenable_type</code></td><td>varchar(255)</td><td>The model this token belongs to.</td></tr>
        <tr><td><code>tokenable_id</code></td><td>bigint</td><td>The ID of that model.</td></tr>
        <tr><td><code>name</code></td><td>varchar(255)</td><td>Token name (e.g., "Mobile App").</td></tr>
        <tr><td><code>token</code></td><td>varchar(60)</td><td>The hashed token value.</td></tr>
        <tr><td><code>abilities</code></td><td>text</td><td>JSON array of allowed abilities.</td></tr>
      </tbody>
    </table>

    <h2>Optional tables</h2>
    <p><code>sessions</code> -- created by <code>php artisan session:table</code>. <code>cache</code> -- created by <code>php artisan cache:table</code>. <code>jobs</code> -- created by <code>php artisan queue:table</code>. <code>batches</code> -- created by <code>php artisan queue:batches-table</code>. None are created by default.</p>

    <h2>FAQ</h2>
    <p><strong>Does Laravel create all these tables automatically?</strong><br/>No. Only <code>users</code>, <code>password_resets</code>, and <code>failed_jobs</code> are created by <code>php artisan migrate</code>.</p>
    <p><strong>Can I use Redis instead of the database tables?</strong><br/>Yes. Switch your <code>.env</code> driver to <code>redis</code> for sessions, cache, and queues.</p>
    <p><strong>What's the difference between <code>password_resets</code> and <code>password_reset_tokens</code>?</strong><br/>Same table, different names. Laravel 8+ renamed it to <code>password_reset_tokens</code>.</p>
  `,

  "django-auth-schema-explained": `
    <h2>The short version</h2>
    <p>Django creates 5 core auth tables: <code>auth_user</code>, <code>auth_group</code>, <code>auth_permission</code>, <code>django_content_type</code>, and two join tables (<code>auth_user_groups</code>, <code>auth_group_permissions</code>). The permission system is built on content types -- each model gets a default <code>add</code>, <code>change</code>, <code>delete</code>, and <code>view</code> permission.</p>

    <h2>The core tables</h2>
    <h3>auth_user</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>int (PK)</td><td>Auto-incrementing primary key.</td></tr>
        <tr><td><code>password</code></td><td>varchar(128)</td><td>Hashed password (PBKDF2 by default).</td></tr>
        <tr><td><code>last_login</code></td><td>datetime</td><td>When the user last logged in.</td></tr>
        <tr><td><code>is_superuser</code></td><td>bool</td><td>Bypasses all permission checks.</td></tr>
        <tr><td><code>username</code></td><td>varchar(150)</td><td>Unique username.</td></tr>
        <tr><td><code>email</code></td><td>varchar(254)</td><td>Email address.</td></tr>
        <tr><td><code>is_staff</code></td><td>bool</td><td>Can access the Django admin.</td></tr>
        <tr><td><code>is_active</code></td><td>bool</td><td>Set to False instead of deleting users.</td></tr>
      </tbody>
    </table>

    <h3>auth_group</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>int (PK)</td><td>Auto-incrementing ID.</td></tr>
        <tr><td><code>name</code></td><td>varchar(150)</td><td>Unique group name (e.g., "Editors").</td></tr>
      </tbody>
    </table>

    <h3>auth_permission</h3>
    <table>
      <thead><tr><th>Column</th><th>Type</th><th>What it means</th></tr></thead>
      <tbody>
        <tr><td><code>id</code></td><td>int (PK)</td><td>Auto-incrementing ID.</td></tr>
        <tr><td><code>name</code></td><td>varchar(255)</td><td>Human-readable name (e.g., "Can add post").</td></tr>
        <tr><td><code>content_type_id</code></td><td>int (FK)</td><td>Which model this permission applies to.</td></tr>
        <tr><td><code>codename</code></td><td>varchar(100)</td><td>Code identifier (e.g., <code>add_post</code>).</td></tr>
      </tbody>
    </table>

    <h3>django_content_type</h3>
    <p>Maps every model in your project to an ID. The permission system uses it to know which model a permission applies to.</p>

    <h2>How permissions work</h2>
    <p>A <strong>permission</strong> is tied to a <strong>content type</strong> (a model). <strong>Groups</strong> collect permissions. <strong>Users</strong> are added to groups to inherit their permissions. You can also assign permissions directly to users.</p>

    <h2>FAQ</h2>
    <p><strong>Does Django create all these tables automatically?</strong><br/>Yes. Running <code>python manage.py migrate</code> creates all auth tables.</p>
    <p><strong>What's the difference between <code>is_superuser</code> and <code>is_staff</code>?</strong><br/><code>is_superuser</code> bypasses all permission checks. <code>is_staff</code> only controls access to the Django admin.</p>
    <p><strong>Can I use Django without the permission system?</strong><br/>Yes. Remove <code>django.contrib.auth</code> from <code>INSTALLED_APPS</code>.</p>
  `,

  "database-schema-documentation": `
    <h2>The short version</h2>
    <p>Document your schema in three layers: (1) name things well so they're self-documenting, (2) add inline column comments for the non-obvious stuff, (3) generate a one-page visual diagram that shows the relationships. Skip the 40-page Confluence page -- nobody reads it.</p>

    <h2>Layer 1: Name things well</h2>
    <ul>
      <li><strong>Tables:</strong> plural nouns, snake_case -- <code>order_items</code>, not <code>OrderItems</code>.</li>
      <li><strong>Foreign keys:</strong> <code>{table}_id</code> -- <code>user_id</code>, not <code>userId</code>.</li>
      <li><strong>Booleans:</strong> prefix with <code>is_</code> or <code>has_</code> -- <code>is_active</code>, <code>has_paid</code>.</li>
      <li><strong>Timestamps:</strong> <code>created_at</code> and <code>updated_at</code>.</li>
    </ul>

    <h2>Layer 2: Inline comments</h2>
    <p>PostgreSQL supports column-level comments. Use them for anything that isn't obvious from the name:</p>
    <pre><code>COMMENT ON COLUMN orders.status IS
  'pending | confirmed | shipped | delivered | cancelled. Never delete orders -- set status to cancelled instead.';</code></pre>
    <p><strong>What to comment:</strong> enum values, format requirements, business rules, deletion policies. <strong>What NOT to comment:</strong> <code>id</code>, <code>created_at</code>, obvious foreign keys.</p>

    <h2>Layer 3: Visual diagram</h2>
    <p>A one-page ER diagram replaces 40 pages of documentation. Use <a href="https://www.dbdiagramr.space">dbdiagramr</a> -- paste your connection string, get a visual schema in seconds. Show table names, primary keys, foreign key relationships, and non-obvious column types.</p>

    <h2>The one-page cheat sheet</h2>
    <p>Create a <code>SCHEMA.md</code> in your repo with table names, key columns, relationships, and a link to your visual diagram. Update it in the same PR that changes the schema.</p>

    <h2>FAQ</h2>
    <p><strong>Should I document every table?</strong><br/>No. Document the tables new engineers will touch, the ones with complex business logic, and the ones with non-obvious schemas.</p>
    <p><strong>How often should I update the docs?</strong><br/>When you add or change a column. Put the update in your PR template as a checklist item.</p>
    <p><strong>What's the best tool for auto-generating schema docs?</strong><br/><a href="https://www.dbdiagramr.space">dbdiagramr</a> for visual diagrams. dbt's <code>docs generate</code> if you're on dbt.</p>
  `,

  "information-schema-vs-pg-catalog": `
    <h2>The short version</h2>
    <p><code>information_schema</code> is the SQL-standard way to query metadata -- portable across databases, slower, limited to what the standard defines. <code>pg_catalog</code> is PostgreSQL-specific -- faster, more detailed, has everything. Use <code>information_schema</code> for simple cross-DB queries. Use <code>pg_catalog</code> when you need Postgres-specific details or performance.</p>

    <h2>Head-to-head comparison</h2>
    <table>
      <thead><tr><th>Query</th><th>information_schema</th><th>pg_catalog</th></tr></thead>
      <tbody>
        <tr><td>List tables</td><td><code>SELECT table_name FROM information_schema.tables</code></td><td><code>SELECT relname FROM pg_class WHERE relkind = 'r'</code></td></tr>
        <tr><td>List columns</td><td><code>SELECT column_name, data_type FROM information_schema.columns</code></td><td><code>SELECT attname, format_type(...) FROM pg_attribute</code></td></tr>
        <tr><td>List indexes</td><td><code>SELECT indexname FROM information_schema.statistics</code></td><td><code>SELECT indexrelname FROM pg_stat_user_indexes</code></td></tr>
        <tr><td>Table size</td><td>Not available</td><td><code>SELECT pg_total_relation_size(oid)</code></td></tr>
        <tr><td>Table owner</td><td>Not available</td><td><code>SELECT pg_catalog.get_owner(c.oid)</code></td></tr>
      </tbody>
    </table>

    <h2>When to use which</h2>
    <p><strong>Use information_schema</strong> when you need portable SQL, simple queries, or readable syntax. <strong>Use pg_catalog</strong> when you need Postgres-specific info (owners, sizes, permissions), better performance, or internal system tables.</p>

    <h2>FAQ</h2>
    <p><strong>Can I query pg_catalog from MySQL?</strong><br/>No. pg_catalog is PostgreSQL-specific.</p>
    <p><strong>Which one does pg_dump use?</strong><br/><code>pg_catalog</code>. It needs Postgres-specific details like table OIDs and ACLs.</p>
    <p><strong>Can I see system tables from information_schema?</strong><br/>No. Use <code>pg_catalog.pg_stat_activity</code> for active queries, <code>pg_catalog.pg_locks</code> for locks.</p>
  `,

  "schema-documentation-drift": `
    <h2>The short version</h2>
    <p>Schema diagrams go stale because they're static snapshots of a moving target. A migration adds a column, someone renames a table, and suddenly your beautiful diagram is wrong. The fix: generate diagrams from the live database, not from a file.</p>

    <h2>Why it happens</h2>
    <ul>
      <li><strong>Migrations don't update diagrams.</strong> You run <code>ALTER TABLE orders ADD COLUMN shipping_cost_cents integer;</code> and nobody thinks to update the diagram.</li>
      <li><strong>Diagrams live in the wrong place.</strong> If your diagram is in Confluence or Figma, it's disconnected from the code.</li>
      <li><strong>Nobody owns it.</strong> Diagram maintenance falls between "frontend" and "backend" and "DevOps."</li>
    </ul>

    <h2>The three fixes</h2>
    <h3>Fix 1: Generate from the live database</h3>
    <p>Use <a href="https://www.dbdiagramr.space">dbdiagramr</a> -- paste your connection string, get a diagram in seconds. Your schema is always current.</p>

    <h3>Fix 2: Generate in CI/CD</h3>
    <p>Add a schema diagram step to your CI pipeline. Run it on every push to <code>main</code>. The diagram is always one commit behind, but close enough.</p>

    <h3>Fix 3: One-page SCHEMA.md</h3>
    <p>Maintain a single markdown file with the schema overview. Update it in the same PR that adds or changes a column. Put it in your PR checklist.</p>

    <h2>FAQ</h2>
    <p><strong>How often should I update my schema diagram?</strong><br/>Every time you add, remove, or rename a column. With dbdiagramr, it's always current.</p>
    <p><strong>Should I commit the diagram to git?</strong><br/>Yes. Commit it as an SVG or markdown file so it's versioned with your code.</p>
    <p><strong>What's the minimum viable schema documentation?</strong><br/>A one-page <code>SCHEMA.md</code> with table names, key columns, and relationships.</p>
  `,

  "supabase-connection-string-ipv6-enotfound": `
    <h2>The short version</h2>
    <p>Supabase uses IPv6 by default. Most local dev environments and many hosting providers don't support IPv6, so DNS resolution fails with <code>ENOTFOUND</code> or hangs with <code>ETIMEDOUT</code>. The fix: use the transaction pooler connection string (port <code>6543</code>) instead of the direct connection (port <code>5432</code>).</p>

    <h2>The error</h2>
    <pre><code>Error: getaddrinfo ENOTFOUND db.xxxxxxxxx.supabase.co</code></pre>
    <p>This means DNS can't resolve the hostname to an IPv6 address. The second form (<code>ETIMEDOUT</code>) means DNS resolved but the connection timed out because your network doesn't route IPv6.</p>

    <h2>The three connection strings</h2>
    <h3>Direct connection (port 5432)</h3>
    <p>Full Postgres protocol support. Supports prepared statements, <code>SET</code> commands, <code>LISTEN/NOTIFY</code>. Uses IPv6 -- may fail locally.</p>

    <h3>Transaction pooler (port 6543)</h3>
    <p>Routes through Supabase's PgBouncer. IPv4-compatible -- works everywhere. <strong>Does NOT support</strong> prepared statements or <code>SET</code> commands. Best for most web apps.</p>

    <h3>Session pooler (port 6543 + session_mode)</h3>
    <p>Same as transaction pooler but preserves session state. Supports <code>SET</code> but not prepared statements. Use if you need <code>SET search_path</code>.</p>

    <h2>Which one to use</h2>
    <table>
      <thead><tr><th>Use case</th><th>Connection string</th></tr></thead>
      <tbody>
        <tr><td>Local dev (Node.js, Python)</td><td>Transaction pooler (6543)</td></tr>
        <tr><td>Vercel / Railway / Render</td><td>Transaction pooler (6543)</td></tr>
        <tr><td>Cloudflare Workers</td><td>Transaction pooler (6543)</td></tr>
        <tr><td>Prisma ORM</td><td>Transaction pooler (6543) + <code>?pgbouncer=true</code></td></tr>
        <tr><td>pg_dump / pg_restore</td><td>Direct connection (5432)</td></tr>
        <tr><td>Migrations (Prisma, Knex)</td><td>Direct connection (5432)</td></tr>
      </tbody>
    </table>

    <h2>The Prisma gotcha</h2>
    <p>Prisma uses prepared statements by default. The transaction pooler doesn't support them, so you'll get <code>prepared statement "stmt_1" does not exist</code>. Fix: add <code>?pgbouncer=true</code> to your connection string.</p>

    <h2>FAQ</h2>
    <p><strong>Why does my app work on Vercel but not locally?</strong><br/>Vercel supports IPv6. Your local machine might not. Use the pooler (6543) locally.</p>
    <p><strong>What's the difference between transaction and session pooler?</strong><br/>Transaction pooler resets after each transaction (faster). Session pooler preserves state (needed for <code>SET</code> commands).</p>
    <p><strong>Does the pooler affect performance?</strong><br/>~1-2ms latency per query. Negligible for most web apps.</p>
  `,

  "dbdiagram-tools-compared": `
    <h2>The short version</h2>
    <p>dbdiagram.io is the original -- great for writing schemas in code (DBML), but no live database connection. DrawSQL is a paid desktop GUI with good auto-generation. dbdiagramr is free, runs in the browser, connects directly to Supabase/Neon/Railway, and generates diagrams from your live database in seconds.</p>

    <h2>Feature comparison</h2>
    <table>
      <thead><tr><th>Feature</th><th>dbdiagram.io</th><th>dbdiagramr</th><th>DrawSQL</th></tr></thead>
      <tbody>
        <tr><td>Pricing</td><td>Free (1 diagram), $9/mo</td><td>Free (unlimited)</td><td>$8/mo individual</td></tr>
        <tr><td>Live database connection</td><td>No</td><td>Yes (Supabase, Neon, Railway)</td><td>Yes (MySQL, Postgres)</td></tr>
        <tr><td>DBML support</td><td>Yes (native)</td><td>No</td><td>No</td></tr>
        <tr><td>Auto-generate from DB</td><td>No</td><td>Yes</td><td>Yes (desktop)</td></tr>
        <tr><td>Supabase integration</td><td>No</td><td>Yes</td><td>No</td></tr>
        <tr><td>Browser-based</td><td>Yes</td><td>Yes</td><td>No (desktop)</td></tr>
        <tr><td>AI context (llms.txt)</td><td>No</td><td>Yes</td><td>No</td></tr>
      </tbody>
    </table>

    <h2>Which one should you use?</h2>
    <ul>
      <li><strong>Diagram an existing Supabase/Neon database:</strong> dbdiagramr</li>
      <li><strong>Design a schema from scratch in code:</strong> dbdiagram.io</li>
      <li><strong>Desktop GUI with export options:</strong> DrawSQL</li>
      <li><strong>Free, unlimited diagrams:</strong> dbdiagramr</li>
      <li><strong>Team collaboration:</strong> dbdiagram.io or DrawSQL</li>
      <li><strong>AI context for your schema:</strong> dbdiagramr</li>
    </ul>

    <h2>FAQ</h2>
    <p><strong>Can I import a dbdiagram.io diagram into dbdiagramr?</strong><br/>Not directly. Deploy your DBML schema to a database first, then connect dbdiagramr to it.</p>
    <p><strong>Does dbdiagramr support MySQL?</strong><br/>Not yet. PostgreSQL only. MySQL support is planned.</p>
    <p><strong>Is DrawSQL worth the money?</strong><br/>If you need a desktop GUI with exports and team collaboration, yes. If you just need to see your schema, dbdiagramr does it for free.</p>
  `,
  "free-online-database-diagram-tool": `
    <h2>The short version</h2>
    <p>You need a database diagram. You don't want to pay for it, sign up for another account, or install anything. A free online database diagram tool should let you paste SQL or connect to your database and get a visual schema in seconds.</p>
    <p>Most tools claim to be free, then hit you with table limits, export restrictions, or require an email before you can do anything. The one that actually works the way you expect is <a href="https://www.dbdiagramr.space">dbdiagramr</a> -- paste SQL or a PostgreSQL connection string, get an interactive ER diagram, export SVG/PNG. No signup, no limits, no catch.</p>

    <h2>What a good free database diagram tool should do</h2>
    <table>
      <thead><tr><th>Feature</th><th>Why it matters</th></tr></thead>
      <tbody>
        <tr><td>Paste SQL directly</td><td>You already have the schema -- just show it</td></tr>
        <tr><td>Live database connection</td><td>See what's actually deployed, not what you think is deployed</td></tr>
        <tr><td>Interactive diagram</td><td>Pan, zoom, drag tables around</td></tr>
        <tr><td>Export SVG/PNG</td><td>Share with your team or drop in docs</td></tr>
        <tr><td>Search tables/columns</td><td>Find anything in a large schema fast</td></tr>
        <tr><td>No signup required</td><td>You're diagramming, not buying enterprise software</td></tr>
      </tbody>
    </table>

    <h2>How to use dbdiagramr as your free database diagram tool</h2>

    <h3>Option 1: Paste SQL</h3>
    <p>If you have a SQL dump or migration file, paste it directly into dbdiagramr and see your ER diagram appear instantly. Works with PostgreSQL CREATE TABLE statements, foreign keys, indexes -- the whole schema.</p>

    <h3>Option 2: Connect to a live database</h3>
    <p>If you have a PostgreSQL connection string, paste it into dbdiagramr. It queries <code>information_schema</code> for tables, columns, primary keys, and foreign keys, then renders an interactive ER diagram you can pan, zoom, drag, and export as SVG or PNG. Your SQL never leaves your browser -- the connection happens client-side.</p>

    <h3>Option 3: Upload a file</h3>
    <p>Drag and drop a <code>.sql</code> file or use the file picker. Same result -- instant diagram.</p>

    <h2>Why most "free" database diagram tools aren't actually free</h2>
    <table>
      <thead><tr><th>Tool</th><th>Free tier limitations</th></tr></thead>
      <tbody>
        <tr><td>dbdiagram.io</td><td>10 tables on free plan, export requires paid plan</td></tr>
        <tr><td>DrawSQL</td><td>Limited to 10 diagrams, no collaboration on free plan</td></tr>
        <tr><td>Lucidchart</td><td>3 editable documents, 60 shapes per document</td></tr>
        <tr><td>QuickDBD</td><td>Limited diagrams, watermark on exports</td></tr>
      </tbody>
    </table>
    <p>dbdiagramr has none of these limits. Paste SQL, connect to your database, export as much as you want. The tool is open-source -- you can even self-host it.</p>

    <h2>Real example: visualizing a Supabase schema</h2>
    <p>Supabase projects come with auth, storage, and realtime tables out of the box. Understanding how they connect requires a diagram.</p>
    <p>Paste this SQL into dbdiagramr:</p>
    <pre><code>CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);</code></pre>
    <p>In two seconds you see: <code>users</code> -- <code>posts</code> -- <code>comments</code> with all foreign key relationships drawn. Drag the boxes around, zoom in, export as PNG for your README.</p>

    <h2>When to use a free tool vs. a paid one</h2>
    <p><strong>Use a free tool when:</strong></p>
    <ul>
      <li>You're exploring an existing schema</li>
      <li>You need a quick diagram for documentation</li>
      <li>You're a solo developer or small team</li>
      <li>You want to understand relationships before writing queries</li>
    </ul>
    <p><strong>Consider paid when:</strong></p>
    <ul>
      <li>You need real-time collaboration (Lucidchart, DrawSQL paid)</li>
      <li>You need version control integration (some enterprise tools)</li>
      <li>You're designing a schema from scratch with a large team</li>
    </ul>
    <p>For 90% of database diagramming tasks, a free tool is enough.</p>

    <h2>FAQ</h2>
    <p><strong>What's the best free online database diagram tool?</strong><br/>dbdiagramr is the best free option -- no table limits, no signup, open-source. Paste SQL or connect to a live PostgreSQL database.</p>
    <p><strong>Can I create a database diagram without signing up?</strong><br/>Yes. dbdiagramr requires no account. Go to the site, paste SQL, get your diagram.</p>
    <p><strong>Does it work with PostgreSQL only?</strong><br/>Currently yes. PostgreSQL is the most common target for ER diagrams, and dbdiagramr specializes in it. SQL paste works with any PostgreSQL-compatible syntax.</p>
    <p><strong>Can I export the diagram?</strong><br/>Yes. Export as SVG or PNG with one click. No paid plan required.</p>
    <p><strong>Is my database connection secure?</strong><br/>Yes. dbdiagramr connects to your database client-side. Your connection string never leaves your browser. No data is sent to any server.</p>
  `,
  "sql-to-schema-diagram-online": `
    <h2>The short version</h2>
    <p>You have SQL. You need a diagram. The fastest path from <code>CREATE TABLE</code> to a visual schema is a tool that parses SQL and renders an ER diagram on the spot.</p>
    <p><a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> does exactly that -- paste your SQL, get an interactive diagram in seconds. No signup, no install, no export limits.</p>

    <h2>Why convert SQL to a schema diagram?</h2>
    <p>SQL is precise. Diagrams are comprehensible. When you're onboarding to a new codebase or explaining a schema to a non-technical stakeholder, a visual representation does something SQL can't: it shows relationships at a glance.</p>
    <p>Reading 200 lines of <code>CREATE TABLE</code> statements, you'll find the foreign keys eventually. Seeing them drawn as lines between boxes takes half a second.</p>

    <h2>How to convert SQL to a schema diagram online</h2>

    <h3>Step 1: Get your SQL</h3>
    <p>Grab your schema from one of these sources:</p>
    <ul>
      <li><code>pg_dump --schema-only yourdb</code></li>
      <li>Migration files (Prisma, Drizzle, Rails, Django)</li>
      <li>Your IDE's schema export</li>
      <li>A SQL file you already have</li>
    </ul>

    <h3>Step 2: Paste into dbdiagramr</h3>
    <p>Go to <a href="https://www.dbdiagramr.space/visualize">dbdiagramr.com/visualize</a> and paste your SQL in the editor. The tool parses CREATE TABLE statements, detects primary keys, and maps foreign key relationships automatically.</p>

    <h3>Step 3: Explore and export</h3>
    <p>Your ER diagram appears instantly. Pan, zoom, drag tables around to arrange them. When you're happy, export as SVG or PNG with one click.</p>

    <h2>What SQL syntax works?</h2>
    <p>dbdiagramr understands standard PostgreSQL syntax:</p>
    <ul>
      <li><code>CREATE TABLE</code> with columns and types</li>
      <li><code>PRIMARY KEY</code> constraints</li>
      <li><code>REFERENCES</code> for foreign keys</li>
      <li><code>DEFAULT</code> values</li>
      <li><code>NOT NULL</code> and <code>UNIQUE</code> constraints</li>
      <li><code>ON DELETE</code> and <code>ON UPDATE</code> actions</li>
    </ul>
    <p>If your SQL is valid PostgreSQL, dbdiagramr will parse it.</p>

    <h2>Example: converting a Laravel migration</h2>
    <p>If you're using Laravel, your migrations live in <code>database/migrations/</code>. Export them to SQL and paste the result:</p>
    <pre><code>-- Laravel migration exported to SQL
CREATE TABLE users (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  remember_token VARCHAR(100),
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);

CREATE TABLE posts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  body TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);</code></pre>
    <p>dbdiagramr renders the <code>users</code> and <code>posts</code> tables with the foreign key relationship drawn between them. Done in seconds.</p>

    <h2>Alternative methods (and why they're slower)</h2>
    <table>
      <thead><tr><th>Method</th><th>Setup</th><th>Speed</th><th>Limitation</th></tr></thead>
      <tbody>
        <tr><td>pgAdmin ERD tool</td><td>Already installed</td><td>Medium</td><td>Snapshot, manual re-run</td></tr>
        <tr><td>Draw.io + manual</td><td>Short</td><td>Slow</td><td>Hand-draw every table</td></tr>
        <tr><td>dbdiagram.io</td><td>Account required</td><td>Fast</td><td>Must learn DBML syntax</td></tr>
        <tr><td>dbdiagramr</td><td>None</td><td>Instant</td><td>PostgreSQL only (for now)</td></tr>
      </tbody>
    </table>
    <p>dbdiagramr is the only option that requires zero setup and accepts raw SQL directly.</p>

    <h2>FAQ</h2>
    <p><strong>Can I convert MySQL SQL to a diagram?</strong><br/>Not yet. dbdiagramr currently supports PostgreSQL syntax only. MySQL support is planned.</p>
    <p><strong>Does it work with Prisma schema files?</strong><br/>Not directly. Export your Prisma schema to SQL first with <code>prisma db pull</code> or <code>pg_dump</code>, then paste the SQL.</p>
    <p><strong>How large a schema can it handle?</strong><br/>dbdiagramr handles schemas with dozens of tables comfortably. Very large schemas (100+ tables) may need some manual arrangement, but the parsing works fine.</p>
    <p><strong>Is there a table limit?</strong><br/>No. Paste as many tables as you want. No signup, no limits.</p>
  `,
  "database-schema-diagram-tool": `
    <h2>The short version</h2>
    <p>You need a database schema diagram tool that works with PostgreSQL. There are five practical options, each making a different tradeoff between speed, depth, and how current the diagram stays.</p>
    <p>For most developers, the fastest path to a usable diagram is <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> -- paste SQL or connect to a live database, get an interactive ER diagram in seconds. No signup, no install, no limits.</p>

    <h2>5 database schema diagram tools compared</h2>
    <table>
      <thead><tr><th>Tool</th><th>Setup</th><th>Free?</th><th>Live connection</th><th>Best for</th></tr></thead>
      <tbody>
        <tr><td><code>psql</code> + <code>pg_catalog</code></td><td>Zero</td><td>Yes</td><td>Always live</td><td>Quick inspection</td></tr>
        <tr><td>pgAdmin ERD</td><td>Already installed</td><td>Yes</td><td>Snapshot</td><td>One-off look</td></tr>
        <tr><td>dbdiagram.io</td><td>Account required</td><td>Limited</td><td>No (DBML)</td><td>Designing new schema</td></tr>
        <tr><td>DrawSQL</td><td>Account required</td><td>Limited</td><td>Yes (paid)</td><td>Team collaboration</td></tr>
        <tr><td>dbdiagramr</td><td>None</td><td>Yes</td><td>Yes (free)</td><td>Understanding real DB</td></tr>
      </tbody>
    </table>

    <h2>1. psql: the zero-setup baseline</h2>
    <p>If you have PostgreSQL installed, you already have <code>psql</code>. It's not a diagram tool, but it shows schema structure:</p>
    <pre><code>\\dt              -- list all tables
\\d table_name    -- show one table's structure</code></pre>
    <p>For relationships, query <code>information_schema</code> directly. The output is text, not a picture. Past a dozen tables you're reconstructing the graph in your head.</p>

    <h2>2. pgAdmin ERD: free and built in</h2>
    <p>pgAdmin 4 includes an ER diagram tool. Right-click your database, select <em>ERD For Database</em>, and it generates a diagram from the live schema.</p>
    <p><strong>Pros:</strong> Free, already installed, connects to live database.</p>
    <p><strong>Cons:</strong> Auto-layout struggles past a few dozen tables. No SVG export. Not shareable without screenshots.</p>

    <h2>3. dbdiagram.io: the popular choice</h2>
    <p>dbdiagram.io is the most well-known database diagram tool. You write schema definitions in DBML (a custom markup language) and it renders an interactive diagram.</p>
    <p><strong>Pros:</strong> Clean UI, good for designing new schemas, shareable links.</p>
    <p><strong>Cons:</strong> Must learn DBML. Free tier limited to 10 tables. No live database connection -- the diagram is always a manual copy.</p>

    <h2>4. DrawSQL: the desktop option</h2>
    <p>DrawSQL is a desktop app that connects to live databases and generates ER diagrams. Supports MySQL, PostgreSQL, SQL Server, and MariaDB.</p>
    <p><strong>Pros:</strong> Desktop app, exports, team collaboration (paid).</p>
    <p><strong>Cons:</strong> Paid for full features. Free tier limited to 10 diagrams.</p>

    <h2>5. dbdiagramr: paste SQL, get a diagram</h2>
    <p><a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> takes a different approach: paste SQL or a PostgreSQL connection string, get an interactive ER diagram. No account, no install, no table limits.</p>
    <p>Because it introspects the live database, the diagram is always current. Change a migration, paste the same connection string again, up-to-date in under 10 seconds.</p>
    <p><strong>Pros:</strong> Free, no signup, no limits, live connection, SVG/PNG export, search tables/columns.</p>
    <p><strong>Cons:</strong> PostgreSQL only (for now).</p>

    <h2>Which tool should you choose?</h2>
    <ul>
      <li><strong>Just need a quick look?</strong> <code>psql</code> or pgAdmin. Fast, local, no sharing.</li>
      <li><strong>Designing a new schema?</strong> dbdiagram.io. Great for planning before you build.</li>
      <li><strong>Need to understand an existing database?</strong> dbdiagramr. Paste SQL or connect, get a diagram in seconds.</li>
      <li><strong>Team collaboration?</strong> DrawSQL paid plan. Real-time editing with multiple cursors.</li>
    </ul>

    <h2>Why "stays current" matters</h2>
    <p>Every tool except dbdiagramr shares the same failure mode: the diagram is a snapshot. The day someone runs a migration, the diagram is wrong. A wrong diagram is worse than none -- it's confidently wrong.</p>
    <p>The test that settles it: <strong>how much work does it take to make this picture true again?</strong> If the answer is "re-export" or "drag boxes by hand," humans will stop doing it and the diagram will lie to you.</p>

    <h2>FAQ</h2>
    <p><strong>What's the best database schema diagram tool for PostgreSQL?</strong><br/>For understanding an existing database, dbdiagramr is the fastest -- paste SQL or connect to a live database, no signup required.</p>
    <p><strong>Can I use dbdiagram.io without learning DBML?</strong><br/>Not really. DBML is the input format. If you prefer raw SQL, dbdiagramr accepts it directly.</p>
    <p><strong>Is pgAdmin's ERD tool good enough?</strong><br/>For small schemas and quick inspection, yes. For anything you need to share or keep current, use a dedicated tool.</p>
    <p><strong>Does DrawSQL support live PostgreSQL connections?</strong><br/>Yes, but only on paid plans. The free tier is limited to 10 diagrams.</p>
  `,
};
