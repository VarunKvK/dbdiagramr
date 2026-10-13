import type { Metadata } from "next";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { generateDiagramSVG } from "@/lib/diagram";
import Footer from "@/app/sections/Footer";
import SchemaGrid from "@/app/schema/SchemaGrid";

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
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-24 lg:px-8">
        <div className="mb-12">
          <span className="inline-block rounded-[20px] border border-accent px-3 py-1 font-mono text-xs font-medium text-accent">
            Schema Library
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Popular database schema diagrams
          </h1>
          <p className="mt-4 max-w-4xl text-lg font-medium text-muted">
            Explore the real database schemas behind popular projects. Every
            diagram shows tables, columns, primary keys, and foreign key
            relationships, rendered from official migrations and docs.
          </p>
        </div>

        <SchemaGrid
          entries={entries.map((entry) => ({
            slug: entry.slug,
            name: entry.name,
            title: entry.title,
            tableCount: entry.schema.tables.length,
            svg: generateDiagramSVG(entry.schema),
          }))}
        />
      </div>
      <Footer />
    </main>
  );
}
