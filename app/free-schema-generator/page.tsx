import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import TwoWaysToUse from "@/app/sections/TwoWaysToUse";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { SIMPLE_SQL } from "@/lib/sql/pgDumpSamples";

const schema = parseSqlToSchema(SIMPLE_SQL).schema;

export const metadata: Metadata = {
  title: "Free Database Schema Generator -- No Signup Required",
  description:
    "Generate a visual database schema from your PostgreSQL connection string. Free, instant, no account needed. Export as PNG or SVG.",
  keywords:
    "free database schema generator, schema generator, database diagram tool, free erd tool, postgresql schema generator",
  alternates: {
    canonical: "https://www.dbdiagramr.space/free-schema-generator",
  },
  openGraph: {
    title: "Free Database Schema Generator -- No Signup Required",
    description:
      "Generate a visual database schema from your PostgreSQL connection string. Free forever.",
    type: "website",
    url: "https://www.dbdiagramr.space/free-schema-generator",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Database Schema Generator -- No Signup Required",
    description:
      "Generate a visual database schema from your PostgreSQL connection string. Free forever.",
  },
};

const faqs = [
  {
    q: "What is a database schema generator?",
    a: "A database schema generator connects to your PostgreSQL database, reads the tables, columns, and relationships, and creates a visual diagram. It saves you from drawing diagrams by hand.",
  },
  {
    q: "Is it really free?",
    a: "Yes. The free plan includes 5 diagrams per month with no credit card required. Pro costs $8/month for unlimited diagrams if you need more.",
  },
  {
    q: "Does it support MySQL or SQLite?",
    a: "Currently dbdiagramr supports PostgreSQL only. We focus on doing one database really well. If you need MySQL or SQLite support, let us know on GitHub.",
  },
  {
    q: "How is this different from drawing a diagram by hand?",
    a: "Hand-drawn diagrams go stale the moment your schema changes. dbdiagramr reads your live database, so the diagram always reflects your actual schema. Add a column and the diagram updates.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. dbdiagramr connects to your database to read the schema and immediately discards the connection string. Your data is never stored, logged, or shared. Nothing is published publicly.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/free-schema-generator#article",
      headline: "Free Database Schema Generator -- No Signup Required",
      description:
        "Generate a visual database schema from your PostgreSQL connection string. Free, instant, no account needed.",
      datePublished: "2026-09-08",
      dateModified: "2026-09-08",
      mainEntityOfPage:
        "https://www.dbdiagramr.space/free-schema-generator",
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
      "@id": "https://www.dbdiagramr.space/free-schema-generator#faq",
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
          name: "Free Schema Generator",
          item: "https://www.dbdiagramr.space/free-schema-generator",
        },
      ],
    },
  ],
};

export default function FreeSchemaGeneratorPage() {
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
            Free Tool
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            Free Database Schema Generator
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Paste SQL or connect to your PostgreSQL database. Generate a visual
            schema diagram in seconds. Free forever, no signup.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Free Forever", "Paste SQL or Connect", "Export SVG/PNG"].map(
              (label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-indigo-400 bg-[#D4D2FF] px-4 py-1.5 text-xs font-medium text-ink"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                  <p className="text-indigo-600">{label}</p>
                </span>
              )
            )}
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
            What the diagram shows
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">All tables</strong> with their
                columns and data types
              </li>
              <li>
                <strong className="text-ink">Primary keys</strong> highlighted
                on each table
              </li>
              <li>
                <strong className="text-ink">Foreign keys</strong> drawn as
                lines connecting related tables
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
            Generate your schema diagram now
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get a visual schema
            diagram in under 10 seconds. Free forever.
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
