// Blog post bodies as HTML strings (converted from markdown drafts in Odyssey/Content/Blogs).
// Keep each body self-contained: headings, tables, code blocks, FAQ.

export const blogBodies: Record<string, string> = {
  "supabase-tenant-or-user-not-found": `
    <h2>The short answer</h2>
    <p><strong>Tenant or user not found</strong> means Supabase&rsquo;s shared pooler could not match the host and username to one project. It is normally a connection-string mismatch, not a wrong password. On the shared pooler, the username must include the project ref: <code>postgres.&lt;ref&gt;</code>, or <code>&lt;role&gt;.&lt;ref&gt;</code> for a custom role.</p>
    <p>The fix is to open the Supabase <strong>Connect</strong> dialog, choose Session pooler or Transaction pooler, and copy the whole string. Replace only the password placeholder. For the full host and username table, see the <a href="https://www.dbdiagramr.space/supabase-connection-string#usernames">Supabase connection string guide</a>.</p>

    <h2>What the error means</h2>
    <p><a href="https://supabase.com/docs/guides/troubleshooting/tenant-or-user-not-found">Supabase&rsquo;s tenant troubleshooting guide</a> describes this as the shared pooler failing to match the host and username to a project. The wording changes by pooler and driver: the same lookup can return <code>Tenant or user not found</code>, an <code>ENOTFOUND</code> variant with the username, or <code>ENOIDENTIFIER</code> when the username has no project ref at all.</p>
    <p>All of these fail before password authentication. The pooler needs enough information to find your project before it can authenticate the role. That is why resetting the database password does not fix a missing project ref. Supabase&rsquo;s guide makes the same point: the error sends people to reset a password that was never wrong.</p>

    <h2>If the message says <code>ENOIDENTIFIER</code></h2>
    <p>The exact message is:</p>
    <pre><code>(ENOIDENTIFIER) no tenant identifier provided (external_id or sni_hostname required)</code></pre>
    <p>This means the username had no project ref at all. On the shared pooler, plain <code>postgres</code> gives the pooler nothing to look up. It is not the same string as <code>Tenant or user not found</code>, but it is the same tenant-identification failure, and the fix is the same: copy the shared pooler username in the form <code>postgres.&lt;ref&gt;</code> or <code>&lt;role&gt;.&lt;ref&gt;</code>.</p>

    <h2>Cause 1: the username is missing the project ref</h2>
    <p>Shared pooler connections use <code>postgres.&lt;project-ref&gt;</code>, not plain <code>postgres</code>. Direct connections and the paid dedicated pooler use plain <code>postgres</code>. Custom roles follow the same rule as the shared pooler: <code>&lt;role&gt;.&lt;project-ref&gt;</code>.</p>
    <table>
      <thead><tr><th>Connection</th><th>Username</th><th>What happens without the ref</th></tr></thead>
      <tbody>
        <tr><td>Direct</td><td><code>postgres</code></td><td>Adding <code>.&lt;ref&gt;</code> causes an authentication failure.</td></tr>
        <tr><td>Dedicated pooler</td><td><code>postgres</code></td><td>Same as direct: plain role, no project suffix.</td></tr>
        <tr><td>Shared session</td><td><code>postgres.&lt;ref&gt;</code></td><td><code>Tenant or user not found</code>.</td></tr>
        <tr><td>Shared transaction</td><td><code>postgres.&lt;ref&gt;</code></td><td>The same tenant error.</td></tr>
      </tbody>
    </table>
    <p>This is the most common cause because the shared pooler username looks almost identical to the direct username. The project ref is the part that identifies the tenant.</p>

    <h2>Cause 2: the host was typed, not copied</h2>
    <p>Shared pooler hosts look like <code>aws-1-us-east-2.pooler.supabase.com</code>. The number is a pooler cluster index, not part of the region name. A region can have more than one, and <code>aws-0</code> is not a safe default. You cannot derive the host from the region.</p>
    <p>If the host and username come from different screens, different projects, or different connection modes, the pooler can receive a valid host with the wrong tenant or a valid tenant with the wrong host. Copy both values from the same Connect string.</p>

    <h2>Cause 3: the mode, host, username, and port do not match</h2>
    <p>Supabase has four connection paths, and each has a matching host, port, and username. The shared pooler is IPv4 and uses <code>postgres.&lt;ref&gt;</code>. Port <code>5432</code> is session mode; port <code>6543</code> is transaction mode. The paid dedicated pooler also uses port <code>6543</code>, but it uses plain <code>postgres</code> and the <code>db.&lt;ref&gt;.supabase.co</code> host.</p>
    <p>Do not mix a direct host with a pooled username. Do not mix a session host with a transaction username. The error appears before password authentication, so the password is not the useful thing to change first.</p>

    <h2>How to fix it, with a check after each step</h2>
    <ol>
      <li><strong>Open Connect and choose the mode.</strong> Use Session pooler for a persistent backend on IPv4, or Transaction pooler for serverless. Check: the string says <code>pooler.supabase.com</code>, not <code>db.&lt;ref&gt;.supabase.co</code>, unless you chose the dedicated pooler.</li>
      <li><strong>Check the username.</strong> Shared session and shared transaction must use <code>postgres.&lt;ref&gt;</code> or <code>&lt;role&gt;.&lt;ref&gt;</code>. Direct and dedicated use <code>postgres</code>. Check: the username contains the project ref exactly where the Connect dialog shows it.</li>
      <li><strong>Check the port.</strong> Shared session is <code>5432</code>; shared transaction is <code>6543</code>. Check: the port matches the mode you selected, not just the port you remember.</li>
      <li><strong>Connect and run <code>select 1</code>.</strong> Check: the query returns. If it still returns the exact tenant error with a copied host, username, and port, stop changing the password.</li>
      <li><strong>Contact Supabase support.</strong> Include the project ref, exact error, pooler host, username, port, and the time of the attempt. The tenant guide documents host and username causes; it does not provide a self-service resync when both are already correct. <a href="https://supabase.com/dashboard/support/new">Open a support ticket</a>.</li>
    </ol>

    <h2>Why resetting the password is the wrong first move</h2>
    <p>The pooler has to identify the project before it can check a password for a role in that project. A missing project ref means there is no tenant to authenticate against. Reset the password only after the host, username, and port match a single Connect string and you get a different error, such as <code>password authentication failed</code>.</p>

    <h2>Tested on</h2>
    <p><strong>Reproduced 2026-10-25 against Supabase&rsquo;s shared pooler (aws-0-ap-northeast-1, port 5432).</strong> Both attempts used a placeholder password, so they test tenant identification, not password authentication.</p>
    <ul>
      <li>
        <p><strong>Username <code>postgres</code> (no project ref):</strong></p>
        <pre><code>(ENOIDENTIFIER) no tenant identifier provided (external_id or sni_hostname required)</code></pre>
        <p>The connection string was <code>postgresql://postgres:YOUR_PASSWORD@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres</code>.</p>
      </li>
      <li>
        <p><strong>Username <code>postgres.aaaaaaaaaaaaaaaaaaaa</code> (non-existent 20-character ref):</strong></p>
        <pre><code>(ENOTFOUND) tenant/user postgres.aaaaaaaaaaaaaaaaaaaa not found</code></pre>
        <p>This attempt used the same host, port, database, and placeholder password.</p>
      </li>
    </ul>

    <h2>Sources</h2>
    <ul>
      <li><a href="https://supabase.com/docs/guides/troubleshooting/tenant-or-user-not-found">Supabase: Tenant or user not found when connecting through the shared pooler</a></li>
      <li><a href="https://supabase.com/docs/guides/database/connecting-to-postgres">Supabase: Connect to your database</a></li>
      <li><a href="https://supabase.com/dashboard/support/new">Supabase: New support ticket</a></li>
    </ul>
    <p>Not sure which mode your string uses? Paste it into the <a href="https://www.dbdiagramr.space/postgres-connection-string">PostgreSQL connection string checker</a> to see the host, port, and username before you connect.</p>
  `,

  "prisma-prepared-statement-already-exists-supabase": `
    <h2>The short answer</h2>
    <p>Supabase&rsquo;s shared transaction pooler on port <code>6543</code> is <strong>Supavisor</strong>, not PgBouncer. Supavisor in transaction mode does not support prepared statements, but Prisma tries to create them. Add <code>?pgbouncer=true</code> to the pooled URL, and move migrations to a direct or session URL.</p>
    <p>That flag name is confusing on Supabase: it is the switch Prisma uses to stop creating named prepared statements. It does not mean the shared pooler is PgBouncer.</p>
    <p>For the surrounding connection setup, see the <a href="https://www.dbdiagramr.space/supabase-connection-string#prisma">Supabase connection string guide&rsquo;s Prisma section</a>.</p>

    <h2>What the error means</h2>
    <p>Prepared statements belong to a database session. PostgreSQL keeps them for the life of that session, and a statement cannot be used by multiple simultaneous clients. The <a href="https://www.postgresql.org/docs/16/sql-prepare.html">PostgreSQL PREPARE documentation</a> is explicit on both points.</p>
    <p>Transaction pooling gives a client a server connection for one transaction, then returns it to the pool. The next transaction can land on a different backend. A named statement created on one backend may still exist there, or may be missing on the next one. Prisma uses named prepared statements, so it can hit either side of that mismatch.</p>
    <p>Supabase&rsquo;s <a href="https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting">Prisma troubleshooting guide</a> names the cause directly: Supavisor in transaction mode on port <code>6543</code> does not support prepared statements, which Prisma tries to create in the background. The fix it gives is <code>pgbouncer=true</code> on the connection string.</p>

    <h2>Cause 1: the runtime uses the transaction pooler without the flag</h2>
    <p>This is the common production case. <code>DATABASE_URL</code> points at port <code>6543</code>, the app is deployed to a serverless or autoscaling runtime, and the URL has no <code>pgbouncer=true</code>. The first query after a new client or deploy can succeed, then a later query reuses a backend that already has <code>s0</code>, and the next prepare fails.</p>
    <p>Serverless makes it easier to see because instances start and stop, but the cause is the pooling mode, not the number of instances by itself.</p>

    <h2>Cause 2: Prisma Migrate or <code>db push</code> uses the pooled URL</h2>
    <p>Prisma&rsquo;s schema engine expects a single connection. <a href="https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer">Prisma&rsquo;s pooling guide</a> shows this exact error when Migrate runs through a transaction pooler. The fix is not to add the flag to the migration path. Give Prisma CLI a direct or session URL.</p>

    <h2>Cause 3: there is no direct URL in the config</h2>
    <p>If <code>DATABASE_URL</code> is the only URL, the app and the CLI share it. Prisma has no way to send Migrate somewhere safer. Prisma 6 uses <code>directUrl</code> in the datasource block; Prisma 7 puts the direct URL in <code>prisma.config.ts</code>.</p>

    <h2>The related <code>s0</code> &ldquo;does not exist&rdquo; error</h2>
    <p><code>prepared statement &quot;s0&quot; does not exist</code> is the other half of the same problem. The client prepared <code>s0</code> on one backend, then the transaction moved to a different backend that never saw it. The fix is the same: stop using named prepared statements through transaction pooling, or use a connection mode that preserves the session.</p>

    <h2>Fix for Prisma 6</h2>
    <p>Use the pooled URL at runtime with <code>pgbouncer=true</code>, and give Prisma CLI a direct or session URL through <code>directUrl</code>.</p>
    <pre><code># .env
DATABASE_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:6543/postgres?sslmode=require&amp;pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:5432/postgres?sslmode=require"</code></pre>
    <pre><code>// prisma/schema.prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}</code></pre>
    <p>Check: the runtime URL ends in <code>pgbouncer=true</code>, the direct URL has no flag, and both use the username format that matches their mode. In the shared pooler that is <code>postgres.&lt;ref&gt;</code> or <code>&lt;role&gt;.&lt;ref&gt;</code>; a direct connection uses plain <code>postgres</code>.</p>

    <h2>Fix for Prisma 7</h2>
    <p>Prisma 7 moves the CLI connection into <code>prisma.config.ts</code> and uses a driver adapter for the runtime. Keep the pooled URL for the adapter and the direct or session URL for the CLI.</p>
    <pre><code># .env
DATABASE_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:6543/postgres?sslmode=require&amp;pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:5432/postgres?sslmode=require"</code></pre>
    <pre><code>// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL"),
  },
});</code></pre>
    <pre><code>// src/db/client.ts
import { PrismaClient } from "../prisma/generated/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

export const prisma = new PrismaClient({ adapter });</code></pre>
    <p>Check: <code>prisma migrate status</code> and <code>prisma migrate dev</code> use the direct or session URL, while application queries use the pooled URL with the flag.</p>

    <h2>Run migrations in CI</h2>
    <p>Point the migration step at the direct connection or shared session pooler. Do not run <code>prisma migrate deploy</code> against <code>6543</code>.</p>
    <p><strong>Prisma 6:</strong> keep <code>directUrl = env("DIRECT_URL")</code> in the datasource block. Prisma CLI uses it for migrations and introspection while the app uses the pooled URL.</p>
    <pre><code>export DATABASE_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:6543/postgres?sslmode=require&amp;pgbouncer=true"
export DIRECT_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:5432/postgres?sslmode=require"

npx prisma migrate deploy</code></pre>
    <p><strong>Prisma 7:</strong> keep <code>datasource.url = env("DIRECT_URL")</code> in <code>prisma.config.ts</code>. The CLI uses that URL for migrations.</p>
    <pre><code>export DIRECT_URL="postgresql://postgres.[ref]:[password]@[pooler-host]:5432/postgres?sslmode=require"

npx prisma migrate deploy</code></pre>
    <p>Check: the migration command connects to port <code>5432</code>, not <code>6543</code>. In Prisma 6, confirm <code>directUrl</code> is present; in Prisma 7, confirm the config&rsquo;s <code>datasource.url</code> reads the direct URL.</p>

    <h2>The PgBouncer 1.21 nuance</h2>
    <p><a href="https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer">Prisma&rsquo;s pooling guide</a> recommends omitting <code>pgbouncer=true</code> on PgBouncer 1.21 and newer. If you use Supabase&rsquo;s paid dedicated pooler, which is PgBouncer, follow that version guidance for that pooler.</p>
    <p>Do not apply that note to the shared transaction pooler. That pooler is Supavisor, and Supabase&rsquo;s <a href="https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL">prepared statement guide</a> still tells Prisma users to add <code>pgbouncer=true</code> in transaction mode. Follow the provider that terminates the connection.</p>

    <h2>Other drivers</h2>
    <p><strong>Drizzle with postgres.js:</strong> disable prepared statements in the client.</p>
    <pre><code>import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!, { prepare: false });</code></pre>
    <p><strong>node-postgres:</strong> omit <code>name</code>. Supplying a name creates a prepared statement; an unnamed query does not.</p>
    <pre><code>await client.query({ text: "select 1" });</code></pre>
    <p><strong>Alternative:</strong> use the direct connection or shared session mode, both of which support prepared statements. That is usually the right choice for a persistent backend and for migrations.</p>

    <h2>How to verify the fix</h2>
    <ol>
      <li>Run the same query twice from two fresh processes or after a redeploy. Check: both runs succeed, not just the first one.</li>
      <li>Run <code>prisma migrate status</code>. Check: it connects through the direct or session URL, not port <code>6543</code>.</li>
      <li>Inspect both URLs. Check: the pooled URL has <code>pgbouncer=true</code>, the direct URL does not, and the usernames match their respective modes.</li>
      <li>If the error remains, confirm you edited the deployed environment, not only the local <code>.env</code>.</li>
    </ol>

    <h2>Tested on</h2>
    <p><strong>Reproduced locally with PgBouncer in transaction mode (max_prepared_statements=0) to show the mechanism. Supabase&rsquo;s shared transaction pooler is Supavisor, which also does not support prepared statements in transaction mode (<a href="https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting">Supabase Prisma troubleshooting</a>).</strong></p>
    <p>Environment: PostgreSQL 16.15, PgBouncer 1.26.1, Prisma 6.19.3, Node.js 22.23.3, Docker 29.1.3. The PgBouncer test used <code>pool_mode=transaction</code>, <code>default_pool_size=1</code>, and <code>max_prepared_statements=0</code>.</p>
    <p>Without <code>pgbouncer=true</code>, the first Prisma process succeeded and the second process returned:</p>
    <pre><code>Error occurred during query execution:
ConnectorError(ConnectorError { user_facing_error: None, kind: QueryError(PostgresError { code: "42P05", message: "prepared statement \\"s0\\" already exists", severity: "ERROR", detail: None, column: None, hint: None }), transient: false })</code></pre>
    <p>With <code>pgbouncer=true</code> on both runs, the same two-process test returned <code>query ok: 1 row(s)</code> both times. A Prisma 7.10.1 config plus <code>@prisma/adapter-pg</code> smoke test against the same transaction pooler also returned <code>query ok: 1 row(s)</code>.</p>
    <p>The local test uses PgBouncer only to make the mechanism reproducible. The production fix for the shared Supabase pooler comes from Supabase&rsquo;s Supavisor documentation, not from the local PgBouncer version.</p>

    <h2>Sources</h2>
    <ul>
      <li><a href="https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting">Supabase: Troubleshooting Prisma errors</a></li>
      <li><a href="https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL">Supabase: Disabling prepared statements</a></li>
      <li><a href="https://supabase.com/docs/guides/database/connecting-to-postgres">Supabase: Connect to your database</a></li>
      <li><a href="https://supabase.com/docs/guides/database/prisma">Supabase: Prisma quickstart</a></li>
      <li><a href="https://www.prisma.io/docs/orm/v7/prisma-client/setup-and-configuration/databases-connections/pgbouncer">Prisma: Configure Prisma Client with PgBouncer</a></li>
      <li><a href="https://www.prisma.io/docs/orm/reference/prisma-config-reference">Prisma: Config reference</a></li>
      <li><a href="https://www.prisma.io/docs/orm/prisma-migrate/workflows/development-and-production">Prisma: Applying a migration</a></li>
      <li><a href="https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7">Prisma: Upgrade to Prisma ORM 7</a></li>
      <li><a href="https://www.prisma.io/docs/orm/v6/reference/prisma-schema-reference">Prisma v6: Schema reference</a></li>
      <li><a href="https://www.postgresql.org/docs/16/sql-prepare.html">PostgreSQL: PREPARE</a></li>
    </ul>
    <p>Need to check the host, port, and username before changing code? Use the <a href="https://www.dbdiagramr.space/postgres-connection-string">PostgreSQL connection string checker</a>.</p>
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
    <p><strong>One-to-many (1:N)</strong>, the most common. One user has many orders. The "many" side holds the foreign key: <code>orders.user_id → users.id</code>. Drawn as a line with a crow's foot (three prongs) on the many end.</p>
    <p><strong>Many-to-many (M:N)</strong>, via a join table. Users and groups need <code>user_groups(user_id, group_id)</code>. Django's <code>auth_user_groups</code> is a classic example. The join table has two foreign keys.</p>
    <p><strong>One-to-one (1:1)</strong>, rare, usually a vertical split. <code>users</code> and <code>profiles</code> where each user has exactly one profile. Enforced by a <code>UNIQUE</code> on the foreign key.</p>

    <h2>How to read an ER diagram in 60 seconds</h2>
    <ol>
      <li><strong>Find the core entity.</strong> Usually <code>users</code>, most lines point to it.</li>
      <li><strong>Follow the FK lines.</strong> Each line is a <code>FOREIGN KEY</code> you could write as a <code>JOIN</code>.</li>
      <li><strong>Check cardinality.</strong> Crow's foot = many. No crow's foot = one.</li>
      <li><strong>Look for join tables.</strong> Two FKs, often just two columns + PK = M:N.</li>
      <li><strong>Read PKs first.</strong> The PK tells you what makes a row unique.</li>
    </ol>
    <p>Example: In the <a href="https://www.dbdiagramr.space/schema/supabase">Supabase auth diagram</a>, <code>auth.users</code> is the core. Lines radiate to <code>identities</code> and <code>sessions</code>, one user, many identities and many sessions. Each line is a foreign key you can follow with a query. Two more worked examples at different scales: the 11-table <a href="https://www.dbdiagramr.space/schema/chinook">Chinook music-store diagram</a> (note the composite-key join table <code>playlist_track</code>) and the 16-table <a href="https://www.dbdiagramr.space/schema/pagila">Pagila rental-store diagram</a> (note the partitioned <code>payment</code> table).</p>
    <p>If you are choosing tooling rather than learning notation, compare the options in <a href="https://www.dbdiagramr.space/blog/database-schema-diagram-tool">5 database schema diagram tools</a>, or skip straight to the <a href="https://www.dbdiagramr.space/">PostgreSQL ER diagram tool</a> and read a live diagram.</p>

    <h2>Why ER diagrams matter for PostgreSQL</h2>
    <p>PostgreSQL doesn't show you relationships, <code>\\d</code> shows one table at a time, <code>information_schema</code> is a wall of text. An ER diagram collapses that into one picture where you can see at a glance: which tables exist, how they connect, where the join tables are, and what you'd need to <code>JOIN</code> to answer a question.</p>
    <p>Live-introspected diagrams (like <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a>) guarantee the picture matches production, no drift, no hand-updating. Paste a connection string, get the truth.</p>

    <h2>FAQ</h2>
    <p><strong>What is an ER diagram?</strong><br/>A visual map of a database: boxes are tables, rows are columns, lines are foreign key relationships with cardinality (one-to-many, etc.).</p>
    <p><strong>What does the crow's foot mean?</strong><br/>It marks the "many" end of a relationship. A line from <code>users</code> to <code>orders</code> with a crow's foot at <code>orders</code> means one user can have many orders.</p>
    <p><strong>What's the difference between ER diagram and schema diagram?</strong><br/>They're the same thing in practice. "Schema diagram" emphasizes the PostgreSQL schema; "ER diagram" emphasizes the entity-relationship model. Both show tables, columns, and foreign keys.</p>
    <p><strong>How do I make an ER diagram from a PostgreSQL database?</strong><br/>Use <code>pgAdmin</code>'s ERD tool for a quick snapshot, or paste your connection string into a live-introspection tool to generate an interactive diagram in 10 seconds.</p>
  `,

  "database-schema-documentation": `
    <h2>The short version</h2>
    <p>Document your schema in three layers: (1) name things well so they're self-documenting, (2) add inline column comments for the non-obvious stuff, (3) generate a one-page visual diagram that shows the relationships. Skip the 40-page Confluence page, nobody reads it.</p>

    <h2>Layer 1: Name things well</h2>
    <ul>
      <li><strong>Tables:</strong> plural nouns, snake_case, <code>order_items</code>, not <code>OrderItems</code>.</li>
      <li><strong>Foreign keys:</strong> <code>{table}_id</code>, <code>user_id</code>, not <code>userId</code>.</li>
      <li><strong>Booleans:</strong> prefix with <code>is_</code> or <code>has_</code>, <code>is_active</code>, <code>has_paid</code>.</li>
      <li><strong>Timestamps:</strong> <code>created_at</code> and <code>updated_at</code>.</li>
    </ul>

    <h2>Layer 2: Inline comments</h2>
    <p>PostgreSQL supports column-level comments. Use them for anything that isn't obvious from the name:</p>
    <pre><code>COMMENT ON COLUMN orders.status IS
  'pending | confirmed | shipped | delivered | cancelled. Never delete orders, set status to cancelled instead.';</code></pre>
    <p><strong>What to comment:</strong> enum values, format requirements, business rules, deletion policies. <strong>What NOT to comment:</strong> <code>id</code>, <code>created_at</code>, obvious foreign keys.</p>

    <h2>Layer 3: Visual diagram</h2>
    <p>A one-page ER diagram replaces 40 pages of documentation. Use <a href="https://www.dbdiagramr.space">dbdiagramr</a>, paste your connection string, get a visual schema in seconds. Show table names, primary keys, foreign key relationships, and non-obvious column types.</p>

    <h2>The one-page cheat sheet</h2>
    <p>Create a <code>SCHEMA.md</code> in your repo with table names, key columns, relationships, and a link to your visual diagram. Update it in the same PR that changes the schema.</p>

    <h2>Why schema docs go stale</h2>
    <p>A schema diagram is a snapshot of a moving target. A migration adds a column, someone renames a table, and the diagram is wrong while still looking authoritative. Three causes show up again and again:</p>
    <ul>
      <li><strong>Migrations do not update diagrams.</strong> Someone runs <code>ALTER TABLE orders ADD COLUMN shipping_cost_cents integer;</code> and no one remembers the diagram.</li>
      <li><strong>The diagram lives away from the code.</strong> A Confluence page or Figma file has no link to the migration that changed the schema.</li>
      <li><strong>Nobody owns it.</strong> Maintenance falls between frontend, backend, and operations, so it happens only when someone complains.</li>
    </ul>
    <p>The failure is predictable: a stale diagram is worse than no diagram because people trust it. The fix is to make regeneration cheaper than editing the picture by hand.</p>

    <h2>Keep docs current in CI</h2>
    <p>Generate from the database or migrations, not from memory. A practical loop:</p>
    <ol>
      <li>Export the schema in CI with <code>pg_dump --schema-only</code>.</li>
      <li>Generate the diagram or <code>SCHEMA.md</code> from that dump.</li>
      <li>Commit the generated file, or fail the build when the committed copy differs.</li>
    </ol>
    <pre><code>pg_dump --schema-only "$DATABASE_URL" &gt; schema.sql
# regenerate docs/schema.svg and SCHEMA.md from schema.sql
git diff --exit-code docs/schema.svg SCHEMA.md</code></pre>
    <p>The build check is the part that matters. A generation step without a diff check still depends on someone remembering to run it. Wire the check into the same pipeline that runs migrations, and update <code>SCHEMA.md</code> in the same pull request that changes the schema.</p>

    <h2>FAQ</h2>
    <p><strong>Should I document every table?</strong><br/>No. Document the tables new engineers will touch, the ones with complex business logic, and the ones with non-obvious schemas.</p>
    <p><strong>Why do schema diagrams go stale?</strong><br/>Because they are static snapshots. Migrations change the database, but the diagram is not regenerated, and no one notices until someone trusts the wrong picture.</p>
    <p><strong>How often should I update the docs?</strong><br/>When you add or change a column. Put the update in your PR template as a checklist item.</p>
    <p><strong>What's the best tool for auto-generating schema docs?</strong><br/><a href="https://www.dbdiagramr.space">dbdiagramr</a> for visual diagrams. dbt's <code>docs generate</code> if you're on dbt.</p>
  `,

  "information-schema-vs-pg-catalog": `
    <h2>The short version</h2>
    <p><code>information_schema</code> is the SQL-standard way to query metadata, portable across databases, slower, limited to what the standard defines. <code>pg_catalog</code> is PostgreSQL-specific, faster, more detailed, has everything. Use <code>information_schema</code> for simple cross-DB queries. Use <code>pg_catalog</code> when you need Postgres-specific details or performance.</p>

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

  "supabase-connection-string-ipv6-enotfound": `
    <h2>The short answer</h2>
    <p>The Supabase direct host uses IPv6 by default. If your app or network is IPv4-only, the hostname has no usable address and Node reports <code>getaddrinfo ENOTFOUND db.&lt;ref&gt;.supabase.co</code>. The fix is the shared pooler: Session mode (port <code>5432</code>) is the safe default, and Transaction mode (port <code>6543</code>) works for serverless if prepared statements are turned off.</p>
    <p>For the full four-mode table, usernames, SSL settings, and driver fixes, see the <a href="https://www.dbdiagramr.space/supabase-connection-string">Supabase connection string guide</a>.</p>

    <h2>What the error means</h2>
    <pre><code>Error: getaddrinfo ENOTFOUND db.xxxxxxxxx.supabase.co</code></pre>
    <p><code>ENOTFOUND</code> means the resolver returned no address your client could use. <code>ENETUNREACH</code> means an IPv6 address was returned but your network has no route to it. <code>ETIMEDOUT</code> means packets were sent but no reply came back, often because a firewall or network path is blocking IPv6.</p>

    <h2>Why the direct host fails on IPv4</h2>
    <p>The direct connection string is <code>postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres</code>. That host uses IPv6 by default. IPv4 requires Supabase's paid IPv4 add-on. <a href="https://supabase.com/docs/guides/database/connecting-to-postgres">Supabase's docs</a> describe the add-on as not dual-stack: &ldquo;enabling it swaps the project's IPv6 (AAAA) DNS record for an IPv4 (A) record, so the project endpoint becomes reachable only over IPv4.&rdquo;</p>
    <p>That is why the same connection string can work on one host and fail on another. An IPv4-only serverless runtime or local network cannot reach the IPv6 endpoint, and a resolver with no A record has nothing to fall back to.</p>

    <h2>The connection modes</h2>
    <table>
      <thead><tr><th>Mode</th><th>Host and port</th><th>IP version</th><th>Username</th><th>Prepared statements</th><th>Best for</th></tr></thead>
      <tbody>
        <tr><td>Direct</td><td><code>db.[ref].supabase.co:5432</code></td><td>IPv6 by default; IPv4 add-on</td><td><code>postgres</code></td><td>Yes</td><td>Migrations, <code>pg_dump</code>, long-lived IPv6 backends</td></tr>
        <tr><td>Dedicated pooler</td><td><code>db.[ref].supabase.co:6543</code></td><td>Paid plans; IPv6 by default, IPv4 add-on</td><td><code>postgres</code></td><td>No</td><td>High-performance apps on paid plans</td></tr>
        <tr><td>Shared session</td><td><code>aws-[INDEX]-[REGION].pooler.supabase.com:5432</code></td><td>IPv4-only on every plan</td><td><code>postgres.[ref]</code></td><td>Yes</td><td>Persistent IPv4-only backends, BI tools, database GUIs</td></tr>
        <tr><td>Shared transaction</td><td><code>aws-[INDEX]-[REGION].pooler.supabase.com:6543</code></td><td>IPv4-only on every plan</td><td><code>postgres.[ref]</code></td><td>No</td><td>Serverless and edge functions</td></tr>
      </tbody>
    </table>
    <p>The dedicated pooler uses the same host as the direct connection, so it hits the same <code>ENOTFOUND</code> on IPv4-only networks unless the project has the IPv4 add-on.</p>
    <p><code>[INDEX]</code> is a pooler cluster index, not part of the region name. A region can have more than one. Copy the host from Dashboard -&gt; Connect instead of composing it.</p>

    <h2>Fix 1: use the session pooler (recommended default)</h2>
    <p>Session mode is IPv4-only on every plan, keeps session state, and supports prepared statements. It is the safest default for a persistent backend on an IPv4-only network.</p>
    <ol>
      <li>Open Supabase Dashboard -&gt; Connect.</li>
      <li>Choose <strong>Session pooler</strong>.</li>
      <li>Copy the whole string and replace only the password placeholder.</li>
      <li>Keep the username as <code>postgres.[PROJECT-REF]</code>.</li>
    </ol>
    <pre><code>psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-[INDEX]-[REGION].pooler.supabase.com:5432/postgres" -c "select 1"</code></pre>

    <h2>Fix 2: use the transaction pooler for serverless</h2>
    <p>Transaction mode is the right fit for serverless and edge functions, which open many short-lived connections. It does not support prepared statements or session-level state such as <code>SET</code>, cursors, <code>LISTEN/NOTIFY</code>, or temporary tables. Turn prepared statements off in your driver.</p>

    <h3>node-postgres</h3>
    <p>Omit the <code>name</code> value from the query config. A named query becomes a prepared statement.</p>
    <pre><code>import fs from "node:fs";
import pg from "pg";

const ca = fs.readFileSync("./prod-ca-2021.crt", "utf8");

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
  ssl: { rejectUnauthorized: true, ca },
});

