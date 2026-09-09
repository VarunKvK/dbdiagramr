import type { Metadata } from "next";
import Link from "next/link";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { generateDiagramSVG } from "@/lib/diagram";
import Footer from "@/app/sections/Footer";

export const metadata: Metadata = {
  title: "Popular Database Schema Diagrams & ERDs",
  description:
    "Browse free interactive ER diagrams of popular PostgreSQL schemas: Supabase, NextAuth.js, Laravel, Django. Every table, column, and foreign key.",
  alternates: {
    canonical: "https://www.dbdiagramr.space/schema",
  },
};

export default function SchemaHubPage() {
  const entries = getAllSchemaEntries();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": "https://www.dbdiagramr.space/schema",
        name: "Popular Database Schema Diagrams",
        description:
          "Free interactive ER diagrams of popular PostgreSQL database schemas: Supabase auth, NextAuth.js, Laravel, and Django.",
        url: "https://www.dbdiagramr.space/schema",
        mainEntity: {
          "@type": "ItemList",
          itemListElement: entries.map((entry, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: entry.name,
            item: `https://www.dbdiagramr.space/schema/${entry.slug}`,
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
            name: "Database Schema Diagrams",
            item: "https://www.dbdiagramr.space/schema",
          },
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-[30rem] lg:px-8">
        <div className="mb-12">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Schema Library
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            Popular database schema diagrams
          </h1>
          <p className="mt-4 max-w-4xl text-lg text-muted">
            Explore the real database schemas behind popular projects. Every
            diagram shows tables, columns, primary keys, and foreign key
            relationships - rendered from official migrations and docs.
          </p>
        </div>

        <div className="grid gap-10 md:grid-cols-2">
          {entries.map((entry) => {
            const svg = generateDiagramSVG(entry.schema);
            return (
              <Link
                key={entry.slug}
                href={`/schema/${entry.slug}`}
                className="group bg-white p-4 rounded-2xl transition-all hover:-translate-y-1 hover:shadow-sm"
              >
                <div className="relative min-h-[400px] overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-sm ring-1 ring-black/5 transition-all group-hover:-translate-y-1 group-hover:shadow-lg">
                  <div
                    className="absolute inset-0"
                    dangerouslySetInnerHTML={{ __html: svg }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 transition-opacity group-hover:opacity-100">
                    <h2 className="text-4xl font-medium text-white">
                      {entry.name}
                      <span className="text-indigo-500">.</span>
                    </h2>
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-2xl font-medium text-ink">
                    {entry.name}
                  </h3>
                  <p className="mt-1 text-muted">{entry.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <Footer />
    </main>
  );
}
