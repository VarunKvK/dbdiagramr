import type { Schema } from "@/lib/diagram";
import { supabaseSchema } from "./supabase";
import { nextauthSchema } from "./nextauth";
import { laravelSchema } from "./laravel";
import { djangoSchema } from "./django";

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
  schema: Schema;
};

export const schemaEntries: SchemaEntry[] = [
  {
    slug: "supabase",
    name: "Supabase",
    title: "Supabase Database Schema Diagram",
    h1: "Supabase Database Schema Diagram",
    description:
      "Visualize the Supabase auth database schema — every table, column, primary key, and foreign key relationship, including auth.users, auth.identities, and auth.sessions. Interactive ER diagram, free.",
    keywords: [
      "supabase schema",
      "supabase database schema",
      "supabase auth schema",
      "supabase auth.users",
      "supabase er diagram",
      "supabase database diagram",
    ],
    intro:
      "Every Supabase project ships with an auth schema that powers authentication, sessions, and user management. This is the full database schema diagram of the Supabase auth tables — auth.users, auth.identities, auth.sessions, and friends — showing the primary keys and foreign key relationships between them. Use it to understand how Supabase stores users before you build your own profiles table.",
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
    schema: supabaseSchema,
  },
  {
    slug: "nextauth",
    name: "NextAuth.js",
    title: "NextAuth.js Database Schema (Auth.js)",
    h1: "NextAuth.js Database Schema",
    description:
      "The complete NextAuth.js / Auth.js database schema diagram — users, accounts, sessions, and verification_tokens tables with all columns and foreign keys. Free interactive ER diagram.",
    keywords: [
      "nextauth schema",
      "nextauth database schema",
      "nextauth prisma schema",
      "auth.js schema",
      "nextauth users accounts sessions",
      "nextauth er diagram",
    ],
    intro:
      "NextAuth.js (now Auth.js) persists users, OAuth accounts, sessions, and email verification tokens in four tables: users, accounts, sessions, and verification_tokens. This diagram shows the exact columns and relationships the default Postgres adapter expects — the same shape you get from the Prisma adapter schema. A single user can have many accounts (one per OAuth provider) and many sessions.",
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
        a: "It's a one-to-many relationship. A single user can have multiple accounts — one for each OAuth provider they sign in with (Google, GitHub, etc.). Each account row has a userId foreign key referencing users.id.",
      },
    ],
    schema: nextauthSchema,
  },
  {
    slug: "laravel",
    name: "Laravel",
    title: "Laravel Database Schema Diagram",
    h1: "Laravel Database Schema Diagram",
    description:
      "The default Laravel 11 database schema diagram — users, password_reset_tokens, sessions, jobs, and cache tables with all columns and relationships. Free interactive ER diagram.",
    keywords: [
      "laravel schema",
      "laravel database schema",
      "laravel users table",
      "laravel migrations schema",
      "laravel er diagram",
      "laravel database diagram",
    ],
    intro:
      "A fresh Laravel 11 application ships with a handful of framework tables created by the default migrations: users, password_reset_tokens, sessions, jobs, failed_jobs, cache, and cache_locks. This diagram shows the full default schema — the users table with password and remember_token columns, plus the sessions table that references users via a user_id foreign key.",
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
    schema: laravelSchema,
  },
  {
    slug: "django",
    name: "Django",
    title: "Django Auth Database Schema Diagram",
    h1: "Django Auth Database Schema Diagram",
    description:
      "The Django authentication database schema diagram — auth_user, auth_group, auth_permission, and the many-to-many join tables with all foreign keys. Free interactive ER diagram.",
    keywords: [
      "django auth schema",
      "django database schema",
      "django auth_user table",
      "django permissions schema",
      "django er diagram",
      "django auth erd",
    ],
    intro:
      "Django's built-in auth app creates a set of authentication tables when you run migrate: auth_user, auth_group, auth_permission, plus the many-to-many join tables auth_user_groups, auth_user_user_permissions, and auth_group_permissions. This diagram maps the full schema — including how permissions link to content types through django_content_type, and how admin actions are logged in django_admin_log.",
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
    schema: djangoSchema,
  },
];

export function getSchemaEntry(slug: string): SchemaEntry | undefined {
  return schemaEntries.find((e) => e.slug === slug);
}

export function getAllSchemaEntries(): SchemaEntry[] {
  return schemaEntries;
}