// Do not pass a name value here in transaction mode.
await pool.query("select 1");</code></pre>
    <p>Download the CA certificate from Supabase Database settings and point the path at your copy. Supabase recommends TLS: <code>sslmode=require</code> encrypts but does not verify the server; for verification, use the downloaded CA (or <code>sslmode=verify-full</code> with <code>sslrootcert</code>). See <a href="https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-ssl">Supabase: connecting with SSL</a>.</p>
    <p><a href="https://supabase.com/docs/guides/database/connecting-to-postgres#application-side-pool-size">Supabase's serverless guidance</a>: &ldquo;Set the pool to 1 connection. The client is shared by every invocation on that warm instance, so this caps the instance, not the request.&rdquo;</p>

    <h3>Prisma</h3>
    <p>Append <code>?pgbouncer=true</code> to the transaction-pooler URL. This turns off prepared statements in Prisma.</p>
    <pre><code>DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-[INDEX]-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"</code></pre>
    <p>Use the direct connection or session mode for migrations.</p>

    <h3>Drizzle with postgres.js</h3>
    <pre><code>import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";

const client = postgres(process.env.DATABASE_URL!, { prepare: false });
const db = drizzle({ client });</code></pre>

    <h3>Python psycopg 3</h3>
    <pre><code>import psycopg

