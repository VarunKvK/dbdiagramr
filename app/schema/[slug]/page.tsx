import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { getAllSchemaEntries, getSchemaEntry } from "@/data/schemas/registry";
import Footer from "@/app/sections/Footer";
import AuthorByline from "@/components/AuthorByline";
import { AUTHOR } from "@/data/authors";
import LazySchemaDiagram from "@/components/LazySchemaDiagram";
import SchemaCopyButtons from "@/components/SchemaCopyButtons";
import SchemaColumnsTable from "@/components/schema/SchemaColumnsTable";
import SchemaRelationships from "@/components/schema/SchemaRelationships";
import SchemaEmbed from "@/components/schema/SchemaEmbed";
import CommonQueries from "@/components/schema/CommonQueries";
import { getRelatedSchemas } from "@/lib/schemaRelations";
import { schemaToMermaid, schemaToSql } from "@/lib/schemaExport";
import { schemaDiagramSize } from "@/lib/schemaImage";
import { organizationNode, personNode, PERSON_URL } from "@/lib/structuredData";
import FaqAccordion from "@/app/sections/FaqAccordion";

export function generateStaticParams() {
  return getAllSchemaEntries().map((entry) => ({ slug: entry.slug }));
}

function schemaImagePath(slug: string, extension: "svg" | "png"): string {
  return `/schemas/${slug}-er-diagram.${extension}`;
}

function schemaOgPath(slug: string): string {
  return `/schemas/${slug}-og.png`;
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const entry = getSchemaEntry(params.slug);
  if (!entry) return {};

  const url = `https://www.dbdiagramr.space/schema/${entry.slug}`;
  const image = `https://www.dbdiagramr.space${schemaOgPath(entry.slug)}`;
  const ogImage = [{ url: image, width: 1200, height: 630, alt: entry.title }];

  return {
    title: entry.title,
    description: entry.description,
    keywords: entry.keywords.join(", "),
    authors: [{ name: AUTHOR.name, url: PERSON_URL }],
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
      images: [image],
    },
  };
}

