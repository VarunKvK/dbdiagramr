import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "dbdiagramr Alternatives — Compare ER Diagram Tools",
  description:
    "See how dbdiagramr compares to dbdiagram.io, DrawSQL, and other database diagram tools. Paste a PostgreSQL connection string and get an interactive ER diagram in under 10 seconds — no signup required.",
  alternates: {
    canonical: "https://dbdiagramr.space/alternatives",
  },
};

const alternatives = [
  {
    slug: "dbdiagram-io-vs-dbdiagramr",
    name: "dbdiagram.io",
    headline: "dbdiagram.io vs dbdiagramr",
    summary:
      "dbdiagram.io is a code-first diagramming tool for designing new schemas in DBML. dbdiagramr skips the schema code entirely — paste a live connection string and see your actual database.",
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
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://dbdiagramr.space/alternatives",
      name: "dbdiagramr Alternatives",
      description:
        "Compare dbdiagramr to dbdiagram.io and DrawSQL for generating database diagrams from PostgreSQL.",
      url: "https://dbdiagramr.space/alternatives",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: alternatives.map((a, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: a.headline,
          url: `https://dbdiagramr.space/${a.slug}`,
        })),
      },
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
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Alternatives
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
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
              className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-2xl font-medium text-ink group-hover:text-indigo-600">
                {alt.headline}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">{alt.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {alt.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#fafafa] px-3 py-1 text-xs font-medium text-muted ring-1 ring-black/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-500">
                Read the comparison →
              </div>
            </Link>
          ))}
        </div>

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Just want to see your database?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste a PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup, no schema code to write.
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
