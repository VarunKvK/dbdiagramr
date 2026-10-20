import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";

export const metadata: Metadata = {
  title: { absolute: "dbdiagramr Alternatives: ER Diagram Tools Compared (2026)" },
  description:
    "Compare dbdiagramr to dbdiagram.io, DrawSQL, and ChartDB. Paste a PostgreSQL connection string and get an interactive ER diagram in under 10 seconds - no signup.",
  alternates: {
    canonical: "https://www.dbdiagramr.space/alternatives",
  },
  openGraph: {
    title: "dbdiagramr Alternatives: ER Diagram Tools Compared (2026)",
    description:
      "Compare dbdiagramr to dbdiagram.io, DrawSQL, and ChartDB side by side.",
    type: "website",
    url: "https://www.dbdiagramr.space/alternatives",
    images: [{ url: "/DbDiagramr-OG.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "dbdiagramr Alternatives: ER Diagram Tools Compared",
    description:
      "Compare dbdiagramr to dbdiagram.io, DrawSQL, and ChartDB side by side.",
    images: ["/DbDiagramr-OG.png"],
  },
};

const alternatives = [
  {
    slug: "dbdiagram-io-vs-dbdiagramr",
    name: "dbdiagram.io",
    headline: "dbdiagram.io vs dbdiagramr",
    summary:
      "dbdiagram.io is a code-first diagramming tool for designing new schemas in DBML. dbdiagramr skips the schema code entirely - paste a live connection string and see your actual database.",
    tags: ["DBML code", "Design-first", "10 free diagrams"],
  },
  {
    slug: "drawsql-vs-dbdiagramr",
    name: "DrawSQL",
    headline: "DrawSQL vs dbdiagramr",
    summary:
      "DrawSQL is a collaborative visual editor for planning schemas with teams. dbdiagramr is a fast, no-signup way to visualize a PostgreSQL database that already exists.",
    tags: ["Team collaboration", "Visual editor", "Free public diagrams"],
  },
  {
    slug: "chartdb-alternative",
    name: "ChartDB",
    headline: "ChartDB vs dbdiagramr",
    summary:
      "ChartDB imports a schema by running a query and pasting the JSON. dbdiagramr connects to PostgreSQL directly, so the live diagram appears in seconds without writing a query.",
    tags: ["Open source", "Multi-database", "Query-based import"],
  },
];

const comparisonRows = [
  {
    feature: "How you create a diagram",
    dbdiagram: "Write DBML schema code by hand",
    drawsql: "Paste SQL or draw tables on a canvas",
    chartdb: "Run a metadata query and paste the JSON",
    dbdiagramr: "Paste a live PostgreSQL connection string",
  },
  {
    feature: "Shows the live database",
    dbdiagram: "No - renders the DBML you wrote",
    drawsql: "Partial - renders what you import or draw",
    chartdb: "No - works from query output",
    dbdiagramr: "Yes - tables, columns, and foreign keys",
  },
  {
    feature: "Databases supported",
    dbdiagram: "DBML, database-agnostic",
    drawsql: "MySQL, PostgreSQL, SQL Server, MariaDB",
    chartdb: "PostgreSQL, MySQL, SQL Server, SQLite",
    dbdiagramr: "PostgreSQL",
  },
  {
    feature: "Free plan",
    dbdiagram: "Limited diagrams, public by default",
    drawsql: "Public diagrams free; private from $19/month",
    chartdb: "Free editor tier; paid team plans",
    dbdiagramr: "Unlimited diagrams",
  },
  {
    feature: "Signup required",
    dbdiagram: "Not for a one-off diagram",
    drawsql: "No for the free canvas",
    chartdb: "No for the free editor",
    dbdiagramr: "No",
  },
  {
    feature: "Export",
    dbdiagram: "PDF and PNG on paid plans",
    drawsql: "SQL, JSON, PNG",
    chartdb: "SQL",
    dbdiagramr: "SVG and PNG",
  },
  {
    feature: "Best for",
    dbdiagram: "Designing a new schema in code",
    drawsql: "Team schema design and collaboration",
    chartdb: "Editing schemas across several databases",
    dbdiagramr: "Understanding a PostgreSQL database that exists",
  },
];

const faqs = [
  {
    q: "Is dbdiagramr a good dbdiagram.io alternative?",
    a: "Yes, if you want to understand or document a PostgreSQL database that already exists. Paste a connection string and dbdiagramr renders the live schema in under 10 seconds. If you are designing a new schema in DBML, dbdiagram.io is the better fit because DBML is its native input.",
  },
  {
    q: "Can I import a dbdiagram.io or DrawSQL diagram into dbdiagramr?",
    a: "Not directly. Deploy the schema to a PostgreSQL database first, then connect dbdiagramr to that database. dbdiagramr reads the real tables and foreign keys rather than a diagram file.",
  },
  {
    q: "Does dbdiagramr support MySQL or SQL Server?",
    a: "Not yet. dbdiagramr is PostgreSQL only. DrawSQL, ChartDB, and dbdiagram.io are better choices if you need MySQL, SQL Server, or a database-agnostic design file.",
  },
  {
    q: "Is DrawSQL worth the money?",
    a: "If you need private team diagrams, collaboration, and support for several database engines, yes. If you only need to see an existing PostgreSQL schema, dbdiagramr does that for free with no diagram limit.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.dbdiagramr.space/alternatives",
      name: "dbdiagramr Alternatives",
      description:
        "Compare dbdiagramr to dbdiagram.io, DrawSQL, and ChartDB for generating database diagrams from PostgreSQL.",
      url: "https://www.dbdiagramr.space/alternatives",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: alternatives.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: a.headline,
          item: `https://www.dbdiagramr.space/${a.slug}`,
        })),
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.dbdiagramr.space/alternatives#faq",
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
      ],
    },
  ],
};

