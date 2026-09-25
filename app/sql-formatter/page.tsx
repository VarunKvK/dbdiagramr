import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import SqlFormatter from "@/components/SqlFormatter";

export const metadata: Metadata = {
  title: "Free SQL Formatter — Format & Beautify PostgreSQL Online",
  description:
    "Paste messy SQL and get clean, consistently formatted PostgreSQL in seconds. Uppercase keywords, smart indenting, free, no signup, private.",
  keywords:
    "sql formatter, format sql online, postgres sql formatter, prettify sql, beautify sql query, sql formatter online free",
  alternates: {
    canonical: "https://www.dbdiagramr.space/sql-formatter",
  },
  openGraph: {
    title: "Free SQL Formatter — Format & Beautify PostgreSQL Online",
    description:
      "Paste messy SQL and get clean, formatted PostgreSQL in seconds. No signup required.",
    type: "website",
    url: "https://www.dbdiagramr.space/sql-formatter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free SQL Formatter — Format & Beautify PostgreSQL Online",
    description:
      "Paste messy SQL and get clean, formatted PostgreSQL in seconds.",
  },
};

const faqs = [
  {
    q: "What does the SQL formatter do?",
    a: "It takes messy SQL — single-line queries from logs, ORM output, or hand-written DDL — and re-indents it with consistent keyword casing and line breaks. The meaning of your query never changes, only the layout.",
  },
  {
    q: "Is my SQL private?",
    a: "Yes. Formatting runs entirely in your browser with no server round-trip. Your SQL is never uploaded, stored, or logged.",
  },
  {
    q: "Which SQL dialect is supported?",
    a: "PostgreSQL. The formatter understands Postgres-specific syntax including dollar-quoted strings, casts, and procedural blocks.",
  },
  {
    q: "Can it format SELECT queries or only CREATE TABLE?",
    a: "Both. SELECTs, JOINs, CTEs, DDL, migrations — anything valid PostgreSQL formats correctly.",
  },
  {
    q: "Should keywords be uppercase or lowercase?",
    a: "There is no technical difference — Postgres is case-insensitive for keywords. UPPERCASE is the traditional DBA style; lowercase matches modern dbt-style analytics codebases. Pick one and enforce it. The formatter supports both plus preserve.",
  },
  {
    q: "I formatted my schema SQL — what next?",
    a: "Visualize it as an interactive ER diagram, or run it through the schema health analyzer to catch missing keys and slow joins before you ship.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/sql-formatter#article",
      headline: "Free SQL Formatter -- Format & Beautify PostgreSQL Online",
      description:
        "Paste messy SQL and get clean, consistently formatted PostgreSQL in seconds.",
      datePublished: "2026-09-25",
      dateModified: "2026-09-25",
      mainEntityOfPage: "https://www.dbdiagramr.space/sql-formatter",
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
      "@id": "https://www.dbdiagramr.space/sql-formatter#faq",
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
          name: "Tools",
          item: "https://www.dbdiagramr.space/tools",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "SQL Formatter",
          item: "https://www.dbdiagramr.space/sql-formatter",
        },
      ],
    },
  ],
};

export default function SqlFormatterPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <Link
          href="/tools"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
        >
          &larr; All tools
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Free tool
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            SQL Formatter
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Paste messy SQL and get clean, consistently formatted PostgreSQL in
            seconds. Keyword casing, smart indenting, copy or download. Free,
            no signup, private.
          </p>
        </div>

        <SqlFormatter />

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-medium text-ink">
            Why format your SQL
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">Readable diffs</strong> — formatted
                migrations produce clean pull-request diffs instead of
                single-line noise
              </li>
              <li>
                <strong className="text-ink">Faster debugging</strong> — a
                misplaced JOIN or WHERE is obvious when every clause starts on
                its own line
              </li>
              <li>
                <strong className="text-ink">Team consistency</strong> — one
                style for every query, enforced in seconds rather than by
                convention docs nobody reads
              </li>
              <li>
                <strong className="text-ink">Log triage</strong> — paste a
                400-character query from your app logs and actually read it
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

        <RelatedTools current="/sql-formatter" />

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Formatted your schema? See it as a diagram
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
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
