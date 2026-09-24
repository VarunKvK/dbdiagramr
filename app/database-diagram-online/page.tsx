import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import TwoWaysToUse from "@/app/sections/TwoWaysToUse";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { NEXTAUTH_SQL } from "@/lib/sql/pgDumpSamples";

const schema = parseSqlToSchema(NEXTAUTH_SQL).schema;

export const metadata: Metadata = {
  title: "Database Diagram Online -- Free Tool to Visualize PostgreSQL",
  description:
    "Create a database diagram online without installing anything. Paste your PostgreSQL connection string and see your schema as an interactive ER diagram.",
  keywords:
    "database diagram online, database diagram tool, online erd, database visualizer, postgresql diagram online",
  alternates: {
    canonical: "https://www.dbdiagramr.space/database-diagram-online",
  },
  openGraph: {
    title: "Database Diagram Online -- Free Tool to Visualize PostgreSQL",
    description:
      "Create a database diagram online without installing anything. Free, no signup.",
    type: "website",
    url: "https://www.dbdiagramr.space/database-diagram-online",
  },
  twitter: {
    card: "summary_large_image",
    title: "Database Diagram Online -- Free Tool to Visualize PostgreSQL",
    description:
      "Create a database diagram online without installing anything. Free, no signup.",
  },
};

const faqs = [
  {
    q: "Do I need to install anything?",
    a: "No. dbdiagramr runs entirely in your browser. There is nothing to download, install, or configure. Just open the tool, paste your connection string, and see your diagram.",
  },
  {
    q: "Can I use this with MySQL?",
    a: "Not yet. dbdiagramr currently supports PostgreSQL only. We focus on doing one database really well. If you need MySQL support, let us know on GitHub.",
  },
  {
    q: "How is this different from pgAdmin?",
    a: "pgAdmin shows your tables in a list and has a basic ERD tool. dbdiagramr generates a fully interactive diagram you can pan, zoom, and hover to trace foreign key relationships -- all from a connection string with no setup.",
  },
  {
    q: "Can I share the diagram with my team?",
    a: "Yes. Export as PNG or SVG to share in docs, Slack, or GitHub. You can also share the interactive diagram link so your team can explore the schema themselves.",
  },
  {
    q: "Is there a limit on how many diagrams I can create?",
    a: "The free plan includes 5 diagrams per month. Pro costs $8/month for unlimited diagrams. No credit card is required to try the free plan.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/database-diagram-online#article",
      headline: "Database Diagram Online -- Free Tool to Visualize PostgreSQL",
      description:
        "Create a database diagram online without installing anything. Paste your PostgreSQL connection string and see your schema.",
      datePublished: "2026-09-08",
      dateModified: "2026-09-08",
      mainEntityOfPage:
        "https://www.dbdiagramr.space/database-diagram-online",
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
      "@id": "https://www.dbdiagramr.space/database-diagram-online#faq",
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
          name: "Database Diagram Online",
          item: "https://www.dbdiagramr.space/database-diagram-online",
        },
      ],
    },
  ],
};

export default function DatabaseDiagramOnlinePage() {
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
            Browser-Based
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            Database Diagram Online
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Paste SQL or connect to your PostgreSQL database right in your browser.
            See your schema as an interactive diagram in seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Browser-Based", "Paste SQL or Connect", "Live Preview"].map((label) => (
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
              <li>
                <strong className="text-ink">Nullable columns</strong> marked so
                you can see optional relationships
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

        <RelatedTools current="/database-diagram-online" />

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Create your database diagram now
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive
            database diagram in under 10 seconds. No install required.
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