with psycopg.connect(DATABASE_URL, prepare_threshold=None) as conn:
    with conn.cursor() as cur:
        cur.execute("select 1")</code></pre>

    <h2>Which mode should you use?</h2>
    <ul>
      <li><strong>Serverless or edge:</strong> shared transaction pooler on <code>6543</code>, prepared statements off.</li>
      <li><strong>Persistent backend on IPv4-only:</strong> shared session pooler on <code>5432</code>.</li>
      <li><strong>Persistent backend with IPv6 or the IPv4 add-on:</strong> direct connection on <code>5432</code>.</li>
      <li><strong>High-performance app on a paid plan:</strong> dedicated pooler on <code>6543</code>, over IPv6 or IPv4 with the add-on.</li>
      <li><strong>Migrations, <code>pg_dump</code>, backup and restore:</strong> direct connection, or session mode if you are IPv4-only.</li>
    </ul>

    <h2>Related errors</h2>
    <p><strong><code>Tenant or user not found</code></strong><br/>The shared pooler could not match your host and username to a project. Copy the host from Dashboard -&gt; Connect, and make sure the username is <code>postgres.[PROJECT-REF]</code>, not <code>postgres</code>.</p>
    <p><strong><code>prepared statement "s0" already exists</code></strong><br/>You are using transaction mode with prepared statements on. Add <code>?pgbouncer=true</code> for Prisma, <code>prepare: false</code> for postgres.js/Drizzle, or <code>prepare_threshold=None</code> for psycopg.</p>
    <p><strong><code>ENETUNREACH</code> or <code>ETIMEDOUT</code></strong><br/>The name resolved, but the IPv6 path is missing or blocked. Use the shared session pooler on <code>5432</code>.</p>
    <p><strong>Full fixes:</strong> <a href="https://www.dbdiagramr.space/blog/supabase-tenant-or-user-not-found">Tenant or user not found</a> and <a href="https://www.dbdiagramr.space/blog/prisma-prepared-statement-already-exists-supabase">prepared statement &quot;s0&quot; already exists</a>.</p>

    <h2>Verify the fix</h2>
    <p>Check DNS first. On Linux use <code>getent ahosts &lt;host&gt;</code>; on macOS, Windows, or Linux, <code>nslookup &lt;host&gt;</code> is a cross-platform alternative.</p>
    <pre><code>getent ahosts aws-[INDEX]-[REGION].pooler.supabase.com
