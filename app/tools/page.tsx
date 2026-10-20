import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";

export const metadata: Metadata = {
  title: "Free Database Tools | ER Diagrams, Converters & Validators",
  description:
    "Every free dbdiagramr tool in one place: ER diagrams, SQL validator, CSV/JSON to SQL, SQL to Prisma/TypeScript/Mermaid, connection string builder. No signup.",
  keywords:
    "free database tools, postgres tools, er diagram tool, sql validator, csv to sql, json to sql, sql to prisma, sql to typescript",
  alternates: {
    canonical: "https://www.dbdiagramr.space/tools",
  },
  openGraph: {
    title: "Free Database Tools | ER Diagrams, Converters & Validators",
    description:
      "Every free dbdiagramr tool in one place: ER diagrams, SQL validator, CSV/JSON to SQL, SQL to Prisma/TypeScript/Mermaid. No signup.",
    type: "website",
    url: "https://www.dbdiagramr.space/tools",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Database Tools | ER Diagrams, Converters & Validators",
    description:
      "Every free dbdiagramr tool in one place: ER diagrams, SQL validator, CSV/JSON to SQL, SQL to Prisma/TypeScript/Mermaid. No signup.",
  },
};

const tools = [
  {
    href: "/supabase-rls-check",
    name: "Supabase RLS Check",
    description:
      "Connect with a read-only role and see which public tables have RLS off, RLS with no policies, or protection in place.",
    tags: ["Supabase", "Security", "New"],
  },
  {
    href: "/",
    name: "PostgreSQL ER Diagram",
    description:
      "Paste a connection string and see your live PostgreSQL schema as an interactive ER diagram in under 10 seconds.",
    tags: ["ER diagram", "Live database", "Most popular"],
  },
  {
    href: "/database-schema-analyzer",
    name: "Schema Health Analyzer",
    description:
      "Paste SQL and get a graded schema health report: missing keys, unindexed foreign keys, naming drift, each with a fix.",
    tags: ["Health check", "Graded report", "New"],
  },
  {
    href: "/sql-formatter",
    name: "SQL Formatter",
    description:
      "Paste messy SQL and get clean, consistently formatted PostgreSQL. Keyword casing, smart indenting, copy or download.",
    tags: ["Formatter", "PostgreSQL"],
  },
  {
    href: "/csv-to-sql",
    name: "CSV to SQL",
    description:
      "Drop in a CSV and get CREATE TABLE with detected types plus INSERTs. File never leaves your browser.",
    tags: ["Converter", "CSV", "New"],
  },
  {
    href: "/json-to-sql",
    name: "JSON to SQL",
    description:
      "Paste JSON and get CREATE TABLE + INSERTs. Nested objects become linked child tables.",
    tags: ["Converter", "JSON", "New"],
  },
  {
    href: "/sql-validator",
    name: "SQL Validator",
    description:
      "Check PostgreSQL syntax with the real Postgres parser. Line-level errors, private, instant.",
    tags: ["Validator", "PostgreSQL", "New"],
  },
  {
    href: "/sql-to-mermaid",
    name: "SQL to Mermaid",
    description:
      "Paste CREATE TABLE and get erDiagram code for GitHub READMEs, Notion, and docs.",
    tags: ["Converter", "Mermaid", "New"],
  },
  {
    href: "/sql-to-typescript",
    name: "SQL to TypeScript",
    description:
      "Generate TypeScript interfaces and Zod schemas from PostgreSQL DDL. Nullables handled.",
    tags: ["Converter", "TypeScript", "New"],
  },
  {
    href: "/sql-to-prisma",
    name: "SQL to Prisma",
    description:
      "Turn CREATE TABLE into schema.prisma with native types, ids, and relations mapped.",
    tags: ["Converter", "Prisma", "New"],
  },
  {
    href: "/postgres-connection-string",
    name: "Connection String Builder",
    description:
      "Build or decode PostgreSQL URIs with Supabase, Neon, and Railway presets. Passwords stay local.",
    tags: ["PostgreSQL", "Connection", "New"],
  },
  {
    href: "/sql-schema-diff",
    name: "Schema Diff",
    description:
      "Paste two schema versions and get the structural diff plus the ALTER statements to migrate.",
    tags: ["Diff", "Migrations", "New"],
  },
  {
    href: "/github-schema-action",
    name: "PR Schema Diff Action",
    description:
      "GitHub Action that comments a schema diff, migration preview, and Mermaid ER diagram on every PR touching your Postgres migrations.",
    tags: ["GitHub Action", "CI", "New"],
  },
  {
    href: "/dbml-to-sql",
    name: "DBML to SQL",
    description:
      "Convert DBML Tables and Refs to PostgreSQL DDL, or SQL back to DBML, in one click.",
    tags: ["Converter", "DBML", "New"],
  },
  {
    href: "/prisma-erd-generator",
    name: "Prisma ERD",
    description:
      "Paste schema.prisma and see every model and relation as an interactive ER diagram. No install.",
    tags: ["Prisma", "ER diagram", "New"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.dbdiagramr.space/tools",
      name: "dbdiagramr Free Database Tools",
      description:
        "Free database tools: PostgreSQL ER diagrams, schema health analyzer, SQL converters, and validators.",
      url: "https://www.dbdiagramr.space/tools",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: tools.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: tool.name,
          item: `https://www.dbdiagramr.space${tool.href}`,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://www.dbdiagramr.space",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://www.dbdiagramr.space/tools",
        },
      ],
    },
  ],
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 font-mono text-xs font-medium text-accent">
            Free tools
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Free database tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Every dbdiagramr tool in one place. Pick what you need: diagrams,
            health checks, generators. All free, no signup, private by default.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-[20px] bg-pine p-8 shadow-sm transition-colors hover:bg-ink"
            >
              <h2 className="text-2xl font-semibold tracking-tight text-white">
                {tool.name}
              </h2>
              <p className="mt-3 leading-relaxed text-white/70">
                {tool.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-[20px] border border-punch px-3 py-1 font-mono text-xs font-medium text-punch"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 text-xs font-medium text-white">
                Open tool <span className="text-punch">→</span>
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Just want to see your database?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste a PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup, no setup.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/visualize"
              className="inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
            >
              Try it free →
            </a>
            <a
              href="https://github.com/VarunKvK/dbdiagramr"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block rounded-[10px] border border-white/40 px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-white/10"
            >
              View on GitHub
            </a>
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}
