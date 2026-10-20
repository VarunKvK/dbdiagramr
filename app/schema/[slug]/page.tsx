import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAllSchemaEntries, getSchemaEntry, type SchemaEntry } from "@/data/schemas/registry";
import Footer from "@/app/sections/Footer";
import SchemaDiagram from "@/components/SchemaDiagram";
import SchemaCopyButtons from "@/components/SchemaCopyButtons";
import { schemaToMermaid, schemaToSql } from "@/lib/schemaExport";

export function generateStaticParams() {
  return getAllSchemaEntries().map((entry) => ({ slug: entry.slug }));
}

const ogImages: Record<string, string> = {
  supabase: "/Supabase-DbDiagramr-OG.png",
  nextauth: "/NextAuthJS-DbDiagramr-OG.png",
  laravel: "/Laravel-DbDiagramr-OG.png",
  django: "/Django-DbDiagramr-OG.png",
  "better-auth": "/BetterAuth-DbDiagramr-OG.png",
};

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getSchemaEntry(params.slug);
  if (!entry) return {};

  const url = `https://www.dbdiagramr.space/schema/${entry.slug}`;
  const image = ogImages[entry.slug];
  const ogImage = image
    ? [{ url: image, width: 1800, height: 945, alt: entry.title }]
    : undefined;

  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords.join(", "),
    alternates: { canonical: url },
    openGraph: {
      title: entry.title,
      description: entry.description,
      type: "website",
      url,
      images: ogImage,
    },
    twitter: {
      card: "summary_large_image",
      title: entry.title,
      description: entry.description,
      images: image ? [image] : undefined,
    },
  };
}

