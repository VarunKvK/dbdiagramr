import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "dbdiagram.io vs dbdiagramr — Which ER Diagram Tool?",
  description:
    "dbdiagram.io vs dbdiagramr compared: DBML code-first diagram design vs instant visualization from a live PostgreSQL connection string. No signup required with dbdiagramr.",
  alternates: {
    canonical: "https://dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
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
    dbdiagram: "Minutes — write and debug DBML first",
  },
  {
    feature: "Shows your actual database",
    dbdiagramr: "Yes — reads live tables, columns, and foreign keys",
    dbdiagram: "No — diagram reflects the DBML you wrote",
  },
  {
    feature: "Signup required",
    dbdiagramr: "No",
    dbdiagram: "Free tier works without an account for one-off diagrams",
  },
  {
    feature: "Free plan",
    dbdiagramr: "5 diagrams per month",
    dbdiagram: "Up to 10 diagrams, public by default",
  },
  {
    feature: "Private diagrams on free plan",
    dbdiagramr: "Yes — nothing is stored or published",
    dbdiagram: "No — free diagrams are public unless upgraded",
  },
  {
    feature: "Interactive hover-to-trace relationships",
    dbdiagramr: "Yes",
    dbdiagram: "No — static visualizations",
  },
  {
    feature: "Export options",
    dbdiagramr: "PNG and SVG",
    dbdiagram: "PNG, PDF, SVG",
  },
  {
    feature: "Pro price",
    dbdiagramr: "$8/month",
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
    a: "It depends on your goal. If you need to understand or document a PostgreSQL database that already exists, dbdiagramr is faster — paste a connection string and see every table, column, and foreign key in under 10 seconds, with no schema code to write. If you are designing a brand-new schema by hand in DBML, dbdiagram.io is built for that.",
  },
  {
    q: "What is the main difference between dbdiagram.io and dbdiagramr?",
    a: "dbdiagram.io is a code-first tool where you describe your schema in DBML. dbdiagramr reads your live database directly — it introspects tables, columns, and foreign keys from a PostgreSQL connection string, so the diagram always matches reality.",
  },
  {
    q: "Is dbdiagramr free?",
    a: "Yes. dbdiagramr's free plan includes 5 diagrams per month. Pro costs $8/month for unlimited diagrams. No credit card is required to try the free plan.",
  },
  {
    q: "Are my diagrams private on dbdiagramr?",
    a: "Yes. dbdiagramr never stores connection strings or publishes diagrams. Your schema is introspected and discarded immediately, so nothing you visualize is made public — unlike free plans that make diagrams public by default.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://dbdiagramr.space/dbdiagram-io-vs-dbdiagramr#article",
      headline: "dbdiagram.io vs dbdiagramr — Which ER Diagram Tool?",
      description:
        "dbdiagram.io vs dbdiagramr compared: DBML code-first diagram design vs instant visualization from a live PostgreSQL connection string.",
      datePublished: "2026-08-04",
      dateModified: "2026-08-04",
      mainEntityOfPage: "https://dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
      author: {
        "@type": "Person",
        name: "Varun Krishnan",
        url: "https://github.com/VarunKvK",
      },
      publisher: {
        "@type": "Organization",
        name: "dbdiagramr",
        url: "https://dbdiagramr.space",
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://dbdiagramr.space/dbdiagram-io-vs-dbdiagramr#faq",
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
          item: "https://dbdiagramr.space",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Alternatives",
          item: "https://dbdiagramr.space/alternatives",
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "dbdiagram.io vs dbdiagramr",
          item: "https://dbdiagramr.space/dbdiagram-io-vs-dbdiagramr",
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
      <div className="mx-auto max-w-5xl px-4 py-16">
        <a
          href="/alternatives"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
        >
          ← All alternatives
        </a>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Comparison
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            dbdiagram.io vs dbdiagramr
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-muted">
            Both tools turn database schemas into ER diagrams, but they work in
            fundamentally different ways. dbdiagram.io is a code-first editor
            where you design schemas in DBML. dbdiagramr visualizes a PostgreSQL
            database that already exists — paste a connection string and see
            your real schema in under 10 seconds.
          </p>
          <p className="mt-3 text-sm text-muted/70">
            Last updated: 2026-08-04
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-[#fafafa] text-left">
                <th className="px-4 py-3 text-xs font-medium uppercase tracking-wider text-muted">
                  Feature
                </th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-indigo-600">
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
          <h2 className="mb-4 text-2xl font-medium text-ink">
            When to choose dbdiagramr
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                You have a live PostgreSQL database (Supabase, Neon, Railway)
                and want to understand its schema quickly.
              </li>
              <li>
                You want the diagram to reflect your actual database — not a
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
          <h2 className="mb-4 text-2xl font-medium text-ink">
            When to choose dbdiagram.io
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
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
            Visualize your own database
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram of your own schema in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free →
          </a>
        </section>
      </div>
    </main>
  );
}
