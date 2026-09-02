import type { Schema } from "@/lib/diagram";
import { supabaseSchema } from "./supabase";
import { nextauthSchema } from "./nextauth";
import { laravelSchema } from "./laravel";
import { djangoSchema } from "./django";
import { stripeSchema } from "./stripe";
import { ecommerceSchema } from "./ecommerce";

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
  },
  {
    slug: "stripe",
    name: "Stripe",
    title: "Stripe Billing Database Schema Diagram",
    h1: "Stripe Billing Database Schema Diagram",
    description:
      "Stripe billing schema diagram — customers, products, prices, subscriptions, invoices, payment methods and payment intents with all foreign keys.",
    keywords: [
      "stripe database schema",
      "stripe billing schema",
      "stripe subscription schema",
      "stripe customers subscriptions invoices",
      "stripe er diagram",
      "stripe postgres schema",
    ],
    intro:
      "If you bill with Stripe, these are the tables behind the API. Customers own subscriptions and payment methods; subscriptions are composed of subscription items that reference prices; prices belong to products; invoices collect line items and link to payment intents. This diagram maps the full Stripe billing model as PostgreSQL tables — the shape you would build when syncing Stripe objects into your own database or designing a Stripe-like billing system from scratch.",
    facts: [
      { label: "Tables", value: "9" },
      { label: "Core table", value: "customers" },
      { label: "Billing flow", value: "Customer → Subscription → Invoice" },
    ],
    faqs: [
      {
        q: "What tables does a Stripe billing schema need?",
        a: "A Stripe-like billing schema needs customers, products, prices, subscriptions, subscription_items, invoices, invoice_line_items, payment_methods, and payment_intents — 9 tables covering the full subscription and payment lifecycle.",
      },
      {
        q: "How do Stripe subscriptions relate to invoices and payments?",
        a: "A customer has many subscriptions. Each subscription has many subscription_items (one per price). When a billing period ends, Stripe generates an invoice with line items; each invoice can have a payment_intent that charges the customer's default payment_method.",
      },
    ],
    lastUpdated: "2026-09-03",
    schema: stripeSchema,
  },
  {
    slug: "ecommerce",
    name: "E-commerce",
    title: "E-commerce Database Schema Diagram (PostgreSQL)",
    h1: "E-commerce Database Schema Diagram",
    description:
      "E-commerce PostgreSQL schema diagram — customers, products, categories, carts, orders, order items, payments and reviews with all foreign keys.",
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
        a: "A standard e-commerce schema needs customers, addresses, categories, products, product_images, carts, cart_items, orders, order_items, payments, and reviews — 11 tables covering catalog, cart, checkout, and post-purchase flows.",
      },
      {
        q: "What is the difference between cart_items and order_items?",
        a: "cart_items are mutable — quantities change until checkout. order_items are immutable snapshots copied from the cart at order time, preserving the price and product that was actually purchased even if the product later changes.",
      },
    ],
    lastUpdated: "2026-09-03",
    schema: ecommerceSchema,
  },
];

export function getSchemaEntry(slug: string): SchemaEntry | undefined {
  return schemaEntries.find((e) => e.slug === slug);
}

export function getAllSchemaEntries(): SchemaEntry[] {
  return schemaEntries;
}
