import type { Metadata } from "next";
import Link from "next/link";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { generateDiagramSVG } from "@/lib/diagram";

export const metadata: Metadata = {
  title: "Popular Database Schema Diagrams — Free ER Diagrams",
  description:
    "Browse free interactive ER diagrams of popular PostgreSQL database schemas: Supabase auth, NextAuth.js, Laravel, and Django. See every table, column, and foreign key relationship.",
  alternates: {
    canonical: "https://dbdiagramr.space/schema",
  },
};

export default function SchemaHubPage() {
  const entries = getAllSchemaEntries();

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-12 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Schema Library
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            Popular database schema diagrams
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted">
            Explore the real database schemas behind popular projects. Every
            diagram shows tables, columns, primary keys, and foreign key
            relationships — rendered from official migrations and docs.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {entries.map((entry) => {
            const svg = generateDiagramSVG(entry.schema);
            return (
              <Link
                key={entry.slug}
                href={`/schema/${entry.slug}`}
                className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="border-b border-border bg-[#fafafa] px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-medium text-ink">
                      {entry.name}
                    </h2>
                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
                      {entry.schema.tables.length} tables
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{entry.title}</p>
                </div>
                <div
                  className="relative h-56 overflow-hidden bg-[#1a1a1a]"
                  dangerouslySetInnerHTML={{ __html: svg }}
                />
                <div className="border-t border-border px-6 py-4 text-sm font-medium text-indigo-600 transition-colors group-hover:text-indigo-500">
                  View schema diagram →
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
