import type { Schema } from "@/lib/diagram";
import { supabaseSchema } from "./supabase";
import { nextauthSchema } from "./nextauth";
import { laravelSchema } from "./laravel";
import { djangoSchema } from "./django";
import { stripeSchema } from "./stripe";
import { ecommerceSchema } from "./ecommerce";
import { librarySchema } from "./library";
import { hospitalSchema } from "./hospital";
import { rbacSchema } from "./rbac";
import { multitenantSchema } from "./multitenant";
import { chinookSchema } from "./chinook";
import { springbatchSchema } from "./springbatch";
import { pagilaSchema } from "./pagila";
import { betterauthSchema } from "./betterauth";
import { dvdrentalSchema } from "./dvdrental";
import { northwindSchema } from "./northwind";

export type SchemaSource = {
  /** Human-readable source, e.g. "Chinook database, version 1.4 (PostgreSQL script)" */
  label: string;
  /** Link to the official schema file or docs */
  url?: string;
  /** License name, e.g. "MIT", "Apache-2.0" */
  license?: string;
  /** Link to the license text */
  licenseUrl?: string;
  /** True for schemas designed by dbdiagramr rather than sourced externally */
  original?: boolean;
};

export type SchemaCategory = "auth" | "business" | "access" | "reference";

export type SchemaQuery = {
  title: string;
  description: string;
  sql: string;
};

export type SchemaScopeNote = {
  text: string;
  omitted: string;
  sourceLabel: string;
  sourceUrl: string;
};

export type SchemaEntry = {
  slug: string;
  category: SchemaCategory;
  name: string;
  title: string;
  h1: string;
  description: string;
  keywords: string[];
  intro: string;
  facts: { label: string; value: string }[];
  faqs: { q: string; a: string }[];
  lastUpdated: string;
  schema: Schema;
  /** Where the schema came from (dump origin + license, or original design) */
  source?: SchemaSource;
  /** Topical related schema slugs; same-category entries fill the gaps */
  related?: string[];
  /** Short query examples that run against this page's DDL */
  queries?: SchemaQuery[];
  /** Version/scope clarification shown above the diagram */
  scopeNote?: SchemaScopeNote;
  /** Optional clarification shown above the relationship table */
  relationshipNote?: string;
  /** Optional deep-dive notes rendered after the relationship table */
  guide?: {
    title: string;
    paragraphs: string[];
    sql?: string;
    sqlNote?: string;
  };
  /** Additional topic sections rendered after the guide */
  sections?: { title: string; body: string }[];
};