export default function AlternativesPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Alternatives
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            How dbdiagramr compares to other diagram tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Honest, head-to-head comparisons of dbdiagramr against the most
            popular database diagram tools. If you are looking for a dbdiagram.io
            alternative or a DrawSQL alternative, start here.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {alternatives.map((alt) => (
            <Link
              key={alt.slug}
              href={`/${alt.slug}`}
              className="group rounded-[20px] border border-border bg-white p-8 shadow-sm transition-colors hover:shadow-md"
            >
              <h2 className="text-2xl font-medium text-ink group-hover:text-accent">
                {alt.headline}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{alt.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {alt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-surface px-3 py-1 text-xs font-medium text-muted ring-1 ring-black/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 text-sm font-medium text-accent transition-colors group-hover:text-accent-hover">
                Read the comparison →
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Feature comparison
          </h2>
          <p className="mt-3 max-w-3xl leading-relaxed text-muted">
            The short version: design-first tools start with a file you
            maintain. dbdiagramr starts with the database and reads what is
            actually deployed.
          </p>
          <div className="mt-6 overflow-x-auto rounded-[20px] border border-border bg-white shadow-sm">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr>
                  <th className="border-b border-border bg-surface px-4 py-3 font-medium text-ink">Feature</th>
                  <th className="border-b border-border bg-surface px-4 py-3 font-medium text-ink">dbdiagram.io</th>
                  <th className="border-b border-border bg-surface px-4 py-3 font-medium text-ink">DrawSQL</th>
                  <th className="border-b border-border bg-surface px-4 py-3 font-medium text-ink">ChartDB</th>
                  <th className="border-b border-border bg-surface px-4 py-3 font-medium text-ink">dbdiagramr</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="align-top">
                    <th className="border-b border-border px-4 py-3 text-left font-medium text-ink">
                      {row.feature}
                    </th>
                    <td className="border-b border-border px-4 py-3 text-muted">{row.dbdiagram}</td>
                    <td className="border-b border-border px-4 py-3 text-muted">{row.drawsql}</td>
                    <td className="border-b border-border px-4 py-3 text-muted">{row.chartdb}</td>
                    <td className="border-b border-border px-4 py-3 font-medium text-ink">{row.dbdiagramr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Which tool should you use?
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Understanding a live PostgreSQL database</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Use dbdiagramr. Paste a read-only connection string and read the
                real tables, columns, and foreign keys in under 10 seconds.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Designing a schema from scratch</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Use dbdiagram.io. Writing DBML first is a good way to plan a
                schema before it exists.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Collaborating on a design</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Use DrawSQL or dbdiagram.io if you need private team diagrams,
                comments, and multiplayer editing.
              </p>
            </div>
            <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
              <h3 className="font-medium text-ink">Working across several databases</h3>
              <p className="mt-2 leading-relaxed text-muted">
                Use ChartDB, DrawSQL, or dbdiagram.io. dbdiagramr is
                PostgreSQL-only by design.
              </p>
            </div>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
                <h3 className="text-lg font-medium text-ink">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Just want to see your database?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste a PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup, no schema code to write.
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
