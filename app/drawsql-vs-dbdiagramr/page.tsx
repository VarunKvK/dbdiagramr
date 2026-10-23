import type { Metadata } from "next";
import Footer from "@/app/sections/Footer";
import FaqAccordion from "@/app/sections/FaqAccordion";

export const metadata: Metadata = {
  title: { absolute: "DrawSQL vs dbdiagramr (2026): Which ER Diagram Tool?" },
  description:
    "DrawSQL vs dbdiagramr: visual editing and team collaboration vs instant diagrams from a live PostgreSQL connection string. Compared with FAQs.",
  alternates: {
    canonical: "https://www.dbdiagramr.space/drawsql-vs-dbdiagramr",
  },
  openGraph: {
    title: "DrawSQL vs dbdiagramr (2026): Which ER Diagram Tool?",
    description:
      "Team collaboration and visual editing versus instant diagrams from a live PostgreSQL connection.",
    type: "website",
    url: "https://www.dbdiagramr.space/drawsql-vs-dbdiagramr",
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DrawSQL vs dbdiagramr (2026)",
    description:
      "Team collaboration and visual editing versus instant diagrams from a live PostgreSQL connection.",
    images: ["/DbDiagramr-OG.png"],
  },
};

const comparisonRows = [
  {
    feature: "How you create a diagram",
    dbdiagramr: "Paste a live PostgreSQL connection string",
    drawsql: "Paste CREATE TABLE SQL or draw tables by hand",
  },
  {
    feature: "Time to first diagram",
    dbdiagramr: "Under 10 seconds",
    drawsql: "Seconds to minutes, depending on import method",
  },
  {
    feature: "Shows your actual database",
    dbdiagramr: "Yes - reads live tables, columns, and foreign keys",
    drawsql: "No - imports SQL DDL; no live database connection",
  },
  {
    feature: "Databases supported",
    dbdiagramr: "PostgreSQL",
    drawsql: "MySQL, PostgreSQL, SQL Server, MariaDB",
  },
  {
    feature: "Signup required",
    dbdiagramr: "No",
    drawsql: "No - free canvas works without an account",
  },
  {
    feature: "Free plan",
    dbdiagramr: "Unlimited diagrams",
    drawsql: "Unlimited public diagrams (15 tables each); private on paid plans",
  },
  {
    feature: "Private diagrams on free plan",
    dbdiagramr: "Yes - nothing is stored or published",
    drawsql: "No - free diagrams are public unless paid",
  },
  {
    feature: "Interactive hover-to-trace relationships",
    dbdiagramr: "Yes",
    drawsql: "No - visual editor, not a relationship tracer",
  },
  {
    feature: "Export options",
    dbdiagramr: "PNG and SVG",
    drawsql: "SQL, Laravel, images; JSON and SVG on paid plans",
  },
  {
    feature: "Paid plan",
    dbdiagramr: "Pro in development, no billing yet",
    drawsql: "Paid plans available - see DrawSQL pricing",
  },
  {
    feature: "Free companion tools",
    dbdiagramr: "SQL formatter and schema health analyzer included free",
    drawsql: "Templates and MySQL/SQL Server import on free canvas",
  },
  {
    feature: "Best for",
    dbdiagramr: "Understanding a PostgreSQL database that already exists",
    drawsql: "Designing and collaborating on schemas with a team",
  },
];

const faqs = [
  {
    q: "Is dbdiagramr a good DrawSQL alternative?",
    a: "If your goal is to understand a PostgreSQL database that already exists, dbdiagramr is a strong alternative - paste a connection string and get an interactive ER diagram in under 10 seconds, with no signup and nothing published. DrawSQL is a better fit if you need team collaboration, real-time multiplayer, or support for MySQL, SQL Server, and MariaDB.",
  },
  {
    q: "What is the main difference between DrawSQL and dbdiagramr?",
    a: "DrawSQL is a visual schema editor built for teams to design databases together. dbdiagramr is a fast introspection tool - it connects to your live PostgreSQL database and renders the real schema, so the diagram always matches production.",
  },
  {
    q: "Does dbdiagramr support MySQL or SQL Server?",
    a: "Not yet. dbdiagramr currently focuses on PostgreSQL, which covers Supabase, Neon, Railway, and most modern stacks. DrawSQL supports MySQL, PostgreSQL, SQL Server, and MariaDB.",
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
      "@id": "https://www.dbdiagramr.space/drawsql-vs-dbdiagramr#article",
      headline: "DrawSQL vs dbdiagramr - Which ER Diagram Tool?",
      description:
        "DrawSQL vs dbdiagramr compared: team collaboration and visual schema editing vs instant ER diagrams from a live PostgreSQL connection string.",
      datePublished: "2026-08-04",
      dateModified: "2026-09-28",
      mainEntityOfPage: "https://www.dbdiagramr.space/drawsql-vs-dbdiagramr",
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
      "@id": "https://www.dbdiagramr.space/drawsql-vs-dbdiagramr#faq",
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
          name: "DrawSQL vs dbdiagramr",
          item: "https://www.dbdiagramr.space/drawsql-vs-dbdiagramr",
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
      <td className="px-4 py-3 text-sm text-muted">{row.drawsql}</td>
    </tr>
  );
}

export default function DrawSqlVsPage() {
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
            Comparison
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            DrawSQL vs dbdiagramr
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            DrawSQL and dbdiagramr both help developers work with database
            schemas, but they serve different moments. DrawSQL is a visual
            editor for designing and reviewing schemas with a team. dbdiagramr
            is a fast way to visualize a PostgreSQL database that already exists
            - paste a connection string and see the real schema in under 10
            seconds.
          </p>
          <p className="mt-3 text-sm text-muted/70">
            Last updated: 2026-09-28
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
                  DrawSQL
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <Row key={row.feature} row={row} />
              ))}
            </tbody>
          </table>
          <p className="mt-3 text-xs leading-relaxed text-muted">
            Last verified: 2026-10-23. Sources:{" "}
            <a href="https://drawsql.app/pricing" target="_blank" rel="noreferrer" className="text-accent underline">DrawSQL pricing</a>,{" "}
            <a href="https://drawsql.app/features" target="_blank" rel="noreferrer" className="text-accent underline">DrawSQL features</a>.
            Prices and limits change; check the vendor page before buying.
          </p>
        </div>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            When to choose dbdiagramr
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                You need to quickly understand a PostgreSQL database that
                already exists - for onboarding, debugging, or documentation.
              </li>
              <li>
                You want the diagram to match production exactly, read straight
                from the live database.
              </li>
              <li>
                You want to trace foreign key relationships by hovering, with no
                signup and nothing published.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            When to choose DrawSQL
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                You are designing or evolving a schema with a team and need
                real-time multiplayer editing.
              </li>
              <li>
                You work across multiple databases (MySQL, PostgreSQL, SQL
                Server, MariaDB).
              </li>
              <li>
                You want AI-assisted schema review and sticky-note discussions
                on a paid plan.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faqs} variant="card" />
        </section>

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Visualize your own database
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
