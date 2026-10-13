import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import SchemaAnalyzer from "@/components/SchemaAnalyzer";

export const metadata: Metadata = {
  title: "Free Database Schema Analyzer | Grade Your PostgreSQL Schema",
  description:
    "Paste your SQL and get a graded PostgreSQL schema health report: missing primary keys, unindexed foreign keys, naming drift. Free, no signup, private.",
  keywords:
    "database schema analyzer, schema health check, postgres schema audit, missing primary key checker, database schema quality, foreign key index checker",
  alternates: {
    canonical: "https://www.dbdiagramr.space/database-schema-analyzer",
  },
  openGraph: {
    title: "Free Database Schema Analyzer | Grade Your PostgreSQL Schema",
    description:
      "Paste SQL, get a graded schema health report in seconds. Missing keys, unindexed foreign keys, naming drift. No signup required.",
    type: "website",
    url: "https://www.dbdiagramr.space/database-schema-analyzer",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Database Schema Analyzer | Grade Your PostgreSQL Schema",
    description:
      "Paste SQL, get a graded schema health report in seconds. No signup required.",
  },
};

const faqs = [
  {
    q: "What does the database schema analyzer check?",
    a: "Seven checks: tables without a primary key, foreign keys that may lack an index, nullable foreign keys, id columns that are not the primary key, mixed naming conventions, unusually wide tables, and missing created_at audit columns. Each issue ships with a one-line fix.",
  },
  {
    q: "Is my SQL private?",
    a: "Yes. The analyzer runs entirely in your browser. Your SQL is parsed locally and never sent to any server, stored, or logged.",
  },
  {
    q: "Why does a missing index on a foreign key matter?",
    a: "PostgreSQL does not automatically index foreign key columns. Without an index, every join and every delete on the parent table can degrade into a sequential scan. Adding the index is usually a one-line CREATE INDEX.",
  },
  {
    q: "What is a good schema health score?",
    a: "90+ (grade A) means a clean schema with at most minor notes. 75-89 (B) is healthy with a few warnings worth fixing. Below 60 (D) usually means missing primary keys. Fix those first, they affect correctness, not just performance.",
  },
  {
    q: "Can I export the report?",
    a: "Yes. Copy it as Markdown for a pull request or design doc, or download it as a .md file. No account required.",
  },
  {
    q: "What do I do after fixing the issues?",
    a: "Paste the fixed SQL into dbdiagramr to visualize the clean schema as an interactive ER diagram, or connect your live PostgreSQL database to confirm the report matches what is actually deployed.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/database-schema-analyzer#article",
      headline: "Free Database Schema Analyzer | Grade Your PostgreSQL Schema",
      description:
        "Paste your SQL and get a graded PostgreSQL schema health report: missing primary keys, unindexed foreign keys, naming drift.",
      datePublished: "2026-09-25",
      dateModified: "2026-09-25",
      mainEntityOfPage: "https://www.dbdiagramr.space/database-schema-analyzer",
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
      "@id": "https://www.dbdiagramr.space/database-schema-analyzer#faq",
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
          name: "Database Schema Analyzer",
          item: "https://www.dbdiagramr.space/database-schema-analyzer",
        },
      ],
    },
  ],
};

const checks = [
  "Missing primary keys",
  "Unindexed foreign keys",
  "Nullable foreign keys",
  "Naming drift",
  "Wide tables",
  "Audit columns",
];

export default function SchemaAnalyzerPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <Link
          href="/visualize"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          &larr; Try the tool
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Free tool
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Database Schema Analyzer
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Paste your SQL and get a graded PostgreSQL schema health report in
            seconds. Missing keys, slow joins, naming drift, each flagged with a fix
            for each. Free, no signup, private.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {checks.map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-4 py-1.5 text-xs font-medium text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <p className="text-accent">{label}</p>
              </span>
            ))}
          </div>
        </div>

        <SchemaAnalyzer />

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            What the analyzer checks
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">Primary keys</strong> on every
                table. Missing keys break identity and replication
              </li>
              <li>
                <strong className="text-ink">Foreign key indexes</strong>:
                Postgres does not auto-index FK columns, unindexed joins are slow
              </li>
              <li>
                <strong className="text-ink">Nullable foreign keys</strong>:
                usually a design smell unless the relation is optional
              </li>
              <li>
                <strong className="text-ink">Naming consistency</strong>:
                mixed snake_case and camelCase across tables
              </li>
              <li>
                <strong className="text-ink">Table shape</strong>: unusually
                wide tables and missing audit columns
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-[20px] border border-border bg-white p-6 shadow-sm"
              >
                <h3 className="text-lg font-medium text-ink">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <RelatedTools current="/database-schema-analyzer" />

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            See your healthy schema as a diagram
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Try it free &rarr;
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