nslookup aws-[INDEX]-[REGION].pooler.supabase.com</code></pre>
    <p>Then test the connection and read the catalog:</p>
    <pre><code>psql "$DATABASE_URL" -c "select 1"
psql "$DATABASE_URL" -c "select count(*) from pg_catalog.pg_tables where schemaname = 'public'"</code></pre>
    <p>Finally, paste the same string into <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> and confirm the tables render.</p>

    <p><strong>Last updated:</strong> 2026-10-23. <strong>Tested on:</strong> 2026-10-23, Supabase shared pooler, session mode (5432) and transaction mode (6543); both introspected a 20-table test schema plus Supabase's auth and storage tables in 2-4 seconds. Paste mode is instant.</p>

    <h2>Sources</h2>
    <ul>
      <li><a href="https://supabase.com/docs/guides/database/connecting-to-postgres">Supabase: Connect to your database</a></li>
      <li><a href="https://supabase.com/docs/guides/troubleshooting/tenant-or-user-not-found">Supabase: Tenant or user not found</a></li>
      <li><a href="https://supabase.com/docs/guides/troubleshooting/disabling-prepared-statements-qL8lEL">Supabase: Disabling prepared statements</a></li>
      <li><a href="https://supabase.com/docs/guides/database/prisma/prisma-troubleshooting">Supabase: Prisma troubleshooting</a></li>
      <li><a href="https://www.prisma.io/docs/orm/reference/prisma-cli-reference#migrate-diff">Prisma CLI: migrate diff</a></li>
      <li><a href="https://supabase.com/docs/guides/database/connecting-to-postgres#connecting-with-ssl">Supabase: connecting with SSL</a></li>
      <li><a href="https://node-postgres.com/features/queries#prepared-statements">node-postgres: prepared statements</a></li>
      <li><a href="https://orm.drizzle.team/docs/connect-supabase">Drizzle: connect to Supabase</a></li>
      <li><a href="https://www.psycopg.org/psycopg3/docs/advanced/prepare.html">psycopg 3: prepared statements</a></li>
    </ul>
    <p>Need to build or decode a URI first? Use the <a href="https://www.dbdiagramr.space/postgres-connection-string">PostgreSQL connection string builder</a>, then open the <a href="https://www.dbdiagramr.space/supabase-er-diagram">Supabase ER diagram guide</a>.</p>
  `,

  "database-schema-diagram-tool": `
    <h2>The short version</h2>
    <p>You need a database schema diagram tool that works with PostgreSQL. There are five practical options, each making a different tradeoff between speed, depth, and how current the diagram stays.</p>
    <p>For most developers, the fastest path to a usable diagram is <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a>, paste SQL or connect to a live database, get an interactive ER diagram in seconds. No signup, no install, no limits.</p>

    <h2>5 database schema diagram tools compared</h2>
    <table>
      <thead><tr><th>Tool</th><th>Setup</th><th>Free?</th><th>Live connection</th><th>Best for</th></tr></thead>
      <tbody>
        <tr><td><code>psql</code> + <code>pg_catalog</code></td><td>Zero</td><td>Yes</td><td>Always live</td><td>Quick inspection</td></tr>
        <tr><td>pgAdmin ERD</td><td>Already installed</td><td>Yes</td><td>Snapshot</td><td>One-off look</td></tr>
        <tr><td>dbdiagram.io</td><td>No signup for one-off diagrams</td><td>Yes (10 diagrams)</td><td>No (DBML)</td><td>Designing new schema</td></tr>
        <tr><td>DrawSQL</td><td>No signup for free canvas</td><td>Yes (15 tables)</td><td>No (SQL import)</td><td>Team schema design</td></tr>
        <tr><td>dbdiagramr</td><td>None</td><td>Yes</td><td>Yes (free)</td><td>Understanding real DB</td></tr>
      </tbody>
    </table>

    <h2>1. psql: the zero-setup baseline</h2>
    <p>If you have PostgreSQL installed, you already have <code>psql</code>. It's not a diagram tool, but it shows schema structure:</p>
    <pre><code>\\dt             , list all tables
