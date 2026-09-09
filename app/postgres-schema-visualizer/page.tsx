import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import TwoWaysToUse from "@/app/sections/TwoWaysToUse";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { BLOG_SQL } from "@/lib/sql/pgDumpSamples";

const schema = parseSqlToSchema(BLOG_SQL).schema;

export const metadata: Metadata = {
  title: "PostgreSQL Schema Visualizer -- See Your Database Structure",
  description:
    "Visualize your PostgreSQL schema with an interactive ER diagram. Tables, columns, foreign keys, and relationships at a glance. No signup required.",
  keywords:
    "postgresql schema visualizer, postgres schema visualizer, visualize postgres database, postgresql table relationship diagram, erd from postgresql",
  alternates: {
    canonical: "https://www.dbdiagramr.space/postgres-schema-visualizer",
  },
  openGraph: {
    title: "PostgreSQL Schema Visualizer -- See Your Database Structure",
    description:
      "Visualize your PostgreSQL schema with an interactive ER diagram. Free, no signup.",
    type: "website",
    url: "https://www.dbdiagramr.space/postgres-schema-visualizer",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostgreSQL Schema Visualizer -- See Your Database Structure",
    description:
      "Visualize your PostgreSQL schema with an interactive ER diagram. Free, no signup.",
  },
};

const faqs = [
  {
    q: "What is schema visualization?",
    a: "Schema visualization converts your database metadata -- tables, columns, foreign keys, and constraints -- into a visual diagram. Instead of reading SQL or browsing a list, you see how your database is structured at a glance.",
  },
  {
    q: "What is information_schema vs pg_catalog?",
    a: "information_schema is the SQL-standard way to query database metadata. pg_catalog is PostgreSQL's internal catalog with more detail. dbdiagramr reads your schema using the standard approach, so it works with any PostgreSQL version.",
  },
  {
    q: "Does this work with managed PostgreSQL?",
    a: "Yes. It works with Supabase, Neon, Railway, AWS RDS, Google Cloud SQL, Azure Database for PostgreSQL, and any self-hosted PostgreSQL instance. Just paste the connection string.",
  },
  {
    q: "How accurate is the diagram?",
    a: "100%. The diagram reads your live schema directly from the database. If you add a column or create a new table, the next visualization shows it immediately. Nothing is cached or guessed.",
  },
  {
    q: "Can I use this for database documentation?",
    a: "Yes. Export the diagram as PNG or SVG and include it in your README, technical docs, or architecture diagrams. It is a great way to onboard new team members.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id":
        "https://www.dbdiagramr.space/postgres-schema-visualizer#article",
      headline: "PostgreSQL Schema Visualizer -- See Your Database Structure",
      description:
        "Visualize your PostgreSQL schema with an interactive ER diagram. Tables, columns, foreign keys, and relationships at a glance.",
      datePublished: "2026-09-08",
      dateModified: "2026-09-08",
      mainEntityOfPage:
        "https://www.dbdiagramr.space/postgres-schema-visualizer",
      author: {
        "@type": "Person",
        name: "Varun Krishnan",
        url: "https://github.com/VarunKvK",
      },
      publisher: {
        "@type": "Organization",
        name: "dbdiagramr",
        url: "https://www.dbdiagramr.space",
        logo: {
          "@type": "ImageObject",
          url: "https://www.dbdiagramr.space/favicon.svg",
        },
      },
    },
    {
      "@type": "FAQPage",
      "@id":
        "https://www.dbdiagramr.space/postgres-schema-visualizer#faq",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
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
          name: "PostgreSQL Schema Visualizer",
          item: "https://www.dbdiagramr.space/postgres-schema-visualizer",
        },
      ],
    },
  ],
};

export default function PostgresSchemaVisualizerPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <Link
          href="/visualize"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
        >
          &larr; Try the tool
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            PostgreSQL
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            PostgreSQL Schema Visualizer
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Paste SQL or connect to your PostgreSQL database. See tables,
            relationships, and constraints as an interactive diagram in seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Paste SQL or Connect", "Live Preview", "Export SVG/PNG"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-400 bg-[#D4D2FF] px-4 py-1.5 text-xs font-medium text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <p className="text-indigo-600">{label}</p>
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5">
          <div className="flex h-10 items-center gap-2 border-b border-[#333] bg-[#252525] px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            <span className="ml-2 text-xs text-[#999]">
              dbdiagramr.space/visualize
            </span>
          </div>
          <div className="h-[540px] overflow-hidden">
            <SchemaDiagram schema={schema} className="h-full w-full" />
          </div>
        </div>

        <TwoWaysToUse />

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-medium text-ink">
            What you can see
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">Every table</strong> in your
                database with columns and data types
              </li>
              <li>
                <strong className="text-ink">Foreign key relationships</strong>{" "}
                drawn as lines between tables
              </li>
              <li>
                <strong className="text-ink">Primary keys</strong> highlighted
                on each table
              </li>
              <li>
                <strong className="text-ink">Nullable columns</strong> marked so
                you can see optional relationships
              </li>
              <li>
                <strong className="text-ink">Export options</strong> -- PNG, SVG,
                or interactive shareable link
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-medium text-ink">
            Frequently asked questions
          </h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <h3 className="text-lg font-medium text-ink">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Visualize your PostgreSQL schema now
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive
            schema diagram in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free &rarr;
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
