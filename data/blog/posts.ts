export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string; // YYYY-MM-DD
  updated?: string; // YYYY-MM-DD, when the body changed after publication
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
      "What lives in Supabase's auth schema: users, identities, sessions, refresh_tokens, and how they relate when you introspect a live database.",
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
      "What an ER diagram actually shows: entities, attributes, relationships, and cardinality, and how to read one in under 5 minutes.",
    keywords: [
      "what is an er diagram",
      "how to read er diagram",
      "er diagram explained",
      "entity relationship diagram tutorial",
    ],
    date: "2026-09-28",
    readingMinutes: 5,
    tags: ["database", "tutorial", "beginners"],
    devtoUrl: undefined,
  },
  {
    slug: "stripe-billing-schema-postgres",
    title: "Stripe Billing Schema for PostgreSQL",
    description:
      "Model Stripe's billing objects as PostgreSQL tables: customers, products, prices, subscriptions, invoices, and payment intents with foreign keys.",
    keywords: [
      "stripe database schema",
      "stripe billing schema postgres",
      "stripe subscription database design",
    ],
    date: "2026-09-08",
    readingMinutes: 6,
    tags: ["postgres", "database", "stripe"],
    devtoUrl: undefined,
  },
  {
    slug: "ecommerce-database-schema-postgres",
    title: "E-commerce Database Schema for PostgreSQL",
    description:
      "The 11-table PostgreSQL schema that powers Shopify and WooCommerce: customers, products, carts, orders, payments, and reviews with relationships.",
    keywords: [
      "ecommerce database schema",
      "ecommerce postgres schema",
      "online store database design",
    ],
    date: "2026-09-08",
    readingMinutes: 7,
    tags: ["postgres", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "nextauth-auth-schema-explained",
    title: "NextAuth / Auth.js Database Schema Explained",
    description:
      "Every table NextAuth (Auth.js) creates in your database: users, accounts, sessions, verification_tokens, and how they connect.",
    keywords: [
      "nextauth database schema",
      "auth.js database schema",
      "nextauth users accounts sessions",
    ],
    date: "2026-09-08",
    readingMinutes: 5,
    tags: ["nextjs", "auth", "database"],
    devtoUrl: undefined,
  },
  {
    slug: "laravel-database-schema-explained",
    title: "Laravel Default Database Tables Explained",
    description:
      "Every table Laravel creates by default: users, password_resets, failed_jobs, personal_access_tokens, what each one does and what to change.",
    keywords: [
      "laravel database schema",
      "laravel default tables",
      "laravel migration tables",
    ],
    date: "2026-09-08",
    readingMinutes: 6,
    tags: ["laravel", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "database-schema-documentation",
    title: "How to Document Your Database Schema for a Team",
    description:
      "A practical guide to documenting your database schema so your team reads it: naming conventions, inline comments, and a one-page cheat sheet.",
    keywords: [
      "database schema documentation",
      "how to document database schema",
      "schema documentation best practices",
    ],
    date: "2026-09-08",
    readingMinutes: 5,
    tags: ["database", "documentation", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "information-schema-vs-pg-catalog",
    title: "information_schema vs pg_catalog: Which Should You Query?",
    description:
      "The difference between information_schema and pg_catalog in PostgreSQL: which one to use for what, performance gotchas, and common queries.",
    keywords: [
      "information_schema vs pg_catalog",
      "postgresql metadata query",
      "pg_catalog tutorial",
    ],
    date: "2026-09-08",
    readingMinutes: 6,
    tags: ["postgres", "database", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "schema-documentation-drift",
    title: "Why Schema Diagrams Go Stale (and the Fix)",
    description:
      "Schema diagrams drift out of sync within weeks. Here is why, the three fixes that work, and how to make your diagram self-healing.",
    keywords: [
      "schema documentation drift",
      "database diagram out of date",
      "schema diagram maintenance",
    ],
    date: "2026-09-08",
    readingMinutes: 4,
    tags: ["database", "documentation", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "supabase-connection-string-ipv6-enotfound",
    title: "Supabase Connection String: IPv6 & ENOTFOUND Fix",
    description:
      "Why Supabase throws ENOTFOUND and ETIMEDOUT errors, the IPv6 vs IPv4 problem, and how the transaction pooler port (6543) fixes most connection issues.",
    keywords: [
      "supabase enotfound",
      "supabase ipv6 connection",
      "supabase transaction pooler 6543",
    ],
    date: "2026-09-08",
    readingMinutes: 5,
    tags: ["supabase", "postgres", "tutorial"],
    devtoUrl: undefined,
  },
  {
    slug: "free-online-database-diagram-tool",
    title: "Free Online Database Diagram Tool",
    description:
      "Need a free database diagram tool? Paste SQL or connect to PostgreSQL to generate ER diagrams instantly. No signup, no limits, no catch.",
    keywords: [
      "free online database diagram tool",
      "free database diagram tool",
      "database diagram tool free",
      "free schema generator",
      "database diagram online",
    ],
    date: "2026-09-15",
    readingMinutes: 5,
    tags: ["postgres", "database", "tutorial"],
  },
  {
    slug: "sql-to-schema-diagram-online",
    title: "SQL to Schema Diagram Online: Convert SQL to ERD in Seconds",
    description:
      "Convert SQL to a schema diagram online. Paste your CREATE TABLE statements and get an interactive ER diagram instantly. No signup required.",
    keywords: [
      "sql to schema diagram online",
      "sql to diagram online",
      "convert sql to erd",
      "sql to erd",
      "sql schema diagram generator",
    ],
    date: "2026-09-15",
    readingMinutes: 4,
    tags: ["postgres", "database", "tutorial"],
  },
  {
    slug: "database-schema-diagram-tool",
    title: "Database Schema Diagram Tool: 5 Ways to Visualize PostgreSQL",
    description:
      "Compare 5 database schema diagram tools for PostgreSQL: from psql to live connection string. Find the one that fits your workflow.",
    keywords: [
      "database schema diagram tool",
      "database diagram tool",
      "postgres schema diagram tool",
      "er diagram tool",
      "database visualization tool",
    ],
    date: "2026-09-28",
    updated: "2026-10-20",
    readingMinutes: 6,
    tags: ["postgres", "database", "tutorial"],
  },
  {
    slug: "database-schema-health-check",
    title: "Database Schema Health Check: 7 Checks Before Ship",
    description:
      "Run a 60-second health check on your PostgreSQL schema: missing primary keys, unindexed foreign keys, naming drift, and the fixes for each.",
    keywords: [
      "database schema health check",
      "postgres schema audit",
      "database schema quality",
      "missing primary key",
      "unindexed foreign key",
    ],
    date: "2026-09-25",
    readingMinutes: 5,
    tags: ["postgres", "database", "tutorial"],
  },
  {
    slug: "how-to-format-sql-postgres",
    title: "How to Format SQL in PostgreSQL: A Practical Guide",
    description:
      "Messy single-line SQL slows everyone down. How to format PostgreSQL properly, which style to pick, and a free formatter that runs in your browser.",
    keywords: [
      "how to format sql",
      "format sql postgres",
      "sql style guide",
      "prettify sql query",
      "sql formatting standards",
    ],
    date: "2026-09-25",
    readingMinutes: 4,
    tags: ["postgres", "database", "tutorial"],
  },
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
