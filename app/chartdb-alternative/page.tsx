import type { Metadata } from "next";
import Footer from "@/app/sections/Footer";

export const metadata: Metadata = {
  title: "ChartDB Alternative | Live PostgreSQL ER Diagrams (2026)",
  description:
    "Looking for a ChartDB alternative? dbdiagramr connects straight to PostgreSQL and draws the live schema in under 10 seconds. Free, MIT licensed, no signup. Compared side by side.",
  alternates: {
    canonical: "https://www.dbdiagramr.space/chartdb-alternative",
  },
};

const comparisonRows = [
  {
    feature: "How you import a schema",
    dbdiagramr: "Paste a PostgreSQL connection string",
    chartdb: "Run a metadata query, paste the JSON result",
  },
  {
    feature: "Needs database credentials",
    dbdiagramr: "Yes - a read-only connection string, used for one request",
    chartdb: "No - the query runs on your machine or client",
  },
  {
    feature: "Reads the live database directly",
    dbdiagramr: "Yes",
    chartdb: "No - works from the query output",
  },
  {
    feature: "Time to first diagram",
    dbdiagramr: "Under 10 seconds",
    chartdb: "Seconds after running and pasting the query",
  },
  {
    feature: "Databases supported",
    dbdiagramr: "PostgreSQL (including Supabase, Neon, Railway)",
    chartdb: "PostgreSQL, MySQL, SQL Server, SQLite, and others",
  },
  {
    feature: "Row Level Security status",
    dbdiagramr: "Yes - per table on live connections",
    chartdb: "Not part of the diagram",
  },
  {
    feature: "Licence",
    dbdiagramr: "MIT",
    chartdb: "AGPL-3.0",
  },
  {
    feature: "Signup required",
    dbdiagramr: "No",
    chartdb: "No for the free editor",
  },
  {
    feature: "Diagram limit",
    dbdiagramr: "None",
    chartdb: "Free editor, with paid team features",
  },
  {
    feature: "Export",
    dbdiagramr: "SVG and PNG",
    chartdb: "SQL and image export",
  },
  {
    feature: "Best for",
    dbdiagramr: "Seeing a PostgreSQL database that already exists, fast",
    chartdb: "Editing schemas and working across several database engines",
  },
];

const faqs = [
  {
    q: "Is dbdiagramr a good ChartDB alternative?",
    a: "Yes, if your database is PostgreSQL and you want the diagram to come straight from the live database. Paste a connection string and dbdiagramr renders the schema in under 10 seconds, with no query to run and no JSON to paste. ChartDB is the better choice if you need MySQL or SQL Server, or want to edit a schema rather than just inspect it.",
  },
  {
    q: "Does dbdiagramr need database access?",
    a: "Yes. dbdiagramr connects with the read-only PostgreSQL connection string you provide. It reads table and column metadata from pg_catalog, not row data, and the connection string is used for a single request and then discarded. ChartDB takes the opposite approach: you run its metadata query yourself, so the tool never gets credentials.",
  },
  {
    q: "Is dbdiagramr open source?",
    a: "Yes, under the MIT licence. The source is at github.com/VarunKvK/dbdiagramr. ChartDB is also open source, under AGPL-3.0.",
  },
  {
    q: "Does dbdiagramr support MySQL or SQL Server?",
    a: "Not yet. dbdiagramr focuses on PostgreSQL, which covers Supabase, Neon, Railway, and most modern Postgres stacks. ChartDB supports several database engines.",
  },
  {
    q: "Is dbdiagramr free?",
    a: "Yes. Every diagramming feature is free, with no diagram limit and no account. A Pro plan for saved diagrams, version history, sharing and multiple schemas is in development; there is no price and no checkout yet. Nothing you visualize is stored or published.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/chartdb-alternative#article",
      headline: "ChartDB Alternative - Live PostgreSQL ER Diagrams",
      description:
        "ChartDB vs dbdiagramr compared: query-and-paste schema import vs a direct PostgreSQL connection that renders the live schema in seconds.",
      datePublished: "2026-10-20",
      dateModified: "2026-10-20",
      mainEntityOfPage: "https://www.dbdiagramr.space/chartdb-alternative",
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
      "@id": "https://www.dbdiagramr.space/chartdb-alternative#faq",
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
          name: "Alternatives",
          item: "https://www.dbdiagramr.space/alternatives",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "ChartDB alternative",
          item: "https://www.dbdiagramr.space/chartdb-alternative",
        },
      ],
    },
  ],
};

function Row({ row }: { row: (typeof comparisonRows)[number] }) {
  return (
    <tr className="border-b border-border last:border-b-0">
      <td className="px-4 py-3 text-sm font-medium text-ink">{row.feature}</td>
      <td className="px-4 py-3 text-sm text-muted">{row.dbdiagramr}</td>
      <td className="px-4 py-3 text-sm text-muted">{row.chartdb}</td>
    </tr>
  );
}

export default function ChartDbAlternativePage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-5xl px-4 pb-16 pt-24">
        <a
          href="/alternatives"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          ← All alternatives
        </a>

        <div className="mb-10">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Alternative
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            A ChartDB alternative for live PostgreSQL diagrams
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            ChartDB and dbdiagramr both turn an existing database into an ER
            diagram in the browser. The difference is the import: ChartDB asks
            you to run a metadata query and paste the result, while dbdiagramr
            connects to PostgreSQL directly and draws the real schema in under
            10 seconds. No query to write, no JSON to paste.
          </p>
          <p className="mt-3 text-sm text-muted/70">
            Last updated: 2026-10-20
          </p>
        </div>

        <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-surface text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                  Feature
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-accent">
                  dbdiagramr
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                  ChartDB
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <Row key={row.feature} row={row} />
              ))}
            </tbody>
          </table>
        </div>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            When to choose dbdiagramr
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                Your database is PostgreSQL and you want the diagram to match
                production without running a query by hand.
              </li>
              <li>
                You are onboarding, debugging, or documenting and need the schema
                on screen immediately.
              </li>
              <li>
                You want to check which tables have Row Level Security enabled
                while you look at the relationships.
              </li>
              <li>
                You prefer an MIT-licensed tool with no account and no diagram
                limit.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            When to choose ChartDB
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                You work across MySQL, SQL Server, SQLite, or several engines.
              </li>
              <li>
                You want to design and edit a schema, not only inspect the
                current one.
              </li>
              <li>
                You cannot share database credentials with any browser tool and
                prefer to run the metadata query yourself.
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

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Try the direct-connect approach
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram of your own schema in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Try it free →
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