const relatedBlogBySchema: Record<string, { href: string; label: string }[]> = {
  supabase: [
    { href: "/blog/supabase-auth-schema-explained", label: "Supabase Auth Schema Explained" },
    { href: "/blog/postgres-connection-string-supabase-neon-railway", label: "PostgreSQL Connection String Guide" },
  ],
  nextauth: [
    { href: "/blog/nextauth-auth-schema-explained", label: "NextAuth Schema Explained" },
    { href: "/blog/visualize-postgres-schema-5-ways", label: "5 Ways to Visualize a Postgres Schema" },
  ],
  laravel: [
    { href: "/blog/laravel-database-schema-explained", label: "Laravel Tables Explained" },
    { href: "/blog/sql-to-schema-diagram-online", label: "SQL to Schema Diagram Online" },
  ],
  django: [
    { href: "/blog/django-auth-schema-explained", label: "Django Auth Tables Explained" },
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
  ],
  stripe: [
    { href: "/blog/stripe-billing-schema-postgres", label: "Stripe Billing Schema for PostgreSQL" },
    { href: "/blog/free-online-database-diagram-tool", label: "Free Online Database Diagram Tool" },
  ],
  ecommerce: [
    { href: "/blog/ecommerce-database-schema-postgres", label: "E-commerce Schema for PostgreSQL" },
    { href: "/blog/free-online-database-diagram-tool", label: "Free Online Database Diagram Tool" },
  ],
  "library-management-system": [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  "hospital-management-system": [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  rbac: [
    { href: "/blog/django-auth-schema-explained", label: "Django Auth Tables and Permissions" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  "multi-tenant-saas": [
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
  ],
  chinook: [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  pagila: [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  "dvd-rental": [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  northwind: [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
  ],
  "better-auth": [
    { href: "/blog/nextauth-auth-schema-explained", label: "NextAuth Schema Explained" },
    { href: "/blog/django-auth-schema-explained", label: "Django Auth Tables and Permissions" },
  ],
  "spring-batch": [
    { href: "/blog/database-schema-diagram-tool", label: "5 Database Schema Diagram Tools" },
    { href: "/blog/visualize-postgres-schema-5-ways", label: "5 Ways to Visualize a Postgres Schema" },
  ],
};

export default function SchemaPage({ params }: { params: { slug: string } }) {
  const entry = getSchemaEntry(params.slug);
  if (!entry) notFound();

  const allEntries = getAllSchemaEntries();
  const bySlug = new Map(allEntries.map((e) => [e.slug, e]));
  const topical: SchemaEntry[] = [];
  for (const slug of entry.related ?? []) {
    const e = bySlug.get(slug);
    if (e && e.slug !== entry.slug) topical.push(e);
  }
  const relatedSchemas =
    topical.length > 0
      ? topical.slice(0, 3)
      : allEntries.filter((e) => e.slug !== entry.slug).slice(0, 3);
  const relatedBlogs = relatedBlogBySchema[entry.slug] ?? [];
  const schemaSql = schemaToSql(entry.schema);
  const schemaMermaid = schemaToMermaid(entry.schema);

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <a
          href="/schema"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          ← All schemas
        </a>

        <div className="mb-10">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Schema Library
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            {entry.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            {entry.intro}
          </p>
          <p className="mt-3 text-sm text-muted/70">
            Last updated: {entry.lastUpdated}
          </p>
          {entry.source && (
            <p className="mt-1 text-sm text-muted/70">
              Source:{" "}
              {entry.source.url ? (
                <a
                  href={entry.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {entry.source.label}
                </a>
              ) : (
                entry.source.label
              )}
              {entry.source.license && (
                <>
                  {" "}· License:{" "}
                  {entry.source.licenseUrl ? (
                    <a
                      href={entry.source.licenseUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-accent hover:text-accent-hover"
                    >
                      {entry.source.license}
                    </a>
                  ) : (
                    entry.source.license
                  )}
                </>
              )}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-4">
            {entry.facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-[20px] border border-border bg-white px-5 py-4 shadow-sm"
              >
                <div className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
                  {fact.label}
                </div>
                <div className="mt-1 text-lg font-semibold text-ink">
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-pine px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
          </div>
          <div className="h-[540px] overflow-hidden">
            <SchemaDiagram schema={entry.schema} className="h-full w-full" />
          </div>
        </div>

        <SchemaCopyButtons
          sql={schemaSql}
          mermaid={schemaMermaid}
          slug={entry.slug}
        />

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Tables in the {entry.name} schema
          </h2>
          <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface text-left">
                  <th className="px-4 py-3 font-medium text-ink">Column</th>
                  <th className="px-4 py-3 font-medium text-ink">Type</th>
                  <th className="px-4 py-3 font-medium text-ink">Nullable</th>
                  <th className="px-4 py-3 font-medium text-ink">Key</th>
                </tr>
              </thead>
              <tbody>
                {entry.schema.tables.map((table) => (
                  <TableRows
                    key={table.name}
                    tableName={table.name}
                    rows={table.columns}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="grid gap-4">
            {entry.faqs.map((faq) => (
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

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            Explore more schemas
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {relatedSchemas.map((rel) => (
              <a
                key={rel.slug}
                href={`/schema/${rel.slug}`}
                className="block rounded-[20px] border border-border bg-white p-5 shadow-sm transition-colors hover:shadow-md"
              >
                <div className="font-medium text-ink">{rel.name}</div>
                <div className="mt-1 line-clamp-2 text-sm text-muted">
                  {rel.title}
                </div>
              </a>
            ))}
          </div>
          {relatedBlogs.length > 0 && (
            <div className="mt-4 rounded-[20px] border border-border bg-white p-5 shadow-sm">
              <div className="text-sm font-medium uppercase tracking-wider text-muted">
                Related guides
              </div>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
                {relatedBlogs.map((b) => (
                  <a
                    key={b.href}
                    href={b.href}
                    className="font-medium text-accent hover:text-accent-hover"
                  >
                    {b.label} →
                  </a>
                ))}
              </div>
            </div>
          )}
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

function TableRows({
  tableName,
  rows,
}: {
  tableName: string;
  rows: { name: string; type: string; nullable: string; isPrimaryKey: boolean }[];
}) {
  return (
    <>
      <tr className="border-b border-border bg-accent-soft/50">
        <td
          colSpan={4}
          className="px-4 py-3 font-semibold text-accent"
        >
          {tableName}
        </td>
      </tr>
      {rows.map((column) => (
        <tr key={`${tableName}-${column.name}`} className="border-b border-border last:border-b-0">
          <td className="px-4 py-2.5 font-mono text-ink">{column.name}</td>
          <td className="px-4 py-2.5 font-mono text-muted">{column.type}</td>
          <td className="px-4 py-2.5 text-muted">
            {column.nullable === "NO" ? "No" : "Yes"}
          </td>
          <td className="px-4 py-2.5">
            {column.isPrimaryKey ? (
              <span className="rounded-[20px] border border-accent bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                PK
              </span>
            ) : (
              <span className="text-xs text-muted">-</span>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}
