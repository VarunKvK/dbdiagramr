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

export type SchemaEntry = {
  slug: string;
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
  /** Topical related schema slugs; falls back to first 3 other entries */
  related?: string[];
};

export const schemaEntries: SchemaEntry[] = [
  {
    slug: "supabase",
    name: "Supabase",
    title: "Supabase Database Schema Diagram",
    h1: "Supabase Database Schema Diagram",
    description:
      "Visualize the Supabase auth database schema - every table, column, and foreign key, including auth.users, auth.identities, and auth.sessions.",
    keywords: [
      "supabase schema",
      "supabase database schema",
      "supabase auth schema",
      "supabase auth.users",
      "supabase er diagram",
      "supabase database diagram",
    ],
    intro:
      "Every Supabase project ships with an auth schema that powers authentication, sessions, and user management. This is the full database schema diagram of the Supabase auth tables - auth.users, auth.identities, auth.sessions, and friends - showing the primary keys and foreign key relationships between them. Use it to understand how Supabase stores users before you build your own profiles table.",
    facts: [
      { label: "Tables", value: "7" },
      { label: "Schema", value: "auth" },
      { label: "Core table", value: "auth.users" },
    ],
    faqs: [
      {
        q: "How many tables does the Supabase auth schema have?",
        a: "The standard Supabase auth schema has 7 core tables: users, identities, sessions, refresh_tokens, instances, audit_log_entries, and schema_migrations.",
      },
      {
        q: "How do users relate to identities in Supabase?",
        a: "Every auth.users row can have multiple auth.identities rows linked by user_id. Each identity represents a sign-in method (email/password, Google, GitHub, etc.) for that user.",
      },
    ],
    lastUpdated: "2026-08-03",
    schema: supabaseSchema,
    source: {
      label: "Supabase auth migrations (supabase/auth)",
      url: "https://github.com/supabase/auth",
      license: "Apache-2.0",
      licenseUrl: "https://github.com/supabase/auth/blob/master/LICENSE",
    },
    related: ["nextauth", "django", "laravel"],
  },
  {
    slug: "nextauth",
    name: "NextAuth.js",
    title: "NextAuth.js Database Schema (Auth.js)",
    h1: "NextAuth.js Database Schema",
    description:
      "The complete NextAuth.js / Auth.js schema diagram - users, accounts, sessions, and verification_tokens with all columns and foreign keys.",
    keywords: [
      "nextauth schema",
      "nextauth database schema",
      "nextauth prisma schema",
      "auth.js schema",
      "nextauth users accounts sessions",
      "nextauth er diagram",
    ],
    intro:
      "NextAuth.js (now Auth.js) persists users, OAuth accounts, sessions, and email verification tokens in four tables: users, accounts, sessions, and verification_tokens. This diagram shows the exact columns and relationships the default Postgres adapter expects - the same shape you get from the Prisma adapter schema. A single user can have many accounts (one per OAuth provider) and many sessions.",
    facts: [
      { label: "Tables", value: "4" },
      { label: "Core table", value: "users" },
      { label: "Relationship", value: "User 1→N Account" },
    ],
    faqs: [
      {
        q: "How many tables does NextAuth.js use?",
        a: "The default NextAuth.js / Auth.js database schema uses 4 tables: users, accounts, sessions, and verification_tokens.",
      },
      {
        q: "What is the relationship between users and accounts in NextAuth?",
        a: "It's a one-to-many relationship. A single user can have multiple accounts - one for each OAuth provider they sign in with (Google, GitHub, etc.). Each account row has a userId foreign key referencing users.id.",
      },
    ],
    lastUpdated: "2026-08-03",
    schema: nextauthSchema,
    source: {
      label: "Auth.js database adapter schema (next-auth)",
      url: "https://authjs.dev/getting-started/adapters/pg",
      license: "MIT",
      licenseUrl: "https://github.com/nextauthjs/next-auth/blob/main/LICENSE",
    },
    related: ["supabase", "django", "laravel"],
  },
  {
    slug: "laravel",
    name: "Laravel",
    title: "Laravel Database Schema Diagram",
    h1: "Laravel Database Schema Diagram",
    description:
      "The default Laravel 11 database schema diagram - users, password_reset_tokens, sessions, jobs, and cache tables with all columns.",
    keywords: [
      "laravel schema",
      "laravel database schema",
      "laravel users table",
      "laravel migrations schema",
      "laravel er diagram",
      "laravel database diagram",
    ],
    intro:
      "A fresh Laravel 11 application ships with a handful of framework tables created by the default migrations: users, password_reset_tokens, sessions, jobs, failed_jobs, cache, and cache_locks. This diagram shows the full default schema - the users table with password and remember_token columns, plus the sessions table that references users via a user_id foreign key.",
    facts: [
      { label: "Tables", value: "7" },
      { label: "Core table", value: "users" },
      { label: "Framework", value: "Laravel 11" },
    ],
    faqs: [
      {
        q: "What tables does a default Laravel installation have?",
        a: "The default Laravel migrations create users, password_reset_tokens, sessions, jobs, failed_jobs, cache, and cache_locks tables.",
      },
      {
        q: "Does the Laravel sessions table reference the users table?",
        a: "Yes. The sessions table has a user_id foreign key column that references users.id, so you can look up which user owns each authenticated session.",
      },
    ],
    lastUpdated: "2026-08-03",
    schema: laravelSchema,
    source: {
      label: "Laravel 11 default migrations (laravel/laravel)",
      url: "https://github.com/laravel/laravel",
      license: "MIT",
      licenseUrl: "https://github.com/laravel/laravel/blob/11.x/LICENSE.md",
    },
    related: ["django", "nextauth", "supabase"],
  },
  {
    slug: "django",
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
    ],
    lastUpdated: "2026-08-03",
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
    ],
    lastUpdated: "2026-09-03",
    schema: stripeSchema,
    source: {
      label: "Original design by dbdiagramr, modeled on the Stripe billing API",
      original: true,
    },
    related: ["ecommerce", "multi-tenant-saas", "rbac"],
  },
  {
    slug: "ecommerce",
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
    ],
    lastUpdated: "2026-09-03",
    schema: ecommerceSchema,
    source: {
      label: "Original design by dbdiagramr, modeled on Shopify / WooCommerce",
      original: true,
    },
    related: ["stripe", "multi-tenant-saas"],
  },
  {
    slug: "library-management-system",
    name: "Library Management System",
    title: "Library Management System ER Diagram (PostgreSQL)",
    h1: "Library Management System ER Diagram",
    description:
      "Interactive ER diagram of a library management system database - books, authors, physical copies, members, loans, reservations, and fines with all columns and foreign keys, plus copyable PostgreSQL DDL.",
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
    lastUpdated: "2026-09-27",
    schema: librarySchema,
    source: {
      label: "Original design by dbdiagramr, modeled on standard DBMS textbook schemas",
      original: true,
    },
    related: ["hospital-management-system", "ecommerce"],
  },
  {
    slug: "hospital-management-system",
    name: "Hospital Management System",
    title: "Hospital Management System Database Schema (PostgreSQL)",
    h1: "Hospital Management System Database Schema",
    description:
      "Interactive ER diagram of a hospital management system database - patients, staff, appointments, medical records, prescriptions, admissions, billing, and payments with all foreign keys, plus copyable PostgreSQL DDL.",
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
    lastUpdated: "2026-09-27",
    schema: hospitalSchema,
    source: {
      label: "Original design by dbdiagramr, modeled on standard DBMS textbook schemas",
      original: true,
    },
    related: ["library-management-system", "ecommerce"],
  },
  {
    slug: "rbac",
    name: "RBAC",
    title: "RBAC Database Schema - Roles, Permissions & Joins (PostgreSQL)",
    h1: "RBAC Database Schema",
    description:
      "Interactive ER diagram of a role-based access control database schema - users, organizations, roles, permissions, and the two join tables with all foreign keys, plus copyable PostgreSQL DDL.",
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
    lastUpdated: "2026-09-27",
    schema: rbacSchema,
    source: {
      label: "Original design by dbdiagramr, following the canonical RBAC model",
      original: true,
    },
    related: ["multi-tenant-saas", "supabase", "nextauth"],
  },
  {
    slug: "multi-tenant-saas",
    name: "Multi-Tenant SaaS",
    title: "Multi-Tenant SaaS Database Schema for PostgreSQL (Shared Schema)",
    h1: "Multi-Tenant SaaS Database Schema",
    description:
      "Interactive ER diagram of a multi-tenant SaaS database schema for PostgreSQL - shared-schema pattern with a leading tenant_id on every table and composite keys, plus copyable PostgreSQL DDL.",
    keywords: [
      "multi tenant saas database schema postgres",
      "multi tenant database design postgres",
      "saas database schema",
      "tenant_id shared schema postgres",
      "multi tenancy database pattern",
      "saas schema design",
    ],
    intro:
      "The shared-schema pattern keeps every tenant's rows in the same tables, distinguished by a leading tenant_id column on all eight tables: tenants, users, tenant_users, projects, tasks, invitations, api_keys, and events. Primary keys and foreign keys are composite (tenant_id, id) following the Citus and Azure guidance, which makes cross-tenant joins impossible at the database level and lets the tables be hash-sharded on tenant_id later. Every operational table indexes tenant_id first, so row-level-security policies and tenant-scoped queries never scan other tenants' rows. The events table rounds out the design with a jsonb metadata column for tenant-specific fields without schema churn.",
    facts: [
      { label: "Tables", value: "8" },
      { label: "Pattern", value: "Shared schema + tenant_id" },
      { label: "Isolation", value: "Composite FKs" },
    ],
    faqs: [
      {
        q: "What is the shared-schema multi-tenancy pattern?",
        a: "All tenants share one database and one set of tables, with a tenant_id column on every table identifying the owner of each row. It has the lowest operational overhead - one migration covers all tenants - at the cost of relying on the application and row-level security for isolation.",
      },
      {
        q: "Why make primary keys composite (tenant_id, id)?",
        a: "Composite keys guarantee uniqueness per tenant rather than globally, and composite foreign keys (tenant_id, project_id) make it structurally impossible for one tenant's rows to reference another tenant's rows. It also prepares the tables for hash-sharding on tenant_id, which colocates each tenant's data for cheap distributed joins.",
      },
      {
        q: "How do tenant-specific custom fields work in a shared schema?",
        a: "With a jsonb metadata column (as on the events table) for flexible per-tenant fields, indexed with GIN or expression indexes where queried. This avoids per-tenant schema churn while keeping the relational core strict.",
      },
    ],
    lastUpdated: "2026-09-27",
    schema: multitenantSchema,
    source: {
      label: "Original design by dbdiagramr, following the Citus / Azure shared-schema pattern",
      original: true,
    },
    related: ["rbac", "stripe", "ecommerce"],
  },
  {
    slug: "chinook",
    name: "Chinook",
    title: "Chinook Database Schema Diagram (PostgreSQL)",
    h1: "Chinook Database Schema Diagram",
    description:
      "Interactive ER diagram of the Chinook sample database - artists, albums, tracks, customers, invoices, and playlists with all columns and foreign keys, plus copyable PostgreSQL DDL.",
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
    name: "Spring Batch",
    title: "Spring Batch Metadata Tables Diagram (PostgreSQL)",
    h1: "Spring Batch Metadata Tables Diagram",
    description:
      "Interactive ER diagram of the Spring Batch metadata tables - BATCH_JOB_INSTANCE, BATCH_JOB_EXECUTION, step executions, and contexts with all foreign keys, plus copyable PostgreSQL DDL.",
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
    related: ["supabase", "django", "laravel"],
  },
  {
    slug: "pagila",
    name: "Pagila",
    title: "Pagila Database Schema Diagram (PostgreSQL)",
    h1: "Pagila Database Schema Diagram",
    description:
      "Interactive ER diagram of the Pagila sample database - the PostgreSQL port of Sakila with film, inventory, rental, customer, and payment tables, all foreign keys, plus copyable PostgreSQL DDL.",
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
    name: "Better Auth",
    title: "Better Auth Database Schema Diagram (PostgreSQL)",
    h1: "Better Auth Database Schema Diagram",
    description:
      "Interactive ER diagram of the Better Auth core schema - user, session, account, and verification tables with all columns and foreign keys, plus copyable PostgreSQL DDL.",
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
        a: "The shapes are close cousins - both have users, sessions, accounts, and a verification table. Better Auth names the token table verification (NextAuth calls it verification_tokens), stores the provider identity as providerId plus accountId, and supports custom table and column names via modelName and fields config.",
      },
    ],
    lastUpdated: "2026-10-20",
    schema: betterauthSchema,
    source: {
      label: "Better Auth core schema docs (better-auth.com/docs/concepts/database)",
      url: "https://better-auth.com/docs/concepts/database",
      license: "MIT",
      licenseUrl: "https://github.com/better-auth/better-auth/blob/main/LICENSE.md",
    },
    related: ["nextauth", "supabase", "rbac"],
  },
  {
    slug: "dvd-rental",
    name: "DVD Rental",
    title: "DVD Rental Database ER Diagram (PostgreSQL)",
    h1: "DVD Rental Database ER Diagram",
    description:
      "Interactive ER diagram of the DVD Rental sample database from the PostgreSQL tutorial - film, inventory, rental, customer, payment, and staff tables with all foreign keys, plus copyable PostgreSQL DDL.",
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
    name: "Northwind",
    title: "Northwind Database Diagram (PostgreSQL)",
    h1: "Northwind Database Diagram",
    description:
      "Interactive ER diagram of the Northwind Traders sample database for PostgreSQL - customers, orders, products, suppliers, and employees with all foreign keys, plus copyable PostgreSQL DDL.",
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