\\d table_name   , show one table's structure</code></pre>
    <p>For relationships, query <code>information_schema</code> directly. The output is text, not a picture. Past a dozen tables you're reconstructing the graph in your head.</p>

    <h2>2. pgAdmin ERD: free and built in</h2>
    <p>pgAdmin 4 includes an ER diagram tool. Right-click your database, select <em>ERD For Database</em>, and it generates a diagram from the live schema.</p>
    <p><strong>Pros:</strong> Free, already installed, connects to live database.</p>
    <p><strong>Cons:</strong> Auto-layout struggles past a few dozen tables. No SVG export. Not shareable without screenshots.</p>

    <h2>3. dbdiagram.io: the popular choice</h2>
    <p>dbdiagram.io is the most well-known database diagram tool. You write schema definitions in DBML (a custom markup language) and it renders an interactive diagram. Full head-to-head: <a href="https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr">dbdiagram.io vs dbdiagramr</a>.</p>
    <p><strong>Pros:</strong> Clean UI, good for designing new schemas, shareable links.</p>
    <p><strong>Cons:</strong> Must learn DBML. Free tier includes 10 diagrams, PDF/PNG/SVG export, public sharing, Private mode, and embedding. No live database connection, the diagram is always a manual copy.</p>

    <h2>4. DrawSQL: the browser-based design option</h2>
    <p>DrawSQL is a browser-based editor. It imports SQL DDL and exports SQL, Laravel, images; JSON and SVG on paid plans. It does not connect to a live database. Supports MySQL, PostgreSQL, SQL Server, and MariaDB. Full head-to-head: <a href="https://www.dbdiagramr.space/drawsql-vs-dbdiagramr">DrawSQL vs dbdiagramr</a>.</p>
    <p><strong>Pros:</strong> Browser-based, SQL, Laravel, images; JSON and SVG on paid plans; team collaboration (paid).</p>
    <p><strong>Cons:</strong> Paid for private diagrams and full features. Free plan is public only, up to 15 tables per diagram.</p>

    <h2>5. dbdiagramr: paste SQL, get a diagram</h2>
    <p><a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> takes a different approach: paste SQL or a PostgreSQL connection string, get an interactive ER diagram. No account, no install, no table limits. The same engine powers the <a href="https://www.dbdiagramr.space/tools">free tools page</a> (SQL formatter, schema health analyzer) and the <a href="https://www.dbdiagramr.space/schema">interactive schema library</a>, real schemas like Chinook and Pagila you can explore before touching your own database.</p>
    <p>Because it introspects the live database, the diagram is always current. Change a migration, paste the same connection string again, up-to-date in under 10 seconds.</p>
    <p><strong>Pros:</strong> Free, no signup, no limits, live connection, SVG/PNG export, search tables/columns.</p>
    <p><strong>Cons:</strong> PostgreSQL only (for now).</p>

    <h2>Beyond dedicated tools: IDEs and migrations</h2>
    <p>Dedicated diagram tools are not the only option. Your database client may already draw a diagram, and your migrations already contain the schema in code.</p>
    <h3>IDE and client built-ins</h3>
    <ul>
      <li><strong>pgAdmin 4</strong>: right-click the database and choose <em>ERD For Database</em>. Free and already installed, but the auto-layout struggles past a few dozen tables.</li>
      <li><strong>DBeaver</strong> (Community is enough): open the <em>ER Diagram</em> tab. Free, cross-platform, and exports PNG or SVG.</li>
      <li><strong>DataGrip</strong>: choose <em>Diagrams &rarr; Show Visualization</em>. The best interactive feel, but paid and single-user.</li>
    </ul>
    <p>All three share the same limitation: the diagram is a snapshot. There is nothing to share but an exported image, and it drifts the moment someone runs a migration.</p>
    <h3>Generate from migrations</h3>
    <p>If your schema lives in migration files (Prisma, Drizzle, Rails, Flyway), you can derive a diagram from code instead of a live connection:</p>
    <pre><code>pg_dump --schema-only mydb &gt; schema.sql</code></pre>
    <p>Then feed the DDL to any SQL-to-diagram tool. This documents the migrations, not necessarily what is deployed, and regenerating on every change is automation you have to build and maintain.</p>
    <p>For Prisma, generate the DDL first. Prisma 7 and later use <code>--to-schema</code>:</p>
    <pre><code>npx prisma migrate diff --from-empty --to-schema=prisma/schema.prisma --script &gt; schema.sql</code></pre>
    <p>Prisma 6 and earlier use <code>--to-schema-datamodel</code>:</p>
    <pre><code>npx prisma migrate diff --from-empty --to-schema-datamodel=prisma/schema.prisma --script &gt; schema.sql</code></pre>

    <h2>How to turn SQL into a diagram</h2>
    <p>You can start from three inputs, depending on what you have:</p>
    <ul>
      <li><strong>Paste SQL.</strong> Paste <code>CREATE TABLE</code> statements directly into the editor. Parsing happens in your browser.</li>
      <li><strong>Upload a <code>.sql</code> file.</strong> Drag the dump or migration export onto the page, or use the file picker.</li>
      <li><strong>Connect to PostgreSQL.</strong> Paste a read-only connection string. The backend reads schema metadata for one request, then discards the string; it never stores it and never reads table rows.</li>
    </ul>
    <p>For a dump, <code>pg_dump --schema-only yourdb &gt; schema.sql</code> gives you the DDL without data. Paste or upload that file, then pan, zoom, drag tables, and export SVG or PNG.</p>
    <h3>What SQL syntax works</h3>
    <p>The parser understands standard PostgreSQL DDL: <code>CREATE TABLE</code>, column types, <code>PRIMARY KEY</code>, <code>REFERENCES</code>, <code>DEFAULT</code>, <code>NOT NULL</code>, <code>UNIQUE</code>, and <code>ON DELETE</code> / <code>ON UPDATE</code> actions. If it is valid PostgreSQL DDL, it should parse.</p>

    <h2>Which tool should you choose?</h2>
    <ul>
      <li><strong>Just need a quick look?</strong> <code>psql</code> or pgAdmin. Fast, local, no sharing.</li>
      <li><strong>Designing a new schema?</strong> dbdiagram.io. Great for planning before you build.</li>
      <li><strong>Need to understand an existing database?</strong> dbdiagramr. Paste SQL or connect, get a diagram in seconds.</li>
      <li><strong>Team collaboration?</strong> DrawSQL paid plan. Real-time editing with multiple cursors.</li>
    </ul>

    <h2>Why "stays current" matters</h2>
    <p>Every tool except dbdiagramr shares the same failure mode: the diagram is a snapshot. The day someone runs a migration, the diagram is wrong. A wrong diagram is worse than none, it's confidently wrong.</p>
    <p>The test that settles it: <strong>how much work does it take to make this picture true again?</strong> If the answer is "re-export" or "drag boxes by hand," humans will stop doing it and the diagram will lie to you.</p>

    <h2>FAQ</h2>
    <p><strong>What's the best database schema diagram tool for PostgreSQL?</strong><br/>For understanding an existing database, dbdiagramr is the fastest, paste SQL or connect to a live database, no signup required.</p>
    <p><strong>Can I use dbdiagram.io without learning DBML?</strong><br/>Not really. DBML is the input format. If you prefer raw SQL, dbdiagramr accepts it directly.</p>
    <p><strong>Is pgAdmin's ERD tool good enough?</strong><br/>For small schemas and quick inspection, yes. For anything you need to share or keep current, use a dedicated tool.</p>
    <p><strong>Does DrawSQL support live PostgreSQL connections?</strong><br/>No. DrawSQL imports SQL DDL; it does not connect to a live database. The free plan is public only, up to 15 tables per diagram.</p>
    <p><strong>Can I create a Postgres ERD without connecting to the live database?</strong><br/>Yes. Run <code>pg_dump --schema-only</code> and feed the DDL to a SQL-to-diagram tool, or parse migration files. This is safer when you cannot expose production credentials.</p>
    <p><strong>Does it work with MySQL?</strong><br/>Not yet. The parser currently targets PostgreSQL DDL. MySQL support is planned.</p>
    <p><strong>How large a schema can it handle?</strong><br/>Schemas with dozens of tables work comfortably. Very large schemas (100+ tables) may need manual arrangement, but parsing still works.</p>
    <p><strong>How do I keep a schema diagram up to date?</strong><br/>Manual tools require manual regeneration, so they drift. The reliable fix is introspection: regenerate straight from the live database, or wire documentation generation into CI.</p>
  `,
  "database-schema-health-check": `
    <h2>The short version</h2>
    <p>Most schema problems are boring and preventable: a table with no primary key, a foreign key nobody indexed, <code>userId</code> in one table and <code>user_id</code> in the next. A 60-second health check catches them before they become production incidents.</p>
    <p><a href="https://www.dbdiagramr.space/database-schema-analyzer">dbdiagramr's free schema analyzer</a> grades your PostgreSQL schema 0-100 against seven checks and gives you a one-line fix for each issue. Paste SQL, get the report. Nothing leaves your browser.</p>

    <h2>The 7 checks, in priority order</h2>

    <h3>1. Every table needs a primary key</h3>
    <p>No primary key means no reliable row identity, painful replication, and ORMs that misbehave. This is the one error-level check. Fix it before anything else.</p>
    <pre><code>-- bad: no way to address a single row
