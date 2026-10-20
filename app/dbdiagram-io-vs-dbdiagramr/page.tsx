import type { Metadata } from "next";
import Footer from "@/app/sections/Footer";
import FaqAccordion from "@/app/sections/FaqAccordion";

export const metadata: Metadata = {
  title: { absolute: "dbdiagram.io vs dbdiagramr (2026): Which Is Better?" },
  description:
    "dbdiagram.io vs dbdiagramr: DBML design vs instant diagrams from a live PostgreSQL connection string. Feature comparison and FAQs.",
  alternates: {
    canonical: "https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
  },
  openGraph: {
    title: "dbdiagram.io vs dbdiagramr (2026): Which Is Better?",
    description:
      "DBML code-first design versus instant diagrams from a live PostgreSQL connection.",
    type: "website",
    url: "https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "dbdiagram.io vs dbdiagramr (2026)",
    description:
      "DBML code-first design versus instant diagrams from a live PostgreSQL connection.",
    images: ["/DbDiagramr-OG.png"],
  },
};

const comparisonRows = [
  {
    feature: "How you create a diagram",
    dbdiagramr: "Paste a live PostgreSQL connection string",
    dbdiagram: "Write DBML schema code by hand",
  },
  {
    feature: "Time to first diagram",
    dbdiagramr: "Under 10 seconds",
    dbdiagram: "Minutes - write and debug DBML first",
  },
  {
    feature: "Shows your actual database",
    dbdiagramr: "Yes - reads live tables, columns, and foreign keys",
    dbdiagram: "No - diagram reflects the DBML you wrote",
  },
  {
    feature: "Signup required",
    dbdiagramr: "No",
    dbdiagram: "Free tier works without an account for one-off diagrams",
  },
  {
    feature: "Free plan",
    dbdiagramr: "Unlimited diagrams",
    dbdiagram: "Up to 10 diagrams, public by default",
  },
  {
    feature: "Private diagrams on free plan",
    dbdiagramr: "Yes - nothing is stored or published",
    dbdiagram: "No - free diagrams are public unless upgraded",
  },
  {
    feature: "Interactive hover-to-trace relationships",
    dbdiagramr: "Yes",
    dbdiagram: "No - static visualizations",
  },
  {
    feature: "Export options",
    dbdiagramr: "PNG and SVG",
    dbdiagram: "PNG, PDF, SVG",
  },
  {
    feature: "Paid plan",
    dbdiagramr: "Pro in development, no billing yet",
    dbdiagram: "$14/month",
  },
  {
    feature: "Best for",
    dbdiagramr: "Understanding a database that already exists",
    dbdiagram: "Designing a new schema from scratch",
  },
];

const faqs = [
  {
    q: "Is dbdiagramr a good dbdiagram.io alternative?",
    a: "It depends on your goal. If you need to understand or document a PostgreSQL database that already exists, dbdiagramr is faster - paste a connection string and see every table, column, and foreign key in under 10 seconds, with no schema code to write. If you are designing a brand-new schema by hand in DBML, dbdiagram.io is built for that.",
  },
  {
    q: "What is the main difference between dbdiagram.io and dbdiagramr?",
    a: "dbdiagram.io is a code-first tool where you describe your schema in DBML. dbdiagramr reads your live database directly - it introspects tables, columns, and foreign keys from a PostgreSQL connection string, so the diagram always matches reality.",
  },
  {
    q: "Is dbdiagramr free?",
    a: "Yes. Every diagramming feature is free, with no diagram limit and no account. A Pro plan for saved diagrams, version history, sharing and multiple schemas is in development; there is no price and no checkout yet.",
  },
  {
    q: "Are my diagrams private on dbdiagramr?",
    a: "Yes. Paste-SQL mode never leaves your browser. A live connection string is sent to the dbdiagramr backend for a single request and discarded; nothing is stored or published, so nothing you visualize is made public - unlike free plans that make diagrams public by default.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr#article",
      headline: "dbdiagram.io vs dbdiagramr - Which ER Diagram Tool?",
      description:
        "dbdiagram.io vs dbdiagramr compared: DBML code-first diagram design vs instant visualization from a live PostgreSQL connection string.",
      datePublished: "2026-08-04",
      dateModified: "2026-08-04",
      mainEntityOfPage: "https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
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
      "@id": "https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr#faq",
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
          name: "dbdiagram.io vs dbdiagramr",
          item: "https://www.dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
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
      <td className="px-4 py-3 text-sm text-muted">{row.dbdiagram}</td>
    </tr>
  );
}

export default function DbDiagramIoVsPage() {
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
            dbdiagram.io vs dbdiagramr
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Both tools turn database schemas into ER diagrams, but they work in
            fundamentally different ways. dbdiagram.io is a code-first editor
            where you design schemas in DBML. dbdiagramr visualizes a PostgreSQL
            database that already exists - paste a connection string and see
            your real schema in under 10 seconds.
          </p>
          <p className="mt-3 text-sm text-muted/70">
            Last updated: 2026-08-04
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
                  dbdiagram.io
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
                You have a live PostgreSQL database (Supabase, Neon, Railway)
                and want to understand its schema quickly.
              </li>
              <li>
                You want the diagram to reflect your actual database - not a
                hand-written model that can drift out of date.
              </li>
              <li>
                You want to trace foreign key relationships by hovering, with no
                signup and nothing published publicly.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            When to choose dbdiagram.io
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                You are designing a brand-new schema from scratch and want to
                write it as DBML code.
              </li>
              <li>
                You need to generate SQL DDL from your model rather than
                introspect an existing database.
              </li>
              <li>
                You want team collaboration and public diagram embedding as part
                of a paid plan.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            Feature-by-feature breakdown
          </h2>
          <div className="space-y-4">
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Diagram creation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagram.io:</strong> You write DBML code describing tables and relationships. The tool renders a diagram from your code. You need to learn DBML syntax first.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagramr:</strong> Paste SQL or a PostgreSQL connection string. The tool parses your schema and renders a diagram automatically. No new syntax to learn.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Keeping diagrams current</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagram.io:</strong> Your diagram is a DBML file you maintain. When your database changes, you must update the DBML manually or the diagram drifts out of date.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagramr:</strong> The diagram reads your live database. Change a migration, paste the same connection string again, up-to-date in seconds. No drift.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Pricing</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagram.io:</strong> Free tier limited to 10 diagrams, all public. Pro at $14/month removes limits and makes diagrams private.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagramr:</strong> Free with no diagram limit, all private. Pro (saved diagrams, version history, sharing, multiple schemas) is in development - no price and no billing yet.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Privacy</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagram.io:</strong> Free diagrams are public by default. Anyone with the link can view them.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                <strong>dbdiagramr:</strong> Nothing is stored or published. Paste-SQL is parsed in your browser; a live connection string is sent to our backend for one request and discarded.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16 rounded-[20px] bg-accent-soft p-8">
          <h2 className="text-2xl font-medium text-ink">
            Verdict
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            <strong>Use dbdiagram.io</strong> if you&apos;re designing a new schema from scratch and prefer writing code (DBML) to define your tables. It&apos;s excellent for planning and prototyping.
          </p>
          <p className="mt-3 text-lg leading-relaxed text-muted">
            <strong>Use dbdiagramr</strong> if you need to understand or document a PostgreSQL database that already exists. Paste a connection string, get an interactive diagram in seconds. No signup, no diagram limit, no drift.
          </p>
          <p className="mt-3 text-sm text-muted/70">
            For most developers working with existing databases, dbdiagramr is faster and more practical. For schema design from scratch, dbdiagram.io has the edge.
          </p>
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