export const schemaEntries: SchemaEntry[] = [
  {
    slug: "supabase",
    category: "auth",
    name: "Supabase",
    title: "Supabase Auth Schema Diagram: Users, Identities, Sessions",
    h1: "Supabase Auth Schema Diagram",
    description:
      "See the Supabase auth schema as a diagram: auth.users, auth.identities, auth.sessions, and refresh_tokens with their core columns and foreign keys.",
    keywords: [
      "supabase auth schema",
      "supabase auth diagram",
      "supabase auth.users",
      "supabase identities table",
      "supabase sessions table",
      "supabase database schema",
    ],
    intro:
      "Every Supabase project ships with a built-in auth schema managed by GoTrue. This diagram maps the auth tables - auth.users, auth.identities, auth.sessions, and refresh_tokens - with the primary keys and foreign keys between them. It documents the built-in auth schema, not your app's public tables. To diagram your own Supabase project, connect it with the Supabase ER diagram tool.",
    facts: [
      { label: "Core tables", value: "7" },
      { label: "Schema", value: "auth" },
      { label: "Version", value: "GoTrue 2.197.0" },
    ],
    scopeNote: {
      text: "Core auth tables from Supabase Auth (GoTrue) v2.197.0, released 2026-09-09.",
      omitted:
        "Omitted here: MFA, SSO/SAML, OAuth, WebAuthn, and SCIM tables (20 optional tables in the full schema).",
      sourceLabel: "source migrations",
      sourceUrl: "https://github.com/supabase/auth/tree/v2.197.0/migrations",
    },
    faqs: [
      {
        q: "How many tables does the Supabase auth schema have?",
        a: "The core Supabase auth schema has 7 tables: users, identities, sessions, refresh_tokens, instances, audit_log_entries, and schema_migrations. GoTrue v2.197.0 also creates 20 optional tables for MFA, SSO/SAML, OAuth, WebAuthn, SCIM, and internal support.",
      },
      {
        q: "How do users relate to identities in Supabase?",
        a: "Every auth.users row can have multiple auth.identities rows linked by user_id. Each identity represents a sign-in method (email/password, Google, GitHub, etc.) for that user.",
      },
      {
        q: "How do I export the Supabase auth schema?",
        a: "Use the Supabase CLI for your public schema, then pg_dump for auth. The CLI dump filters managed schemas such as auth and storage, so it will not include the tables shown here.",
      },
      {
        q: "What happens to sessions when a user signs out?",
        a: "Supabase supports three scopes. The JavaScript client defaults to global, which ends every session for the user. local ends only the current session; others ends every other session. The affected sessions are removed, and refresh tokens for them are destroyed, but access tokens remain valid until they expire.",
      },
      {
        q: "Can I join auth.users to my public tables?",
        a: "Yes. auth.users.id is the user UUID. Store it in your public table, for example public.profiles.user_id, and join on that column.",
      },
    ],
    lastUpdated: "2026-10-23",
    relationshipNote:
      "sessions.oauth_client_id references auth.oauth_clients. That table is part of the optional OAuth group, so the column is shown here without a foreign-key line.",
    queries: [
      {
        title: "Sign-ins by provider",
        description: "Join each user to their identities and sessions.",
        sql: `select u.email, i.provider, s.created_at
from users u
join identities i on i.user_id = u.id
join sessions s on s.user_id = u.id
order by s.created_at desc
limit 50;`,
      },
      {
        title: "Current sessions",
        description: "List sessions that have not passed their not_after cutoff.",
        sql: `select s.id, u.email, s.aal, s.oauth_client_id, s.scopes
from sessions s
join users u on u.id = s.user_id
where s.not_after is null or s.not_after > now()
order by s.created_at desc;`,
      },
      {
        title: "Refresh token lineage",
        description: "Trace each refresh token to its session and parent token.",
        sql: `select rt.id, rt.session_id, s.user_id, rt.parent, rt.revoked
from refresh_tokens rt
left join sessions s on s.id = rt.session_id
order by rt.id desc
limit 100;`,
      },
      {
        title: "Users without an identity",
        description: "Find auth users that have no sign-in method linked.",
        sql: `select u.id, u.email
from users u
left join identities i on i.user_id = u.id
where i.id is null;`,
      },
    ],
    sections: [
      {
        title: "How to download or export your Supabase schema",
        body: `
          <p>The Supabase CLI dump is the quickest way to export your app schema:</p>
          <pre><code>supabase db dump --db-url "$SUPABASE_SESSION_POOLER_URL" -f supabase/schema.sql</code></pre>
          <p>The CLI filters Supabase-managed schemas, including <code>auth</code> and <code>storage</code>, so the file above will not contain the auth tables on this page. Dump <code>auth</code> separately with <code>pg_dump</code>:</p>
          <pre><code>pg_dump "$SUPABASE_SESSION_POOLER_URL" --schema-only --schema=auth --no-owner --no-privileges -f auth-schema.sql</code></pre>
          <p>Use the session pooler connection string on port 5432 for these commands. Use a <code>pg_dump</code> version at least as new as the PostgreSQL server version: newer <code>pg_dump</code> releases can dump older servers, but older ones cannot dump newer servers. See the <a href="https://supabase.com/docs/reference/cli/supabase-db-dump">Supabase CLI db dump reference</a> and the <a href="https://www.postgresql.org/docs/current/app-pgdump.html">PostgreSQL pg_dump documentation</a>.</p>
        `,
      },
      {
        title: "How the auth tables change during sign-in",
        body: `
          <p>These tables are written by Supabase Auth, not by your migrations. The main events look like this:</p>
          <table>
            <thead><tr><th>Event</th><th>What changes</th></tr></thead>
            <tbody>
              <tr><td>Sign-up</td><td>A row is created in <code>auth.users</code>. If email confirmations are enabled, the user must confirm the email before signing in (<a href="https://supabase.com/docs/guides/auth/passwords">password auth docs</a>).</td></tr>
              <tr><td>Identity link</td><td>Each sign-in method gets a row in <code>auth.identities</code>, linked by <code>user_id</code> (<a href="https://supabase.com/docs/guides/auth/identities">identities docs</a>).</td></tr>
              <tr><td>Sign-in</td><td>A row is created in <code>auth.sessions</code>. The access token carries a <code>session_id</code> claim matching the session primary key (<a href="https://supabase.com/docs/guides/auth/sessions">sessions docs</a>).</td></tr>
              <tr><td>Token refresh</td><td>Refresh tokens are one-time use. Reuse outside the documented grace cases terminates the session and revokes all refresh tokens for it (<a href="https://supabase.com/docs/guides/auth/sessions">sessions docs</a>).</td></tr>
              <tr><td>Sign-out</td><td><code>global</code> (the JavaScript default) ends all sessions; <code>local</code> ends the current session; <code>others</code> ends all but the current one. Affected sessions are removed and their refresh tokens are destroyed. Access tokens stay valid until they expire (<a href="https://supabase.com/docs/guides/auth/signout">sign-out docs</a>).</td></tr>
            </tbody>
          </table>
          <p>Supabase does not document the exact row-level timing for every internal write, including changes to <code>auth.refresh_tokens</code>. Treat those rows as managed state rather than an application event log.</p>
        `,
      },
      {
        title: "How users, identities, and sessions connect",
        body: `
          <p>The common query is "who is this user, through which provider, and on which sessions":</p>
          <pre><code>select u.email, i.provider, s.id as session_id
from auth.users u
join auth.identities i on i.user_id = u.id
join auth.sessions s on s.user_id = u.id
where u.id = $1;</code></pre>
          <p><code>auth.identities.user_id</code> and <code>auth.sessions.user_id</code> both point at <code>auth.users.id</code>. Your public profile table should use the same UUID, for example <code>public.profiles.user_id references auth.users(id)</code>, so a profile joins directly to the auth user. A normal user has at least one identity; sessions are per sign-in and can be many.</p>
        `,
      },
      {
        title: "Working with auth tables safely",
        body: `
          <ul>
            <li><strong>Treat <code>auth</code> as read-only.</strong> Create users, identities, and sessions through the Supabase client or Admin API, not with direct inserts.</li>
            <li><strong>Do not store passwords yourself.</strong> The password flow writes a hash into the managed auth tables; direct writes bypass that handling.</li>
            <li><strong>Keep the secret key on the server.</strong> The secret key bypasses Row Level Security, so it must never reach a browser.</li>
            <li><strong>Use <code>auth.uid()</code> in RLS policies.</strong> It returns the current user's UUID, which is the value your public tables should reference.</li>
            <li><strong>Export schema, not data.</strong> Use <code>--schema-only</code> when the dump is for documentation or review.</li>
          </ul>
        `,
      },
    ],
    schema: supabaseSchema,
    source: {
      label: "Supabase auth migrations v2.197.0 (supabase/auth)",
      url: "https://github.com/supabase/auth/tree/v2.197.0/migrations",
      license: "Apache-2.0",
      licenseUrl: "https://github.com/supabase/auth/blob/master/LICENSE",
    },
    related: ["better-auth", "nextauth", "django", "laravel", "rbac"],
  },
  {
    slug: "nextauth",
    category: "auth",
    name: "NextAuth.js",
    title: "NextAuth.js Database Schema (Auth.js)",
    h1: "NextAuth.js Database Schema",
    description:
      "The complete NextAuth.js / Auth.js schema diagram - users, accounts, sessions, and verification_token with all columns and relationships.",
    keywords: [
      "nextauth schema",
      "nextauth database schema",
      "nextauth prisma schema",
      "auth.js schema",
      "nextauth users accounts sessions",
      "nextauth er diagram",
    ],
    intro:
      "NextAuth.js (now Auth.js) persists users, OAuth accounts, sessions, and email verification tokens in four tables: users, accounts, sessions, and verification_token. This diagram follows the PostgreSQL adapter's SQL: accounts and sessions have their own id, and both carry a userId that points at users.id. A single user can have many accounts (one per OAuth provider) and many sessions.",
    facts: [
      { label: "Tables", value: "4" },
      { label: "Core table", value: "users" },
      { label: "Relationship", value: "User 1→N Account" },
    ],
    relationshipNote:
      "These are the userId joins the PostgreSQL adapter uses. Its SQL does not declare foreign-key constraints; the Prisma adapter's PostgreSQL schema does, with ON DELETE CASCADE for accounts and sessions.",
    faqs: [
      {
        q: "How many tables does NextAuth.js use?",
        a: "The default NextAuth.js / Auth.js database schema uses 4 tables: users, accounts, sessions, and verification_token.",
      },
      {
        q: "What is the relationship between users and accounts in NextAuth?",
        a: "It's a one-to-many relationship. A single user can have multiple accounts - one for each OAuth provider they sign in with (Google, GitHub, etc.). Each account row has a userId referencing users.id.",
      },
      {
        q: "Does NextAuth store passwords?",
        a: "No. The Credentials provider does not persist data in the database by default. If you use it, your own code must store the user and hash the password, for example with bcrypt or argon2.",
      },
      {
        q: "Can I add custom fields to the NextAuth tables?",
        a: "Yes. Auth.js models can be extended with additional fields. Add the columns in your database schema and populate them in your own code; Auth.js only manages the fields its adapter defines.",
      },
      {
        q: "What happens when a user deletes their account?",
        a: "It depends on the adapter. The Prisma adapter's PostgreSQL schema uses onDelete: Cascade for Account.user and Session.user, so deleting a user removes those rows. The PostgreSQL adapter's SQL does not declare foreign keys, so it does not cascade; delete child rows yourself or add the constraints.",
      },
    ],
    lastUpdated: "2026-10-23",
    sections: [
      {
        title: "What each NextAuth table stores",
        body: `
          <p>The four tables have separate jobs. The adapter expects these names and columns; the values come from the provider or from Auth.js itself.</p>
          <table>
            <thead><tr><th>Table</th><th>What it stores</th></tr></thead>
            <tbody>
              <tr><td><code>users</code></td><td>One row per person: id, display name, email, verification timestamp, and profile image. A user can own several accounts and sessions.</td></tr>
              <tr><td><code>accounts</code></td><td>One row per provider link: the provider name, the provider's account id, OAuth tokens, and the owning <code>userId</code>. A user with Google and GitHub has two rows.</td></tr>
              <tr><td><code>sessions</code></td><td>One row per database session: the session token, the owning <code>userId</code>, and the expiry time. Use this table only with the database session strategy.</td></tr>
              <tr><td><code>verification_token</code></td><td>Short-lived tokens for email magic-link sign-in. The identifier and token form the primary key; rows are single-use and expire after one day by default.</td></tr>
            </tbody>
          </table>
          <p><strong>Exact verification table name:</strong> the <code>@auth/pg-adapter</code> SQL creates <code>verification_token</code> (singular). Prisma's PostgreSQL model is named <code>VerificationToken</code> and creates a quoted <code>"VerificationToken"</code> table by default. <code>verification_tokens</code> exists only if you add a <code>@@map</code> yourself, so this page uses the adapter's singular name.</p>
          <p>The PostgreSQL adapter's SQL does not declare foreign-key constraints. The relationships shown in the diagram are the <code>userId</code> joins the adapter uses. The Prisma adapter's PostgreSQL schema does declare them and adds <code>onDelete: Cascade</code> for accounts and sessions.</p>
        `,
      },
      {
        title: "Custom fields, passwords, and account deletion",
        body: `
          <p><strong>Custom fields.</strong> Auth.js models can be extended with additional fields. Add columns to the relevant table and populate them in your own application code; the adapter still manages the fields it defines. A common example is a <code>role</code> column on <code>users</code>.</p>
          <p><strong>Passwords.</strong> The Credentials provider does not persist data in the database by default. If you use it, your own code stores the user and hashes the password, for example with bcrypt or argon2. Auth.js is not a password manager.</p>
          <p><strong>Account deletion.</strong> With the Prisma adapter's PostgreSQL schema, <code>Account.user</code> and <code>Session.user</code> use <code>onDelete: Cascade</code>, so a database-enforced user delete removes the linked rows. With the PostgreSQL adapter's SQL, there are no foreign keys, so deletes do not cascade; remove accounts and sessions in the same transaction or add your own constraints. Do not assume one adapter's behavior applies to the other.</p>
          <p>Read the <a href="https://authjs.dev/concepts/database-models">Auth.js database models</a> and the <a href="https://authjs.dev/getting-started/authentication/credentials">Credentials provider docs</a> for the source wording.</p>
        `,
      },
    ],
    schema: nextauthSchema,
    source: {
      label: "Auth.js database adapter schema (next-auth)",
      url: "https://authjs.dev/getting-started/adapters/pg",
      license: "MIT",
      licenseUrl: "https://github.com/nextauthjs/next-auth/blob/main/LICENSE",
    },
    related: ["better-auth", "supabase", "django", "laravel", "rbac"],
  },
  {
    slug: "laravel",
    category: "auth",
    name: "Laravel",
    title: "Laravel Database Schema Diagram",
    h1: "Laravel Database Schema Diagram",
    description:
      "The default Laravel 13 database schema diagram - users, password_reset_tokens, sessions, jobs, job_batches, failed_jobs, cache, and cache_locks with all columns.",
    keywords: [
      "laravel schema",
      "laravel database schema",
      "laravel users table",
      "laravel migrations schema",
      "laravel er diagram",
      "laravel database diagram",
    ],
    intro:
      "A fresh Laravel 13 application ships with eight framework tables created by the default migrations: users, password_reset_tokens, sessions, cache, cache_locks, jobs, job_batches, and failed_jobs. This diagram shows the full default schema - the users table with password and remember_token columns, the sessions table with its user_id index, and the queue tables that track jobs and batches.",
    facts: [
      { label: "Tables", value: "8" },
      { label: "Core table", value: "users" },
      { label: "Framework", value: "Laravel 13" },
    ],
    faqs: [
      {
        q: "What tables does a default Laravel installation have?",
        a: "The default Laravel 13 migrations create users, password_reset_tokens, sessions, cache, cache_locks, jobs, job_batches, and failed_jobs tables.",
      },
      {
        q: "Does the Laravel sessions table reference the users table?",
        a: "Yes. The sessions table has a nullable user_id column with an index. It is not a foreign-key constraint in the default migration, so you can look up a session's user but the database does not enforce the reference.",
      },
      {
        q: "Is personal_access_tokens created by default?",
        a: "No. personal_access_tokens belongs to Laravel Sanctum. It is created only when Sanctum is installed and its migration runs.",
      },
      {
        q: "Where is job_batches in Laravel?",
        a: "job_batches is created by the default jobs migration. It stores batch id, name, job counts, failed job ids, options, cancellation time, creation time, and finish time.",
      },
    ],
    lastUpdated: "2026-10-23",
    sections: [
      {
        title: "What each default Laravel table does",
        body: `
          <p>The default migrations are split by purpose. The first file creates authentication and session storage; the second creates the cache; the third creates queue tracking.</p>
          <table>
            <thead><tr><th>Table</th><th>Purpose</th></tr></thead>
            <tbody>
              <tr><td><code>users</code></td><td>Application accounts: name, unique email, password hash, verification timestamp, and remember token.</td></tr>
              <tr><td><code>password_reset_tokens</code></td><td>One row per email address requesting a reset, keyed by email, with the hashed token and creation time.</td></tr>
              <tr><td><code>sessions</code></td><td>Server-side session payloads keyed by a string session id, with an indexed <code>user_id</code>, IP address, user agent, and last activity time.</td></tr>
              <tr><td><code>cache</code> / <code>cache_locks</code></td><td>Database cache values and locks, keyed by cache key, with expiration timestamps.</td></tr>
              <tr><td><code>jobs</code></td><td>Queued jobs waiting to run, with queue name, payload, attempts, reservation time, and availability time.</td></tr>
              <tr><td><code>job_batches</code></td><td>Batch metadata: total, pending, and failed counts, failed job ids, options, cancellation, creation, and finish times.</td></tr>
              <tr><td><code>failed_jobs</code></td><td>Jobs that exhausted their attempts, with connection, queue, payload, exception, and failure time.</td></tr>
            </tbody>
          </table>
          <p>The <code>sessions.user_id</code> column is indexed but is not declared as a foreign key in the default migration. That keeps the session table usable when users are deleted or when the session driver runs without a users table.</p>
        `,
      },
      {
        title: "Default tables vs package tables",
        body: `
          <p>Only the eight tables above come from a fresh <code>laravel/laravel</code> install. Other common tables arrive with packages or optional Artisan commands:</p>
          <ul>
            <li><code>personal_access_tokens</code> comes from Laravel Sanctum, not the framework skeleton.</li>
            <li><code>password_resets</code> is the old pre-Laravel 8 name. Current applications use <code>password_reset_tokens</code>.</li>
            <li>Older tutorials call the queue batch table <code>batches</code>; the current default migration creates <code>job_batches</code>.</li>
            <li>Redis can replace the database drivers for sessions, cache, and queues, in which case those tables may exist but go unused.</li>
          </ul>
          <p>The source for this page is the <a href="https://github.com/laravel/laravel/tree/13.x/database/migrations">Laravel 13 default migrations</a>.</p>
        `,
      },
    ],
    schema: laravelSchema,
    source: {
      label: "Laravel 13 default migrations (laravel/laravel)",
      url: "https://github.com/laravel/laravel/tree/13.x/database/migrations",
      license: "MIT",
      licenseUrl: "https://github.com/laravel/laravel/blob/13.x/LICENSE.md",
    },
    related: ["laravel", "better-auth", "nextauth", "supabase", "rbac"],
  },
  {
    slug: "django",
    category: "auth",
    name: "Django",
    title: "Django Auth Database Schema Diagram",
    h1: "Django Auth Database Schema Diagram",
    description:
      "The Django auth database schema diagram - auth_user, auth_group, auth_permission, and the many-to-many join tables with all foreign keys.",
    keywords: [
      "django auth schema",
      "django database schema",
      "django auth_user table",
      "django permissions schema",
      "django er diagram",
      "django auth erd",
    ],
    intro:
      "Django's built-in auth app creates a set of authentication tables when you run migrate: auth_user, auth_group, auth_permission, plus the many-to-many join tables auth_user_groups, auth_user_user_permissions, and auth_group_permissions. This diagram maps the full schema - including how permissions link to content types through django_content_type, and how admin actions are logged in django_admin_log.",
    facts: [
      { label: "Tables", value: "9" },
      { label: "Core table", value: "auth_user" },
      { label: "Join tables", value: "3" },
    ],
    faqs: [
      {
        q: "What tables does Django auth create?",
        a: "Django's auth app creates auth_user, auth_group, auth_permission, and three many-to-many join tables: auth_user_groups, auth_user_user_permissions, and auth_group_permissions.",
      },
      {
        q: "How do Django users relate to groups and permissions?",
        a: "Users relate to groups through the auth_user_groups join table and to permissions through auth_user_user_permissions. Groups relate to permissions through auth_group_permissions. All three are many-to-many relationships.",
      },
      {
        q: "What is the difference between is_superuser and is_staff?",
        a: "is_superuser bypasses every permission check. is_staff only controls whether the user can sign in to the Django admin. A staff user still needs the relevant permissions, or superuser status, to change anything.",
      },
      {
        q: "Does Django create these tables automatically?",
        a: "Yes. Running python manage.py migrate creates django_content_type first, then the auth tables and join tables, then django_admin_log. You get all of them even if you only use users without groups.",
      },
    ],
    lastUpdated: "2026-10-20",
    guide: {
      title: "How Django's permission tables work",
      paragraphs: [
        "Django attaches permissions to models, not tables. Every model gets four rows in auth_permission, one each for add, change, delete, and view, and each row points at the model through django_content_type. That indirection is why adding a model and running migrations silently creates four new permissions.",
        "A user can receive permissions through a group or directly. auth_user_groups plus auth_group_permissions carry role-like membership; auth_user_user_permissions carries one-off grants. The two paths are separate, so a query that checks only groups will miss direct permissions.",
        "The tables arrive in migration order: django_content_type first, then auth_user, auth_group, auth_permission, and the three join tables, then django_admin_log from the admin app.",
      ],
      sql: `SELECT DISTINCT p.codename
FROM auth_permission p
JOIN django_content_type ct ON ct.id = p.content_type_id
LEFT JOIN auth_group_permissions gp ON gp.permission_id = p.id
LEFT JOIN auth_user_groups ug ON ug.group_id = gp.group_id AND ug.user_id = 42
LEFT JOIN auth_user_user_permissions up ON up.permission_id = p.id AND up.user_id = 42
WHERE ug.user_id = 42 OR up.user_id = 42;`,
      sqlNote:
        "This lists every permission for user 42 through both groups and direct grants.",
    },
    schema: djangoSchema,
    source: {
      label: "Django contrib.auth migrations (django/django)",
      url: "https://github.com/django/django/tree/main/django/contrib/auth",
      license: "BSD-3-Clause",
      licenseUrl: "https://github.com/django/django/blob/main/LICENSE",
    },
    related: ["laravel", "nextauth", "supabase"],
  },
  {
    slug: "stripe",
    category: "business",
    name: "Stripe",
    title: "Stripe Billing Database Schema Diagram",
    h1: "Stripe Billing Database Schema Diagram",
    description:
      "Stripe billing schema diagram: customers, products, prices, subscriptions, invoices, payment methods and payment intents with all foreign keys.",
    keywords: [
      "stripe database schema",
      "stripe billing schema",
      "stripe subscription schema",
      "stripe customers subscriptions invoices",
      "stripe er diagram",
      "stripe postgres schema",
    ],
    intro:
      "If you bill with Stripe, these are the tables behind the API. Customers own subscriptions and payment methods; subscriptions are composed of subscription items that reference prices; prices belong to products; invoices collect line items and link to payment intents. This diagram maps the full Stripe billing model as PostgreSQL tables. The shape you would build when syncing Stripe objects into your own database or designing a Stripe-like billing system from scratch.",
    facts: [
      { label: "Tables", value: "9" },
      { label: "Core table", value: "customers" },
      { label: "Billing flow", value: "Customer → Subscription → Invoice" },
    ],
    faqs: [
      {
        q: "What tables does a Stripe billing schema need?",
        a: "A Stripe-like billing schema needs customers, products, prices, subscriptions, subscription_items, invoices, invoice_line_items, payment_methods, and payment_intents. 9 tables covering the full subscription and payment lifecycle.",
      },
      {
        q: "How do Stripe subscriptions relate to invoices and payments?",
        a: "A customer has many subscriptions. Each subscription has many subscription_items (one per price). When a billing period ends, Stripe generates an invoice with line items; each invoice can have a payment_intent that charges the customer's default payment_method.",
      },
      {
        q: "Should subscriptions reference products or prices?",
        a: "Prices. A product is a catalog entry; a price is a purchasable variant with an amount and interval. Subscriptions are composed of subscription_items that each reference a price.",
      },
      {
        q: "How does Stripe handle multiple products in one subscription?",
        a: "Through subscription_items: one row per price in the subscription, each with its own quantity. One subscription can contain many items.",
      },
      {
        q: "What is the difference between an invoice and a payment intent?",
        a: "An invoice is a bill for what is owed. A payment intent is an attempt to collect it, with a status and payment method. One invoice can have multiple payment intents when a charge is retried.",
      },
    ],
    lastUpdated: "2026-10-23",
    sections: [
      {
        title: "The billing flow as joins",
        body: `
          <p>Once the tables exist, most billing questions are joins. This query finds what a customer is subscribed to and at what price:</p>
          <pre><code>select c.email, pr.name as product, p.unit_amount, si.quantity
from customers c
join subscriptions s on s.customer_id = c.id
join subscription_items si on si.subscription_id = s.id
join prices p on p.id = si.price_id
join products pr on pr.id = p.product_id
where s.status = 'active';</code></pre>
          <p>This one lists unpaid invoices with their latest payment attempt:</p>
          <pre><code>select i.id, i.amount_due, pi.status as payment_status
from invoices i
left join payment_intents pi on pi.invoice_id = i.id
where i.status != 'paid';</code></pre>
          <p>The join path is the model: customer to subscription, subscription to items, items to prices, prices to products. Invoices and payment intents hang off the customer and subscription rather than replacing them.</p>
        `,
      },
      {
        title: "Design details worth copying",
        body: `
          <ul>
            <li><strong>Prices, not products, are what you bill.</strong> One product ("Pro Plan") can have many prices ($10/month, $100/year). Subscription items reference prices, not products directly.</li>
            <li><strong>Subscription items allow multi-product subscriptions.</strong> One subscription can contain multiple prices (base plus add-on) with independent quantities.</li>
            <li><strong>Invoices are snapshots.</strong> <code>invoice_line_items</code> copies the price and amount at invoice time, so an old invoice stays truthful after a price change.</li>
            <li><strong>Payment intents are the audit trail.</strong> Every charge attempt is a row, including failed ones. Join them to invoices to see what was paid and what was not.</li>
          </ul>
        `,
      },
    ],
    schema: stripeSchema,
    source: {
      label: "Original design by dbdiagramr, modeled on the Stripe billing API",
      original: true,
    },
    related: ["ecommerce", "multi-tenant-saas", "rbac"],
  },
  {
    slug: "ecommerce",
    category: "business",
    name: "E-commerce",
    title: "E-commerce Database Schema Diagram (PostgreSQL)",
    h1: "E-commerce Database Schema Diagram",
    description:
      "E-commerce PostgreSQL schema diagram: customers, products, categories, carts, orders, order items, payments and reviews with all foreign keys.",
    keywords: [
      "ecommerce database schema",
      "ecommerce postgres schema",
      "ecommerce er diagram",
      "online store database schema",
      "shopping cart database schema",
      "orders products customers schema",
    ],
    intro:
      "Every online store is the same 11 tables with different CSS. Customers have addresses and carts; carts hold cart items that reference products; products belong to categories and have images; orders snapshot cart items into order items and collect payments; reviews link customers to products. This is the complete e-commerce schema diagram that powers Shopify, WooCommerce, and most custom PostgreSQL storefronts.",
    facts: [
      { label: "Tables", value: "11" },
      { label: "Core table", value: "orders" },
      { label: "Pattern", value: "Shopify / WooCommerce" },
    ],
    faqs: [
      {
        q: "What tables does an e-commerce database need?",
        a: "A standard e-commerce schema needs customers, addresses, categories, products, product_images, carts, cart_items, orders, order_items, payments, and reviews. 11 tables covering catalog, cart, checkout, and post-purchase flows.",
      },
      {
        q: "What is the difference between cart_items and order_items?",
        a: "cart_items are mutable. Quantities change until checkout. order_items are immutable snapshots copied from the cart at order time, preserving the price and product that was actually purchased even if the product later changes.",
      },
      {
        q: "Should I store prices as float or integer?",
        a: "Store integer cents. Floating-point rounding corrupts money. Use price_cents integer with a currency column, then divide by 100 only when displaying the amount.",
      },
      {
        q: "How do categories handle subcategories?",
        a: "With a self-referential foreign key: categories.parent_id references categories.id. Top-level categories have parent_id NULL; children point at their parent.",
      },
      {
        q: "How do I show a customer's order history?",
        a: "Join orders to order_items and products, then left join payments for the payment status. Filter by customer_id and order by placed_at descending.",
      },
    ],
    lastUpdated: "2026-10-23",
    sections: [
      {
        title: "How an order moves through the schema",
        body: `
          <p>The schema separates browsing from buying. Products and categories describe the catalog; carts and cart items describe an active session; orders and order items preserve what was actually bought.</p>
          <p><strong>Browse to cart.</strong> A customer browses <code>products</code>, joins <code>categories</code> and <code>product_images</code>, and adds rows to <code>cart_items</code> through a <code>carts</code> row. Cart rows are mutable: quantities change and items are removed.</p>
          <p><strong>Cart to order.</strong> At checkout, cart items are copied into <code>order_items</code>. The order row records the total, the chosen shipping and billing addresses, and timestamps. The order item keeps the price and product from that moment even if the catalog changes later.</p>
          <p><strong>Order to payment to review.</strong> <code>payments</code> records each charge attempt against the order. After fulfillment, <code>reviews</code> links the customer and product.</p>
          <pre><code>select o.id, o.status, o.total_cents, p.status as payment_status,
       oi.quantity, pr.title
from orders o
join order_items oi on oi.order_id = o.id
join products pr on pr.id = oi.product_id
left join payments p on p.order_id = o.id
where o.customer_id = $1
order by o.placed_at desc;</code></pre>
        `,
      },
      {
        title: "Design decisions worth copying",
        body: `
          <ul>
            <li><strong>Cart vs order: mutable vs immutable.</strong> <code>cart_items</code> can change; <code>order_items</code> never should. Copy, do not move, at checkout.</li>
            <li><strong>Addresses are separate from customers.</strong> One customer can have home, work, and other addresses. Orders reference a specific address row so the address at order time is preserved after a move.</li>
            <li><strong>Categories are self-referential.</strong> <code>categories.parent_id</code> points at <code>categories.id</code>, which builds a tree such as Electronics → Phones → Cases without a separate hierarchy table.</li>
            <li><strong>Money is integer cents.</strong> Avoid floating-point rounding. Store <code>price_cents integer</code> with a <code>currency</code> column.</li>
            <li><strong>Payments are attempts, not a boolean.</strong> A separate <code>payments</code> row per attempt preserves retries and failures instead of overwriting one status field.</li>
          </ul>
        `,
      },
    ],
    schema: ecommerceSchema,
    source: {
      label: "Original design by dbdiagramr, modeled on Shopify / WooCommerce",
      original: true,
    },
    related: ["stripe", "multi-tenant-saas"],
  },
  {
    slug: "library-management-system",
    category: "business",
    name: "Library Management System",
    title: "Library Management System ER Diagram (PostgreSQL)",
    h1: "Library Management System ER Diagram",
    description:
      "Library management ER diagram: books, authors, copies, members, loans, reservations, and fines, with every column and foreign key.",
    keywords: [
      "library management system er diagram",
      "library management system database schema",
      "library database schema",
      "library er diagram with attributes",
      "lms database schema postgres",
      "library management system tables",
    ],
    intro:
      "The library management system is the classic DBMS lab project: members borrow books through loans, and the diagram maps all ten tables. Publishers publish books identified by ISBN; authors link to books through a book_authors join table; each title has many physical copies; members take out loans against copies, place reservations against titles, and accrue fines per loan. The modeling detail most student diagrams get wrong is the ISBN-versus-copy split: ISBN identifies a title, so a loan must reference a physical copy row - you cannot join a loan to an ISBN and know which book is actually on the shelf.",
    facts: [
      { label: "Tables", value: "10" },
      { label: "Core flow", value: "Title -> Copy -> Loan" },
      { label: "Join tables", value: "1" },
    ],
    faqs: [
      {
        q: "What tables does a library management system database need?",
        a: "A standard library schema needs publishers, authors, books, book_authors, copies, members, librarians, loans, reservations, and fines - 10 tables covering catalog, circulation, and overdue handling.",
      },
      {
        q: "Why do loans reference copies instead of books?",
        a: "Because ISBN identifies a title, not a physical item. When a member borrows a book, the loan must point at the exact copy on the shelf (its barcode and status). Reservations, by contrast, reference the title (ISBN) since the member is waiting for any available copy.",
      },
      {
        q: "How are books with multiple authors modeled?",
        a: "Through the book_authors join table - a many-to-many link between books (by ISBN) and authors. Each row pairs one title with one author, so a book can have many authors and an author can write many books.",
      },
    ],
    lastUpdated: "2026-10-23",
    queries: [
      {
        title: "Overdue loans",
        description: "Loans that are still out and past their due date.",
        sql: `select l.id, b.title, m.email, l.due_at
from loans l
join copies c on c.id = l.copy_id
join books b on b.isbn = c.isbn
join members m on m.id = l.member_id
where l.returned_at is null and l.due_at < now()
order by l.due_at;`,
      },
      {
        title: "Member loan history",
        description: "Borrowing history for a member, newest first.",
        sql: `select m.email, b.title, l.issued_at, l.returned_at
from members m
join loans l on l.member_id = m.id
join copies c on c.id = l.copy_id
join books b on b.isbn = c.isbn
order by l.issued_at desc;`,
      },
      {
        title: "Open reservations",
        description: "Titles waiting to be fulfilled, with the requesting member.",
        sql: `select b.title, m.email, r.reserved_at
from reservations r
join books b on b.isbn = r.isbn
join members m on m.id = r.member_id
where r.fulfilled_at is null
order by r.reserved_at;`,
      },
      {
        title: "Books per author",
        description: "Count titles through the book_authors join table.",
        sql: `select a.first_name, a.last_name, count(ba.isbn) as books
from authors a
left join book_authors ba on ba.author_id = a.id
group by a.id, a.first_name, a.last_name
order by books desc, a.last_name;`,
      },
    ],
    schema: librarySchema,
    source: {
      label: "Original design by dbdiagramr, modeled on standard DBMS textbook schemas",
      original: true,
    },
    related: ["hospital-management-system", "ecommerce", "chinook", "pagila"],
  },
  {
    slug: "hospital-management-system",
    category: "business",
    name: "Hospital Management System",
    title: "Hospital Management System Database Schema (PostgreSQL)",
    h1: "Hospital Management System Database Schema",
    description:
      "Hospital management ER diagram: patients, staff, appointments, records, prescriptions, admissions, billing, and payments with foreign keys.",
    keywords: [
      "hospital management system database schema",
      "hospital management system er diagram",
      "hospital database schema",
      "hospital er diagram with attributes",
      "hms database tables postgres",
      "patient appointment billing schema",
    ],
    intro:
      "A hospital management system connects patient care to billing in twelve tables. Patients book appointments with doctors; visits produce medical records; records carry prescriptions that reference a medications catalog; inpatient stays flow through admissions into rooms and beds; and every visit or stay rolls up into bills, which are settled by individual payments. Two modeling choices keep the schema tight: a single staff table covers doctors, nurses, and admin via a role column (so appointments reference staff, not doctors), and billing splits into bills (the aggregate) and payments (each settlement attempt) so partial and failed payments are representable.",
    facts: [
      { label: "Tables", value: "12" },
      { label: "Core table", value: "patients" },
      { label: "Care flow", value: "Patient -> Appointment -> Record -> Bill" },
    ],
    faqs: [
      {
        q: "What tables does a hospital management system database need?",
        a: "A standard hospital schema needs departments, patients, staff, rooms, beds, appointments, medical_records, medications, prescriptions, admissions, bills, and payments - 12 tables covering scheduling, clinical care, inpatient stays, and billing.",
      },
      {
        q: "Should doctors and nurses be separate tables?",
        a: "Usually not. A single staff table with a role column (doctor, nurse, admin) plus department and specialization columns covers all personnel, and appointments can reference any staff member. Split them only when doctors and nurses need very different columns.",
      },
      {
        q: "How are bills and payments modeled in a hospital schema?",
        a: "Bills aggregate charges against a patient (optionally tied to one admission or appointment) with insurance-covered and status columns. Payments are separate rows per settlement attempt against a bill, which models partial payments and failed transactions naturally.",
      },
    ],
    lastUpdated: "2026-10-23",
    queries: [
      {
        title: "Appointment schedule",
        description: "Upcoming appointments with the patient, doctor, and department.",
        sql: `select a.appointment_at, p.first_name || ' ' || p.last_name as patient,
       st.first_name || ' ' || st.last_name as doctor,
       d.name as department, a.status
from appointments a
join patients p on p.id = a.patient_id
join staff st on st.id = a.doctor_id
left join departments d on d.id = a.department_id
where a.appointment_at >= now()
order by a.appointment_at;`,
      },
      {
        title: "Outstanding bills",
        description: "Bills with the amount paid so far and the remaining balance.",
        sql: `select b.id, p.first_name || ' ' || p.last_name as patient,
       b.total_amount,
       coalesce(sum(pay.amount), 0) as paid,
       b.total_amount - coalesce(sum(pay.amount), 0) as balance
from bills b
join patients p on p.id = b.patient_id
left join payments pay on pay.bill_id = b.id
where b.status <> 'paid'
group by b.id, p.first_name, p.last_name, b.total_amount
order by balance desc;`,
      },
      {
        title: "Current admissions",
        description: "Inpatients with their room and bed.",
        sql: `select p.first_name || ' ' || p.last_name as patient,
       r.number as room, b.bed_number, a.admitted_at
from admissions a
join patients p on p.id = a.patient_id
join beds b on b.id = a.bed_id
join rooms r on r.id = b.room_id
where a.discharged_at is null
order by a.admitted_at;`,
      },
      {
        title: "Prescriptions per medical record",
        description: "Every medication prescribed during a visit.",
        sql: `select mr.id as record_id, m.name as medication,
       pr.dosage, pr.frequency, pr.duration_days
from prescriptions pr
join medical_records mr on mr.id = pr.record_id
join medications m on m.id = pr.medication_id
order by mr.id, m.name;`,
      },
    ],
    schema: hospitalSchema,
    source: {
      label: "Original design by dbdiagramr, modeled on standard DBMS textbook schemas",
      original: true,
    },
    related: ["library-management-system", "ecommerce", "stripe", "multi-tenant-saas"],
  },
  {
    slug: "rbac",
    category: "access",
    name: "RBAC",
    title: "RBAC Database Schema: Roles, Permissions & Joins",
    h1: "RBAC Database Schema",
    description:
      "RBAC schema diagram: users, organizations, roles, permissions, and join tables, with every column and foreign key.",
    keywords: [
      "rbac database schema",
      "role based access control database design",
      "roles permissions database schema",
      "user roles permissions erd",
      "rbac schema postgres",
      "authorization database schema",
    ],
    intro:
      "Role-based access control resolves one question: does this user have this permission right now. The schema answers it with seven tables. Users join organizations through memberships; roles are scoped to an organization; permissions are global resource-plus-action pairs; membership_roles grants a membership a role; role_permissions grants a role its permissions. A permission check is then a three-join path: membership -> membership_roles -> role_permissions -> permissions. The deliberate choice is org-scoped roles: permission names stay tenant-free, so the same role definitions (admin, editor, viewer) can be re-created per organization without any tenant column on the permission table itself.",
    facts: [
      { label: "Tables", value: "7" },
      { label: "Check path", value: "Membership -> Role -> Permission" },
      { label: "Join tables", value: "2" },
    ],
    faqs: [
      {
        q: "What tables does an RBAC database schema need?",
        a: "An org-scoped RBAC schema needs organizations, users, memberships, roles, permissions, membership_roles, and role_permissions - 7 tables. The two join tables carry the many-to-many edges between memberships and roles, and between roles and permissions.",
      },
      {
        q: "How do you check a permission in SQL with this schema?",
        a: "Join from the user's membership through membership_roles to the role, then through role_permissions to permissions, filtering on resource and action: SELECT 1 FROM memberships m JOIN membership_roles mr ON mr.membership_id = m.id JOIN role_permissions rp ON rp.role_id = mr.role_id JOIN permissions p ON p.id = rp.permission_id WHERE m.user_id = ? AND m.organization_id = ? AND p.resource = 'articles' AND p.action = 'delete'.",
      },
      {
        q: "Should roles or permissions be scoped to the organization?",
        a: "Scope roles to the organization and keep permissions global. Permissions are vocabulary (resource + action pairs like articles:delete); roles are the org's policy (which permissions admin means here). This keeps permission names stable while each tenant defines its own roles.",
      },
    ],
    lastUpdated: "2026-10-23",
    queries: [
      {
        title: "Permission check",
        description: "The three-join path from a membership to a permission.",
        sql: `select 1
from memberships m
join membership_roles mr on mr.membership_id = m.id
join role_permissions rp on rp.role_id = mr.role_id
join permissions p on p.id = rp.permission_id
where m.user_id = '00000000-0000-0000-0000-000000000001'::uuid
  and m.organization_id = '00000000-0000-0000-0000-000000000002'::uuid
  and p.resource = 'articles'
  and p.action = 'delete';`,
      },
      {
        title: "Roles and permission counts",
        description: "See how many permissions each role grants.",
        sql: `select r.name, count(rp.permission_id) as permission_count
from roles r
left join role_permissions rp on rp.role_id = r.id
group by r.id, r.name
order by permission_count desc, r.name;`,
      },
      {
        title: "Memberships without roles",
        description: "Find organization members that have no role assigned.",
        sql: `select m.id, u.email, o.name as organization
from memberships m
join users u on u.id = m.user_id
join organizations o on o.id = m.organization_id
left join membership_roles mr on mr.membership_id = m.id
where mr.membership_id is null;`,
      },
      {
        title: "Permission matrix",
        description: "List every role, permission, and organization pairing.",
        sql: `select o.name as organization, r.name as role,
       p.resource, p.action
from roles r
join organizations o on o.id = r.organization_id
left join role_permissions rp on rp.role_id = r.id
left join permissions p on p.id = rp.permission_id
order by o.name, r.name, p.resource, p.action;`,
      },
    ],
    schema: rbacSchema,
    source: {
      label: "Original design by dbdiagramr, following the canonical RBAC model",
      original: true,
    },
    related: ["multi-tenant-saas", "supabase", "better-auth", "nextauth", "django"],
  },
  {
    slug: "multi-tenant-saas",
    category: "business",
    name: "Multi-Tenant SaaS",
    title: "Multi-Tenant SaaS Database Schema (PostgreSQL)",
    h1: "Multi-Tenant SaaS Database Schema",
    description:
      "Multi-tenant SaaS schema diagram: shared-schema PostgreSQL design with tenant_id on tenant-owned tables and a production hardening path.",
    keywords: [
      "multi tenant saas database schema postgres",
      "multi tenant database design postgres",
      "saas database schema",
      "tenant_id shared schema postgres",
      "multi tenancy database pattern",
      "saas schema design",
    ],
    intro:
      "The shared-schema pattern keeps every tenant's rows in the same tables, distinguished by a leading tenant_id column on the six tenant-owned tables: tenant_users, projects, tasks, invitations, api_keys, and events. tenants and users are global: a tenant row and a user row exist once, while tenant_users links them and carries the membership role. Primary keys stay single-column (id) for readability, and tenant_id is indexed first on every tenant-owned table. This is the simpler starting point: the database does not prevent cross-tenant references by itself. The Hardening for production section shows the composite unique key plus foreign key and the RLS policy that add that guarantee.",
    facts: [
      { label: "Tables", value: "8" },
      { label: "Pattern", value: "Shared schema + tenant_id" },
      { label: "Isolation", value: "tenant_id + RLS (add in production)" },
    ],
    faqs: [
      {
        q: "What is the shared-schema multi-tenancy pattern?",
        a: "All tenants share one database and one set of tables, with a tenant_id column on every tenant-owned table identifying the owner of each row. tenants and users stay global; tenant_users links them. It has the lowest operational overhead - one migration covers all tenants - at the cost of relying on the application and row-level security for isolation.",
      },
      {
        q: "Why are the primary keys single-column here?",
        a: "Single-column keys keep the diagram and application queries simple. They do not stop one tenant's task from pointing at another tenant's project. The Hardening for production section adds a composite UNIQUE (tenant_id, id) and a composite foreign key, which enforces the tenant match in the database.",
      },
      {
        q: "How do tenant-specific custom fields work in a shared schema?",
        a: "With a jsonb metadata column (as on the events table) for flexible per-tenant fields, indexed with GIN or expression indexes where queried. This avoids per-tenant schema churn while keeping the relational core strict.",
      },
    ],
    lastUpdated: "2026-10-23",
    queries: [
      {
        title: "Projects and tasks per tenant",
        description: "Count the projects and tasks owned by each tenant.",
        sql: `select t.name,
       count(distinct p.id) as projects,
       count(tk.id) as tasks
from tenants t
left join projects p on p.tenant_id = t.id
left join tasks tk on tk.tenant_id = t.id
group by t.id, t.name
order by t.name;`,
      },
      {
        title: "Tenant membership list",
        description: "Show each tenant's members and their roles.",
        sql: `select t.name as tenant, u.email, tu.role, tu.joined_at
from tenant_users tu
join tenants t on t.id = tu.tenant_id
join users u on u.id = tu.user_id
order by t.name, u.email;`,
      },
      {
        title: "Open tasks by assignee",
        description: "Count unfinished tasks for each assignee inside a tenant.",
        sql: `select u.email, count(t.id) as open_tasks
from users u
left join tasks t on t.assignee_id = u.id
  and t.status <> 'done'
  and t.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
group by u.id, u.email
order by open_tasks desc;`,
      },
      {
        title: "Recent events for a tenant",
        description: "Read the audit-style event stream for one tenant.",
        sql: `select e.created_at, e.action, e.entity, e.entity_id, e.metadata
from events e
where e.tenant_id = '00000000-0000-0000-0000-000000000001'::uuid
order by e.created_at desc
limit 50;`,
      },
    ],
    sections: [
      {
        title: "Hardening for production",
        body: `
          <p>The DDL on this page is the simpler starting point. To stop one tenant's rows from referencing another tenant's rows, add a composite unique key to the parent and a composite foreign key on the child. This example hardens <code>tasks.project_id</code>:</p>
          <pre><code>alter table projects
  add constraint projects_tenant_id_id_key unique (tenant_id, id);

alter table tasks
  drop constraint fk_tasks_project_id;

alter table tasks
  add constraint tasks_tenant_project_fk
  foreign key (tenant_id, project_id)
  references projects (tenant_id, id);</code></pre>
          <p>The composite key makes the tenant part of the reference. A task can now point only at a project in its own tenant. Apply the same pattern to every tenant-owned foreign key.</p>
          <p>Row-level security adds a second layer. Store the current tenant in a session setting, then filter every row through it:</p>
          <pre><code>alter table tasks enable row level security;

create policy tasks_tenant_isolation on tasks
  using (tenant_id = current_setting('app.tenant_id', true)::uuid)
  with check (tenant_id = current_setting('app.tenant_id', true)::uuid);</code></pre>
          <p>Set <code>app.tenant_id</code> on each request before querying, for example <code>select set_config('app.tenant_id', $1, true);</code>. If the setting is missing, <code>current_setting(..., true)</code> returns null and the policy matches no rows.</p>
        `,
      },
    ],
    schema: multitenantSchema,
    source: {
      label: "Original design by dbdiagramr, following the Citus / Azure shared-schema pattern",
      original: true,
    },
    related: ["rbac", "stripe", "ecommerce", "hospital-management-system"],
  },
  {
    slug: "chinook",
    category: "reference",
    name: "Chinook",
    title: "Chinook Database Schema Diagram (PostgreSQL)",
    h1: "Chinook Database Schema Diagram",
    description:
      "Chinook database diagram: artists, albums, tracks, customers, invoices, and playlists with every column and foreign key.",
    keywords: [
      "chinook database schema",
      "chinook database diagram",
      "chinook erd",
      "chinook postgresql",
      "chinook sample database tables",
      "music store database schema",
    ],
    intro:
      "Chinook is a digital music store sample database: artists release albums, albums contain tracks, tracks have a genre and a media type, customers buy tracks through invoices and invoice lines, and tracks are grouped into playlists. All eleven tables and their foreign keys are mapped in the diagram above. Two details worth knowing: playlist_track is a composite-key join table with no surrogate id, and track.album_id and track.genre_id are nullable - a track can exist without an album (singles) or a genre, while media_type_id is always required.",
    facts: [
      { label: "Tables", value: "11" },
      { label: "Core table", value: "track" },
      { label: "Sample data", value: "15,000+ rows" },
    ],
    faqs: [
      {
        q: "What tables are in the Chinook database?",
        a: "Chinook has 11 tables: artist, album, track, genre, media_type, playlist, playlist_track, customer, employee, invoice, and invoice_line - covering a digital music store from catalog to checkout.",
      },
      {
        q: "How do tracks relate to albums and playlists in Chinook?",
        a: "A track optionally belongs to one album via track.album_id. Playlists link to tracks through the playlist_track join table, which has a composite primary key of (playlist_id, track_id) - a many-to-many relationship with no surrogate key.",
      },
      {
        q: "Where can I download the Chinook PostgreSQL script?",
        a: "From the official chinook-database repository on GitHub (Chinook_PostgreSql.sql, version 1.4+). It creates the schema and loads over 15,000 rows of sample data with a single script.",
      },
    ],
    lastUpdated: "2026-09-27",
    schema: chinookSchema,
    source: {
      label: "Chinook database, Chinook_PostgreSql.sql v1.4.5 (lerocha/chinook-database)",
      url: "https://github.com/lerocha/chinook-database/blob/master/ChinookDatabase/DataSources/Chinook_PostgreSql.sql",
      license: "MIT",
      licenseUrl: "https://github.com/lerocha/chinook-database/blob/master/LICENSE.md",
    },
    related: ["pagila", "library-management-system", "hospital-management-system"],
  },
  {
    slug: "spring-batch",
    category: "reference",
    name: "Spring Batch",
    title: "Spring Batch Metadata Tables Diagram (PostgreSQL)",
    h1: "Spring Batch Metadata Tables Diagram",
    description:
      "Spring Batch metadata diagram: job instances, executions, step executions, and contexts with every column and foreign key.",
    keywords: [
      "spring batch metadata tables",
      "spring batch schema",
      "batch_job_instance batch_job_execution",
      "spring batch database schema postgres",
      "spring batch erd",
      "spring batch job repository tables",
    ],
    intro:
      "Spring Batch persists every job run in six metadata tables. BATCH_JOB_INSTANCE is the top of the hierarchy - one row per logical job identified by name plus key. Each run adds a BATCH_JOB_EXECUTION row with status, exit code, and timestamps; parameters land in BATCH_JOB_EXECUTION_PARAMS; each step adds a BATCH_STEP_EXECUTION row with read/write/skip counters; and restart state is serialized into the two _CONTEXT tables. The design detail that surprises people: the _ID primary keys are not database-generated - they come from separate sequences, because the key must be set on the Java object right after insert.",
    facts: [
      { label: "Tables", value: "6" },
      { label: "Hierarchy", value: "Instance -> Execution -> Step" },
      { label: "Source", value: "schema-postgresql.sql" },
    ],
    faqs: [
      {
        q: "What are the Spring Batch metadata tables?",
        a: "Six tables: BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION, BATCH_JOB_EXECUTION_PARAMS, BATCH_STEP_EXECUTION, BATCH_STEP_EXECUTION_CONTEXT, and BATCH_JOB_EXECUTION_CONTEXT. Together they record every job instance, execution, step, parameter, and restart checkpoint.",
      },
      {
        q: "What is the difference between BATCH_JOB_INSTANCE and BATCH_JOB_EXECUTION?",
        a: "A job instance is the logical job (name + identifying key) - one row no matter how many times it runs. Each run creates a new job execution row pointing back at the instance, so restarts and retries share one instance with many executions.",
      },
      {
        q: "Why do Spring Batch IDs use sequences instead of generated keys?",
        a: "Because the generated key must be assigned to the Java domain object immediately after insert. Sequences let Spring Batch fetch the ID first, set it on the object, then insert - a pattern that works uniformly across all supported databases.",
      },
    ],
    lastUpdated: "2026-09-27",
    schema: springbatchSchema,
    source: {
      label: "Official schema-postgresql.sql (spring-projects/spring-batch)",
      url: "https://github.com/spring-projects/spring-batch/blob/main/spring-batch-core/src/main/resources/org/springframework/batch/core/schema-postgresql.sql",
      license: "Apache-2.0",
      licenseUrl: "https://github.com/spring-projects/spring-batch/blob/main/LICENSE.txt",
    },
    related: ["chinook", "pagila", "dvd-rental", "northwind"],
  },
  {
    slug: "pagila",
    category: "reference",
    name: "Pagila",
    title: "Pagila Database Schema Diagram (PostgreSQL)",
    h1: "Pagila Database Schema Diagram",
    description:
      "Pagila database diagram: film, inventory, rental, customer, and payment tables with every column and foreign key.",
    keywords: [
      "pagila database schema",
      "pagila erd",
      "pagila database diagram",
      "pagila postgresql",
      "pagila sample database tables",
      "sakila postgres schema",
    ],
    intro:
      "Pagila is the PostgreSQL port of MySQL's Sakila DVD-rental sample database, designed to showcase Postgres features. Films describe titles with a full-text search column; inventory holds physical copies per store; rentals link inventory to customers and staff; payments record each rental's charge. Sixteen tables are mapped above. Two details worth knowing: the payment table is range-partitioned by month in production (the monthly partitions are omitted here for readability), and the film table carries a film_embedding vector column plus a tsvector fulltext column - the Postgres-specific additions that distinguish Pagila from Sakila.",
    facts: [
      { label: "Tables", value: "16" },
      { label: "Core flow", value: "Film -> Inventory -> Rental -> Payment" },
      { label: "Origin", value: "Sakila port for Postgres" },
    ],
    faqs: [
      {
        q: "What tables are in the Pagila database?",
        a: "Pagila has 16 logical tables: actor, film, film_actor, film_category, film_embedding, category, language, inventory, store, staff, customer, address, city, country, rental, and payment - plus monthly payment partitions in production.",
      },
      {
        q: "What is the difference between Pagila and Sakila?",
        a: "Pagila is a port of MySQL's Sakila DVD-store sample to PostgreSQL with Postgres-native changes: boolean flags instead of char(1), real foreign keys, tsvector full-text search on film, a film_embedding vector column, and a range-partitioned payment table.",
      },
      {
        q: "Why is there no payment partitions table in this diagram?",
        a: "In production Pagila partitions payment by month (payment_p2022_01 and so on), which would add dozens of identical tables to the diagram. The payment table shown here carries the inherited foreign keys; the FAQ source file documents the full partitioned layout.",
      },
    ],
    lastUpdated: "2026-09-27",
    schema: pagilaSchema,
    source: {
      label: "Pagila sample database, pagila-schema.sql (devrimgunduz/pagila) - a PostgreSQL port of MySQL's Sakila sample; the repository carries no license file, so check its terms before reuse",
      url: "https://github.com/devrimgunduz/pagila/blob/master/pagila-schema.sql",
    },
    related: ["chinook", "library-management-system", "hospital-management-system"],
  },
  {
    slug: "better-auth",
    category: "auth",
    name: "Better Auth",
    title: "Better Auth Database Schema Diagram (PostgreSQL)",
    h1: "Better Auth Database Schema Diagram",
    description:
      "Better Auth schema diagram: user, session, account, and verification tables with every column and foreign key.",
    keywords: [
      "better auth database schema",
      "better auth schema",
      "better auth tables",
      "better auth postgres schema",
      "better auth user session account verification",
      "better auth erd",
    ],
    intro:
      "Better Auth persists authentication in four core tables. The user table holds identity and profile fields; session rows point at users and carry the token, expiry, and device info; account rows link one authentication method (one provider) to a user with tokens and an optional password for credential logins; verification rows hold one-time values for email verification and password resets. The design detail that matters: account identity is the (providerId, accountId) pair - the local id is only the row identifier you pass to account-management APIs, never the provider identity.",
    facts: [
      { label: "Tables", value: "4" },
      { label: "Core table", value: "user" },
      { label: "Identity", value: "(providerId, accountId)" },
      { label: "Version", value: "1.7.12" },
    ],
    faqs: [
      {
        q: "What tables does Better Auth use?",
        a: "Better Auth's core schema is 4 tables: user, session, account, and verification. Plugins can add their own tables (for example, two-factor authentication adds columns to user).",
      },
      {
        q: "How does Better Auth identify an OAuth account?",
        a: "By the unique pair of providerId and accountId - the provider's identifier (for example google or github) plus its stable user id. The account row's own id is a local identifier for API calls, not the provider identity.",
      },
      {
        q: "How is Better Auth's schema different from NextAuth's?",
        a: "The shapes are close cousins - both have users, sessions, accounts, and a verification table. Better Auth names the token table verification (NextAuth calls it verification_token), stores the provider identity as providerId plus accountId, and supports custom table and column names via modelName and fields config.",
      },
    ],
    lastUpdated: "2026-10-23",
    relationshipNote:
      "PostgreSQL requires double quotes around the reserved table name user and around camelCase columns such as userId and expiresAt.",
    queries: [
      {
        title: "Sessions per user",
        description: "List unexpired sessions with the user and device details.",
        sql: `select s.id, u.email, s."expiresAt", s."ipAddress", s."userAgent"
from session s
join "user" u on u.id = s."userId"
where s."expiresAt" > now()
order by s."expiresAt" desc;`,
      },
      {
        title: "Accounts per provider",
        description: "Show which sign-in provider each account uses.",
        sql: `select u.email, a."providerId", a."accountId"
from account a
join "user" u on u.id = a."userId"
order by u.email, a."providerId";`,
      },
      {
        title: "Credential accounts",
        description: "Find accounts that store a password hash for email/password login.",
        sql: `select u.email, a."providerId"
from account a
join "user" u on u.id = a."userId"
where a.password is not null;`,
      },
      {
        title: "Unexpired verification values",
        description: "Read the one-time values used by email verification and password resets.",
        sql: `select identifier, value, "expiresAt"
from verification
where "expiresAt" > now()
order by "expiresAt";`,
      },
    ],
    sections: [
      {
        title: "Quoting the Better Auth table and column names",
        body: `
          <p>PostgreSQL folds unquoted identifiers to lowercase. <code>user</code> is a reserved keyword, and Better Auth's columns such as <code>userId</code>, <code>createdAt</code>, and <code>expiresAt</code> are camelCase. Always write <code>"user"</code>, <code>"userId"</code>, and <code>"createdAt"</code> in SQL.</p>
          <pre><code>select u.id, u.email, s."userId", s."expiresAt"
from "user" u
join session s on s."userId" = u.id;</code></pre>
          <p>If an ORM quotes identifiers for you, it handles this automatically. The Copy as SQL button on this page also quotes the reserved word and camelCase columns.</p>
        `,
      },
    ],
    schema: betterauthSchema,
    source: {
      label: "Better Auth core schema docs v1.7.12 (better-auth.com/docs/concepts/database)",
      url: "https://better-auth.com/docs/concepts/database",
      license: "MIT",
      licenseUrl: "https://github.com/better-auth/better-auth/blob/main/LICENSE.md",
    },
    related: ["supabase", "nextauth", "django", "laravel", "rbac"],
  },
  {
    slug: "dvd-rental",
    category: "reference",
    name: "DVD Rental",
    title: "DVD Rental Database ER Diagram (PostgreSQL)",
    h1: "DVD Rental Database ER Diagram",
    description:
      "DVD Rental database diagram: film, inventory, rental, customer, payment, and staff tables with every column and foreign key.",
    keywords: [
      "dvdrental database er diagram",
      "dvd rental database schema",
      "dvd rental er diagram",
      "postgresql sample database diagram",
      "dvdrental tables",
      "dvd store database schema",
    ],
    intro:
      "The DVD Rental database is the PostgreSQL tutorial's sample schema: a DVD store where films are stocked as inventory per store, customers rent inventory, staff process rentals, and payments record each charge. Fifteen tables are mapped above, from actor and category through film, inventory, rental, payment, and the staff/store geography chain. One detail worth knowing: the tutorial dump is a simplified variant - the store relationships (customer, inventory, and staff each belong to a store) exist as columns but carry no foreign-key constraints in the file, so they are restored here to match the official ER diagram.",
    facts: [
      { label: "Tables", value: "15" },
      { label: "Core flow", value: "Film -> Inventory -> Rental -> Payment" },
      { label: "Source", value: "PostgreSQL tutorial" },
    ],
    faqs: [
      {
        q: "What tables are in the DVD Rental database?",
        a: "The DVD Rental sample database has 15 tables: actor, film, film_actor, film_category, category, language, inventory, store, staff, customer, address, city, country, rental, and payment.",
      },
      {
        q: "How do films become rentals in the DVD Rental schema?",
        a: "A film title is stocked as physical inventory rows per store. A rental links one inventory item to one customer and the staff member who processed it, and each rental can produce a payment row. So the path is film -> inventory -> rental -> payment.",
      },
      {
        q: "Where can I download the DVD Rental sample database?",
        a: "From postgresqltutorial.com (as a pg_restore archive) or as plain SQL from the neondatabase/postgres-sample-dbs repository on GitHub, which is the source used for this diagram.",
      },
    ],
    lastUpdated: "2026-09-27",
    schema: dvdrentalSchema,
    source: {
      label: "DVD Rental sample database (postgresqltutorial.com), plain-SQL dump via neondatabase/postgres-sample-dbs",
      url: "https://github.com/neondatabase/postgres-sample-dbs/blob/main/dvdrental.sql",
      license: "MIT",
      licenseUrl: "https://github.com/neondatabase/postgres-sample-dbs/blob/main/LICENSE",
    },
    related: ["pagila", "chinook", "library-management-system"],
  },
  {
    slug: "northwind",
    category: "reference",
    name: "Northwind",
    title: "Northwind Database Diagram (PostgreSQL)",
    h1: "Northwind Database Diagram",
    description:
      "Northwind database diagram: customers, orders, products, suppliers, and employees with every column and foreign key.",
    keywords: [
      "northwind database diagram",
      "northwind database schema",
      "northwind erd",
      "northwind postgres",
      "northwind traders tables",
      "northwind er diagram",
    ],
    intro:
      "Northwind Traders is Microsoft's classic sample database - a food importer/exporter used in tutorials for decades - ported here to PostgreSQL. Customers place orders handled by employees; orders contain order_details lines referencing products; products come from suppliers and belong to categories; employees report to other employees and cover territories through a join table. Fourteen tables are mapped above. The detail that makes Northwind a great teaching schema: order_details uses a composite primary key of (order_id, product_id), and employees has a self-referencing reports_to foreign key - the two patterns every ER diagram course teaches.",
    facts: [
      { label: "Tables", value: "14" },
      { label: "Core flow", value: "Customer -> Order -> Order Details" },
      { label: "Origin", value: "Microsoft sample, PG port" },
    ],
    faqs: [
      {
        q: "What tables are in the Northwind database?",
        a: "Northwind has 14 tables: categories, customers, customer_demographics, customer_customer_demo, employees, employee_territories, territories, region, orders, order_details, products, suppliers, shippers, and us_states.",
      },
      {
        q: "How are orders and products linked in Northwind?",
        a: "Through the order_details join table, which has a composite primary key of (order_id, product_id) plus quantity, unit price, and discount. One order has many lines; each line references exactly one product.",
      },
      {
        q: "How does Northwind model employee reporting lines?",
        a: "With a self-referencing foreign key: employees.reports_to points at employees.employee_id, so each employee row links to their manager's row. Territories add a second dimension via the employee_territories join table.",
      },
    ],
    lastUpdated: "2026-09-27",
    schema: northwindSchema,
    source: {
      label: "Northwind Traders sample database, PostgreSQL port (pthom/northwind_psql) - originally a Microsoft sample database; the port repository carries no license file, so check its terms before reuse",
      url: "https://github.com/pthom/northwind_psql",
    },
    related: ["chinook", "pagila", "ecommerce"],
  },
];

export function getSchemaEntry(slug: string): SchemaEntry | undefined {
  return schemaEntries.find((e) => e.slug === slug);
}

export function getAllSchemaEntries(): SchemaEntry[] {
  return schemaEntries;
}