const relatedBlogBySchema: Record<string, { href: string; label: string }[]> = {
  supabase: [
    { href: "/supabase-er-diagram", label: "Supabase Schema Diagram Tool" },
    { href: "/blog/postgres-connection-string-supabase-neon-railway", label: "PostgreSQL Connection String Guide" },
  ],
  nextauth: [
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
  ],
  laravel: [
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
  ],
  django: [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
  ],
  stripe: [
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
  ],
  ecommerce: [
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
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
    { href: "/schema/django", label: "Django Auth Schema" },
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
    { href: "/schema/nextauth", label: "NextAuth Schema" },
    { href: "/schema/django", label: "Django Auth Schema" },
  ],
  "spring-batch": [
    { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
    { href: "/blog/database-schema-diagram-tool", label: "Database Schema Diagram Tools" },
  ],
};

export default function SchemaPage({ params }: { params: { slug: string } }) {
  const entry = getSchemaEntry(params.slug);
  if (!entry) notFound();

  const allEntries = getAllSchemaEntries();
  const relatedSchemas = getRelatedSchemas(entry, allEntries);
  const relatedBlogs = relatedBlogBySchema[entry.slug] ?? [];
  const schemaSql = schemaToSql(entry.schema);
  const schemaMermaid = schemaToMermaid(entry.schema);
  const diagramSize = schemaDiagramSize(entry.schema);

  const url = `https://www.dbdiagramr.space/schema/${entry.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TechArticle",
        "@id": `${url}#article`,
        headline: entry.title,
        description: entry.description,
        datePublished: entry.published,
        dateModified: entry.lastUpdated,
        image: `https://www.dbdiagramr.space${schemaOgPath(entry.slug)}`,
        mainEntityOfPage: url,
        author: personNode(),
        publisher: organizationNode(),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: entry.faqs.map((faq) => ({
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
            name: "Schema diagram library",
            item: "https://www.dbdiagramr.space/schema",
          },
          {
            "@type": "ListItem",
            position: 3,
            name: entry.name,
            item: url,
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
          <AuthorByline
            published={entry.published}
            updated={entry.lastUpdated}
            verb="Written by"
          />
          {entry.source && (
            <p className="mt-1 text-sm text-muted">
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
          {entry.lineage && (
            <p className="mt-1 text-sm text-muted">
              Lineage: {entry.lineage.text}{" "}
              <a
                href={entry.lineage.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:text-accent-hover"
              >
                {entry.lineage.sourceLabel}
              </a>
              {" "}· License:{" "}
              <a
                href={entry.lineage.licenseUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-accent hover:text-accent-hover"
              >
                {entry.lineage.license}
              </a>
              .
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
          {entry.scopeNote && (
            <div className="mt-6 rounded-[20px] border border-border bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-ink">{entry.scopeNote.text}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {entry.scopeNote.omitted}{" "}
                <a
                  href={entry.scopeNote.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  {entry.scopeNote.sourceLabel}
                </a>
                .
              </p>
            </div>
          )}
          {entry.slug === "supabase" && (
            <div className="mt-6 rounded-[20px] border border-accent bg-accent-soft p-5">
              <p className="text-sm leading-relaxed text-ink">
                This page documents Supabase&apos;s built-in{" "}
                <code className="font-mono">auth</code> schema, not your
                app&apos;s public tables. To diagram your own Supabase project
                and see Row Level Security status, use the{" "}
                <a
                  href="/supabase-er-diagram"
                  className="font-medium text-accent hover:text-accent-hover"
                >
                  Supabase ER diagram tool
                </a>
                .
              </p>
            </div>
          )}
        </div>

        <section className="mt-10">
          <div
            className="overflow-x-auto rounded-[20px] border border-border bg-white shadow-sm"
            tabIndex={0}
            role="region"
            aria-label={`${entry.name} schema diagram, scroll horizontally to see every table`}
          >
            <a
              href={schemaImagePath(entry.slug, "svg")}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-max"
            >
              <Image
                src={schemaImagePath(entry.slug, "svg")}
                alt={`${entry.name} database schema diagram showing every table, column, and foreign key`}
                width={diagramSize.width}
                height={diagramSize.height}
                unoptimized
                className="block h-auto max-w-none"
              />
            </a>
          </div>
          <p className="mt-3 text-sm text-muted">
            Scroll horizontally to see the full diagram. Click it to open at
            full size.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <a
              href={schemaImagePath(entry.slug, "svg")}
              download={`${entry.slug}-er-diagram.svg`}
              className="rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft"
            >
              Download SVG
            </a>
            <a
              href={schemaImagePath(entry.slug, "png")}
              download={`${entry.slug}-er-diagram.png`}
              className="rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft"
            >
              Download 2x PNG
            </a>
          </div>
        </section>

        <div className="mt-10 overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-pine px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
          </div>
          <div className="h-[540px] overflow-hidden">
            <LazySchemaDiagram schema={entry.schema} className="h-full w-full" />
          </div>
        </div>

        <SchemaCopyButtons
          sql={schemaSql}
          mermaid={schemaMermaid}
          slug={entry.slug}
        />

        {entry.schema.ddlNotes?.length ? (
          <section className="mt-3 max-w-3xl rounded-[10px] border border-border bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">SQL export notes</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-muted">
              {entry.schema.ddlNotes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <SchemaEmbed entry={entry} />

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Tables in the {entry.name} schema
          </h2>
          <SchemaColumnsTable schema={entry.schema} />
        </section>

        <SchemaRelationships
          schema={entry.schema}
          note={entry.relationshipNote}
        />

        <CommonQueries queries={entry.queries ?? []} />

        {entry.guide && (
          <section className="mt-16 max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
              {entry.guide.title}
            </h2>
            <div className="space-y-4 leading-relaxed text-muted">
              {entry.guide.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
            {entry.guide.sql && (
              <div className="mt-6 overflow-hidden rounded-[20px] border border-border bg-ink shadow-sm">
                <pre className="overflow-x-auto p-5 font-mono text-xs leading-relaxed text-white/80">
                  <code>{entry.guide.sql}</code>
                </pre>
              </div>
            )}
            {entry.guide.sqlNote && (
              <p className="mt-3 text-sm text-muted">
                {entry.guide.sqlNote}
              </p>
            )}
          </section>
        )}

        {entry.sections?.map((section) => (
          <section key={section.title} className="mt-16 max-w-3xl">
            <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
              {section.title}
            </h2>
            <div
              className="max-w-none leading-relaxed text-muted [&_h3]:mt-6 [&_h3]:text-lg [&_h3]:font-medium [&_h3]:text-ink [&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-muted [&_a]:text-accent [&_a]:underline [&_a]:decoration-accent/40 hover:[&_a]:text-accent-hover [&_ul]:mt-4 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mt-1.5 [&_strong]:font-semibold [&_strong]:text-ink [&_table]:mt-6 [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm [&_th]:border [&_th]:border-border [&_th]:bg-surface [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-medium [&_th]:text-ink [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:text-muted [&_pre]:mt-6 [&_pre]:overflow-x-auto [&_pre]:rounded-[10px] [&_pre]:bg-ink [&_pre]:p-4 [&_pre]:text-sm [&_pre]:text-white/85 [&_code]:rounded [&_code]:bg-black/5 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:text-ink [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-white/85"
              dangerouslySetInnerHTML={{ __html: section.body }}
            />
          </section>
        ))}

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <FaqAccordion items={entry.faqs} variant="card" />
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            Related schema diagrams
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
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
