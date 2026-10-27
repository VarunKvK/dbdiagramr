export type BlogPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  date: string; // YYYY-MM-DD
  updated?: string; // YYYY-MM-DD, when the body changed after publication
  readingMinutes: number;
  tags: string[];
  byline?: "By" | "Written by";
  // Canonical: where the primary version lives (dev.to initially, self later)
  canonical?: string;
  // Dev.to URL once published
  devtoUrl?: string;
  featured?: boolean;
};

export const blogPosts: BlogPost[] = [
  {
    slug: "supabase-self-signed-certificate-in-certificate-chain",
    title: "self-signed certificate in certificate chain: Supabase fix",
    description:
      "Fix self-signed certificate in certificate chain on Supabase: trust the Supabase CA, keep hostname verification on, and verify with node-postgres.",
    keywords: [
      "self-signed certificate in certificate chain",
      "supabase ssl certificate",
      "node-postgres supabase ssl",
      "prisma supabase ssl",
      "supabase prod-ca-2021.crt",
    ],
    date: "2026-10-26",
    readingMinutes: 8,
    tags: ["supabase", "postgres", "prisma", "troubleshooting"],
    byline: "Written by",
  },
  {
    slug: "supabase-tenant-or-user-not-found",
    title: "Tenant or user not found: Supabase fix",
    description:
      'Fix "Tenant or user not found" in Supabase: copy the pooler host and postgres.<ref> username from one Connect string, then verify each step.',
    keywords: [
      "supabase tenant or user not found",
      "supabase pooler username",
      "supabase shared pooler error",
      "postgres.<ref> username",
    ],
    date: "2026-10-25",
    readingMinutes: 6,
    tags: ["supabase", "postgres", "troubleshooting"],
    byline: "Written by",
  },
  {
    slug: "prisma-prepared-statement-already-exists-supabase",
    title: 'prepared statement "s0" already exists: Supabase fix',
    description:
      "Fix prepared statement \"s0\" already exists with Prisma on Supabase's Supavisor pooler: add pgbouncer=true, use a direct URL for migrations, and verify.",
    keywords: [
      'prepared statement "s0" already exists',
      "prisma supavisor prepared statement",
      "supabase transaction pooler prisma",
      "prisma prepared statement error",
    ],
    date: "2026-10-25",
    readingMinutes: 8,
    tags: ["supabase", "postgres", "prisma", "troubleshooting"],
    byline: "Written by",
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
    updated: "2026-10-23",
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
    slug: "supabase-connection-string-ipv6-enotfound",
    title: "Supabase getaddrinfo ENOTFOUND db.<ref>.supabase.co Fix",
    description:
      "Fix Supabase getaddrinfo ENOTFOUND db.<ref>.supabase.co: use the session pooler (5432), or transaction pooler (6543) with prepared statements off.",
    keywords: [
      "supabase enotfound",
      "supabase ipv6 connection",
      "supabase transaction pooler 6543",
    ],
    date: "2026-09-08",
    readingMinutes: 7,
    updated: "2026-10-23",
    tags: ["supabase", "postgres", "tutorial"],
    devtoUrl: undefined,
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
    updated: "2026-10-23",
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
