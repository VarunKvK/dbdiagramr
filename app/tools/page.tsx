import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";

export const metadata: Metadata = {
  title: "Free Database Tools — ER Diagrams, Schema Analyzer & Generators",
  description:
    "Every free dbdiagramr tool in one place: PostgreSQL ER diagrams, Supabase visualizer, schema health analyzer, and SQL-to-diagram generators. No signup required.",
  keywords:
    "free database tools, postgres tools, er diagram tool, schema analyzer, sql to diagram, supabase schema diagram",
  alternates: {
    canonical: "https://www.dbdiagramr.space/tools",
  },
};

const tools = [
  {
    href: "/postgres-er-diagram",
    name: "PostgreSQL ER Diagram",
    description:
      "Paste a connection string and see your live PostgreSQL schema as an interactive ER diagram in under 10 seconds.",
    tags: ["ER diagram", "Live database", "Most popular"],
  },
  {
    href: "/database-schema-analyzer",
    name: "Schema Health Analyzer",
    description:
      "Paste SQL and get a graded schema health report: missing keys, unindexed foreign keys, naming drift — each with a fix.",
    tags: ["Health check", "Graded report", "New"],
  },
  {
    href: "/supabase-schema-diagram",
    name: "Supabase Schema Diagram",
    description:
      "Visualize your Supabase database — auth, storage, and your own tables with every foreign key drawn.",
    tags: ["Supabase", "ER diagram"],
  },
  {
    href: "/free-schema-generator",
    name: "Free Schema Generator",
    description:
      "Turn any PostgreSQL SQL dump into a clean schema diagram. Free, instant, no account needed.",
    tags: ["SQL to diagram", "Free"],
  },
  {
    href: "/database-diagram-online",
    name: "Database Diagram Online",
    description:
      "Create a database diagram online without installing anything. Paste SQL, drag tables, export PNG or SVG.",
    tags: ["Online", "No install"],
  },
  {
    href: "/postgres-schema-visualizer",
    name: "Schema Visualizer",
    description:
      "Explore your PostgreSQL structure at a glance — tables, columns, types, and relationships in one view.",
    tags: ["Visualizer", "PostgreSQL"],
  },
  {
    href: "/sql-formatter",
    name: "SQL Formatter",
    description:
      "Paste messy SQL and get clean, consistently formatted PostgreSQL. Keyword casing, smart indenting, copy or download.",
    tags: ["Formatter", "PostgreSQL", "New"],
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": "https://www.dbdiagramr.space/tools",
      name: "dbdiagramr Free Database Tools",
      description:
        "Free database tools: PostgreSQL ER diagrams, schema health analyzer, Supabase visualizer, and SQL-to-diagram generators.",
      url: "https://www.dbdiagramr.space/tools",
      mainEntity: {
        "@type": "ItemList",
        itemListElement: tools.map((tool, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: tool.name,
          item: `https://www.dbdiagramr.space${tool.href}`,
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
          item: "https://www.dbdiagramr.space",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Tools",
          item: "https://www.dbdiagramr.space/tools",
        },
      ],
    },
  ],
};

export default function ToolsPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Free tools
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            Free database tools
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Every dbdiagramr tool in one place. Pick what you need — diagrams,
            health checks, generators. All free, no signup, private by default.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {tools.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl bg-white p-8 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="text-2xl font-medium text-ink group-hover:text-indigo-600">
                {tool.name}
              </h2>
              <p className="mt-3 leading-relaxed text-muted">
                {tool.description}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {tool.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[#fafafa] px-3 py-1 text-xs font-medium text-muted ring-1 ring-black/5"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-500">
                Open tool →
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
            diagram in under 10 seconds. No signup, no setup.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free →
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