CREATE TABLE events (
  name TEXT,
  happened_at TIMESTAMPTZ
);

-- good
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);</code></pre>

    <h3>2. Index your foreign keys</h3>
    <p>PostgreSQL does not automatically index foreign key columns. Without an index, joins against the child table and deletes on the parent table degrade into sequential scans. The fix is one line per FK:</p>
    <pre><code>CREATE INDEX idx_posts_user_id ON posts (user_id);</code></pre>

    <h3>3. Make foreign keys NOT NULL unless optional</h3>
    <p>A nullable <code>user_id</code> says "this row may belong to nobody." Sometimes that is true (a draft, an anonymous session). Usually it is an accident that later produces orphan-handling code everywhere.</p>

    <h3>4. Don't name a non-PK column "id"</h3>
    <p>Every reader assumes <code>id</code> is the primary key. A table with both a UUID <code>pk</code> and an integer <code>id</code> guarantees confusion in every query written against it.</p>

    <h3>5. One naming convention</h3>
    <p><code>snake_case</code> is the Postgres norm. A schema that mixes <code>userId</code> and <code>user_id</code> forces every query author to guess. Pick one and rename.</p>

    <h3>6. Watch wide tables</h3>
    <p>Past ~30 columns, a table is usually two tables wearing a trench coat. Split rarely-used or repeated column groups into a related table.</p>

    <h3>7. Add created_at</h3>
    <p><code>created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()</code> costs nothing and pays for itself the first time you debug a data issue at 2am.</p>

    <h2>How to run the check</h2>
    <ol>
      <li>Export your schema: <code>pg_dump --schema-only yourdb &gt; schema.sql</code></li>
      <li>Paste it into the <a href="https://www.dbdiagramr.space/database-schema-analyzer">schema analyzer</a></li>
      <li>Fix errors first, then warnings, then notes</li>
      <li>Copy the Markdown report into your PR or design doc</li>
      <li>Visualize the clean schema with <a href="https://www.dbdiagramr.space/visualize">dbdiagramr</a> to confirm the relationships look right</li>
    </ol>

    <h2>FAQ</h2>
    <p><strong>How often should I audit my schema?</strong><br/>On every migration that adds tables or foreign keys, plus a full pass quarterly. The automated check takes a minute.</p>
    <p><strong>Does the analyzer see my data?</strong><br/>No. It reads table and column definitions only, and it runs entirely in your browser. Your SQL is never uploaded.</p>
    <p><strong>What score should I aim for?</strong><br/>90+ (grade A) for production schemas. Anything below 60 almost always means missing primary keys. Fix those first.</p>
  `,
  "how-to-format-sql-postgres": `
    <h2>The short version</h2>
    <p>Unformatted SQL (a 400-character single line from your logs, an ORM dump with random indentation) slows down everyone who reads it. Formatting is a solved problem: paste it into a formatter, pick a style, move on.</p>
    <p><a href="https://www.dbdiagramr.space/sql-formatter">dbdiagramr's free SQL formatter</a> formats PostgreSQL in your browser. Uppercase or lowercase keywords, 2 or 4 space indent, copy or download. Nothing is uploaded.</p>

    <h2>What "formatted" actually means</h2>
    <p>Take this real-world log line:</p>
    <pre><code>select u.email, count(p.id) as post_count from users u left join posts p on p.user_id = u.id where u.created_at > now() - interval '30 days' group by u.email order by post_count desc limit 20;</code></pre>
    <p>Formatted:</p>
    <pre><code>SELECT
  u.email,
  count(p.id) AS post_count
