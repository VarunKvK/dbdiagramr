export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string; // YYYY-MM-DD
  readingMinutes: number;
  tags: string[];
  // Canonical: where the primary version lives (dev.to initially, self later)
  canonical?: string;
  // Dev.to URL once published
  devtoUrl?: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "visualize-postgres-schema-5-ways",
    title: "How to Visualize a PostgreSQL Schema: 5 Ways Compared",
    description:
      "Compare five practical ways to turn a Postgres database into a readable schema diagram -- from psql to a live connection string -- and pick the one that fits.",
    keywords: [
      "visualize postgres schema",
      "postgresql er diagram",
      "postgres schema diagram",
      "how to visualize postgres database",
    ],
    date: "2026-08-18",
    readingMinutes: 6,
    tags: ["postgres", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "postgres-connection-string-supabase-neon-railway",
    title: "PostgreSQL Connection String: Supabase, Neon, Railway",
    description:
      "Every piece of a PostgreSQL connection string, broken down, plus why Supabase's transaction pooler (port 6543) is the gotcha most tutorials skip.",
    keywords: [
      "postgres connection string",
      "supabase connection string",
      "postgresql connection string explained",
      "supabase transaction pooler",
    ],
    date: "2026-08-20",
    readingMinutes: 5,
    tags: ["postgres", "supabase", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "supabase-auth-schema-explained",
    title: "Supabase Auth Schema Explained: Users, Identities, Sessions",
    description:
      "What lives in Supabase's auth schema -- users, identities, sessions, refresh_tokens -- and how they relate when you introspect a live database.",
    keywords: [
      "supabase auth schema",
      "supabase auth users identities sessions",
      "supabase database schema explained",
    ],
    date: "2026-08-25",
    readingMinutes: 5,
    tags: ["supabase", "postgres", "database"],
    devtoUrl: undefined,
  },
  {
    slug: "what-is-an-er-diagram",
    title: "What Is an ER Diagram and How to Read One",
    description:
      "What an ER diagram actually shows -- entities, attributes, relationships, and cardinality -- and how to read one in under 5 minutes.",
    keywords: [
      "what is an er diagram",
      "how to read er diagram",
      "er diagram explained",
      "entity relationship diagram tutorial",
    ],
    date: "2026-09-10",
    readingMinutes: 4,
    tags: ["database", "tutorial", "beginners"],
    devtoUrl: undefined,
  },
  {
    slug: "stripe-billing-schema-postgres",
    title: "Stripe Billing Schema for PostgreSQL: Customers to Payment Intents",
    description:
      "Model Stripe's billing objects as PostgreSQL tables -- customers, products, prices, subscriptions, invoices, and payment intents with foreign keys.",
    keywords: [
      "stripe database schema",
      "stripe billing schema postgres",
      "stripe subscription database design",
    ],
    date: "2026-09-12",
    readingMinutes: 6,
    tags: ["postgres", "database", "stripe"],
    devtoUrl: undefined,
  },
  {
    slug: "ecommerce-database-schema-postgres",
    title: "E-commerce Database Schema for PostgreSQL: The 11 Tables Every Store Needs",
    description:
      "The 11-table PostgreSQL schema that powers Shopify and WooCommerce -- customers, products, carts, orders, payments, and reviews with relationships.",
    keywords: [
      "ecommerce database schema",
      "ecommerce postgres schema",
      "online store database design",
    ],
    date: "2026-09-15",
    readingMinutes: 7,
    tags: ["postgres", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "nextauth-auth-schema-explained",
    title: "NextAuth / Auth.js Database Schema Explained",
    description:
      "Every table NextAuth (Auth.js) creates in your database -- users, accounts, sessions, verification_tokens -- and how they connect.",
    keywords: [
      "nextauth database schema",
      "auth.js database schema",
      "nextauth users accounts sessions",
    ],
    date: "2026-09-12",
    readingMinutes: 5,
    tags: ["nextjs", "auth", "database"],
    devtoUrl: undefined,
  },
  {
    slug: "laravel-database-schema-explained",
    title: "Laravel Default Database Tables Explained",
    description:
      "Every table Laravel creates by default -- users, password_resets, failed_jobs, personal_access_tokens -- what each one does and what to change.",
    keywords: [
      "laravel database schema",
      "laravel default tables",
      "laravel migration tables",
    ],
    date: "2026-09-16",
    readingMinutes: 6,
    tags: ["laravel", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "django-auth-schema-explained",
    title: "Django Auth Tables and Permissions Explained",
    description:
      "Every table Django creates for authentication -- auth_user, auth_group, auth_permission -- what each one does and how the permission system works.",
    keywords: [
      "django auth schema",
      "django auth_user table",
      "django permission system database",
    ],
    date: "2026-09-19",
    readingMinutes: 5,
    tags: ["django", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "database-schema-documentation",
    title: "How to Document Your Database Schema for a Team",
    description:
      "A practical guide to documenting your database schema so your team actually reads it -- naming conventions, inline comments, and the one-page cheat sheet.",
    keywords: [
      "database schema documentation",
      "how to document database schema",
      "schema documentation best practices",
    ],
    date: "2026-09-23",
    readingMinutes: 5,
    tags: ["database", "documentation", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "information-schema-vs-pg-catalog",
    title: "information_schema vs pg_catalog: Which Should You Query?",
    description:
      "The difference between information_schema and pg_catalog in PostgreSQL -- which one to use for what, performance gotchas, and common queries.",
    keywords: [
      "information_schema vs pg_catalog",
      "postgresql metadata query",
      "pg_catalog tutorial",
    ],
    date: "2026-09-26",
    readingMinutes: 6,
    tags: ["postgres", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "schema-documentation-drift",
    title: "Why Schema Diagrams Go Stale (and the Fix)",
    description:
      "Schema diagrams drift out of sync within weeks. Here's why it happens, the three fixes that actually work, and how to make your diagram self-healing.",
    keywords: [
      "schema documentation drift",
      "database diagram out of date",
      "schema diagram maintenance",
    ],
    date: "2026-09-30",
    readingMinutes: 4,
    tags: ["database", "documentation", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "supabase-connection-string-ipv6-enotfound",
    title: "Supabase Connection String: IPv6, ENOTFOUND, and the Transaction Pooler Fix",
    description:
      "Why Supabase throws ENOTFOUND and ETIMEDOUT errors, the IPv6 vs IPv4 problem, and how the transaction pooler port (6543) fixes most connection issues.",
    keywords: [
      "supabase enotfound",
      "supabase ipv6 connection",
      "supabase transaction pooler 6543",
    ],
    date: "2026-10-07",
    readingMinutes: 5,
    tags: ["supabase", "postgres", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "dbdiagram-tools-compared",
    title: "dbdiagram.io vs dbdiagramr vs DrawSQL: Honest Comparison",
    description:
      "The real differences between dbdiagram.io, dbdiagramr, and DrawSQL -- pricing, features, Supabase integration, and which one fits your workflow.",
    keywords: [
      "dbdiagram.io vs dbdiagramr",
      "dbdiagram tools comparison",
      "drawsql alternative",
    ],
    date: "2026-10-14",
    readingMinutes: 5,
    tags: ["database", "tutorial", "tools"],
    devtoUrl: undefined,
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
