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
      "Compare five practical ways to turn a Postgres database into a readable schema diagram — from psql to a live connection string — and pick the one that fits.",
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
      "What lives in Supabase's auth schema — users, identities, sessions, refresh_tokens — and how they relate when you introspect a live database.",
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
      "What an ER diagram actually shows — entities, attributes, relationships, and cardinality — and how to read one in under 5 minutes.",
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
      "Model Stripe's billing objects as PostgreSQL tables — customers, products, prices, subscriptions, invoices, and payment intents with foreign keys.",
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
      "The 11-table PostgreSQL schema that powers Shopify and WooCommerce — customers, products, carts, orders, payments, and reviews with relationships.",
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
];

export function getPost(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}

export function getAllPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => (a.date < b.date ? 1 : -1));
}