FROM
  users u
  LEFT JOIN posts p ON p.user_id = u.id
WHERE
  u.created_at > now() - interval '30 days'
GROUP BY
  u.email
ORDER BY
  post_count DESC
LIMIT
  20;</code></pre>
    <p>Same query. The second version shows the misplaced JOIN or wrong GROUP BY in seconds; the first hides it.</p>

    <h2>Uppercase vs lowercase keywords</h2>
    <p>There is no technical difference. Postgres parses both identically. It is purely culture:</p>
    <ul>
      <li><strong>UPPERCASE</strong>: traditional DBA style, SQL Server and Oracle shops, certification materials. Keywords visually pop against table names.</li>
      <li><strong>lowercase</strong>: modern analytics style (dbt, Postgres-first teams). Less shouting, easier to type.</li>
    </ul>
    <p>Pick the one that matches your codebase and enforce it with a formatter, not a style doc nobody reads.</p>

    <h2>Where formatting pays off most</h2>
    <ul>
      <li><strong>Migration PRs</strong>: formatted DDL diffs review in minutes; single-line dumps review never.</li>
      <li><strong>Log triage</strong>: paste the slow query from pg_stat_statements or your app logs and read it.</li>
      <li><strong>Onboarding</strong>: new hires can read the schema migrations as documentation.</li>
      <li><strong>Before diagramming</strong>: clean SQL is easier to sanity-check before you <a href="https://www.dbdiagramr.space/visualize">visualize it as an ER diagram</a>.</li>
    </ul>

    <h2>FAQ</h2>
    <p><strong>Does formatting change what my query does?</strong><br/>No. A formatter only changes whitespace and keyword casing. Same semantics, better manners.</p>
    <p><strong>Can I format SELECT queries or only DDL?</strong><br/>Both: SELECTs, CTEs, JOINs, migrations, anything valid PostgreSQL.</p>
    <p><strong>Is my SQL sent to a server?</strong><br/>Not with dbdiagramr's formatter. It runs entirely in your browser.</p>
  `,
};
