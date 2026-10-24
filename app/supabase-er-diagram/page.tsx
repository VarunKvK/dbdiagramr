import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { SUPABASE_SQL } from "@/lib/sql/pgDumpSamples";
import FaqAccordion from "@/app/sections/FaqAccordion";
import { toIsoDateTime } from "@/lib/dates";
import { organizationRef } from "@/lib/structuredData";

const schema = parseSqlToSchema(SUPABASE_SQL).schema;

export const metadata: Metadata = {
  title: "Supabase Schema Diagram | ERD From Your Live Database",
  description:
    "Connect Supabase and see public, auth, and storage tables as an interactive ER diagram in seconds. Free, no signup, no diagram limit.",
  keywords:
    "supabase schema diagram, supabase er diagram, supabase erd, supabase database diagram, visualize supabase schema, supabase auth schema",
  alternates: {
    canonical: "https://www.dbdiagramr.space/supabase-er-diagram",
  },
  openGraph: {
    title: "Supabase Schema Diagram | ERD From Your Live Database",
    description:
      "Connect your Supabase Postgres database and see tables, columns, and foreign keys as an interactive ER diagram in seconds.",
    type: "website",
    url: "https://www.dbdiagramr.space/supabase-er-diagram",
  },
  twitter: {
    card: "summary_large_image",
    title: "Supabase Schema Diagram | ERD From Your Live Database",
    description:
      "Connect your Supabase database and get an interactive ER diagram in under 10 seconds.",
  },
};

const faqs = [
  {
    q: "How do I create a schema diagram for Supabase?",
    a: "In the Supabase dashboard open Connect, copy the Session pooler or Transaction pooler connection string, and paste it into dbdiagramr. The diagram reads your public, auth, and storage tables from pg_catalog and renders them in under 10 seconds. No metadata query to write and no JSON to paste.",
  },
  {
    q: "Does it show the Supabase auth schema?",
    a: "Yes. dbdiagramr reads public, auth, and storage, so auth.users, auth.sessions, auth.identities, and your own tables appear together. Tables outside public are prefixed with their schema, for example auth.users, so you can see how a public profiles table points back to auth users.",
  },
  {
    q: "Which connection string should I use?",
    a: "Use a Supabase pooler connection string from Dashboard -> Connect. The direct db.xxx.supabase.co host on port 5432 uses IPv6 by default; IPv4 needs the paid IPv4 add-on, which is why some networks fail with ENOTFOUND or a timeout. The Session pooler works over IPv4 and is the safest default; the Transaction pooler on port 6543 also works.",
  },
  {
    q: "Is my connection string stored?",
    a: "No. The connection string is used for a single request to read schema metadata from pg_catalog and is then discarded. dbdiagramr does not store it, does not read row data, and does not publish your diagram.",
  },
  {
    q: "Can I check Row Level Security at the same time?",
    a: "Use the free Supabase RLS Check with the same read-only connection string. It lists public tables with RLS off, RLS enabled but no policies, or RLS on with policies to review. The diagram shows structure; the RLS check shows exposure.",
  },
  {
    q: "Is dbdiagramr free for Supabase projects?",
    a: "Yes. Every diagramming feature is free, with no diagram limit and no account. A Pro plan for saved diagrams, version history, sharing and multiple schemas is in development; there is no price and no checkout yet.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/supabase-er-diagram#article",
      headline: "Supabase Schema Diagram | ERD From Your Live Database",
      description:
        "Connect a Supabase Postgres database and render public, auth, and storage tables as an interactive ER diagram in seconds.",
      datePublished: toIsoDateTime("2026-10-20"),
      dateModified: toIsoDateTime("2026-10-20"),
      mainEntityOfPage: "https://www.dbdiagramr.space/supabase-er-diagram",
      author: {
        "@type": "Person",
        name: "Varun Krishnan",
        url: "https://github.com/VarunKvK",
      },
      publisher: organizationRef(),
    },
    {
      "@type": "HowTo",
      "@id": "https://www.dbdiagramr.space/supabase-er-diagram#howto",
      name: "How to generate a Supabase ER diagram",
      totalTime: "PT1M",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Copy the pooler connection string",
          text: "In the Supabase dashboard, open Connect and copy the Session pooler or Transaction pooler connection string.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Paste it into dbdiagramr",
          text: "Open dbdiagramr, paste the connection string, and connect with a read-only role.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Read the diagram",
          text: "The public, auth, and storage tables render as an interactive ER diagram. Search tables, trace foreign keys, and export SVG or PNG.",
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.dbdiagramr.space/supabase-er-diagram#faq",
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
          name: "Supabase ER Diagram",
          item: "https://www.dbdiagramr.space/supabase-er-diagram",
        },
      ],
    },
  ],
};

export default function SupabaseErDiagramPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <Link
          href="/visualize"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-accent transition-colors hover:text-accent-hover"
        >
          &larr; Try the tool
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-[20px] border border-accent bg-accent-soft px-3 py-1 text-xs font-medium text-accent">
            Supabase
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            Supabase Schema Diagram
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Connect your Supabase database and see public, auth, and storage
            tables as an interactive ER diagram in under 10 seconds. Paste one
            pooler connection string; no metadata query, no JSON, no signup.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["public + auth + storage", "Live foreign keys", "Export SVG/PNG"].map(
              (label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-4 py-1.5 text-xs font-medium text-ink"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <p className="text-accent">{label}</p>
                </span>
              )
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-pine px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            <span className="ml-2 text-xs text-white/50">
              Supabase auth schema, 7 tables
            </span>
          </div>
          <div className="h-[540px] overflow-hidden">
            <SchemaDiagram schema={schema} className="h-full w-full" />
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            Connect a Supabase project in three steps
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                step: "1",
                title: "Copy the pooler string",
                body: "Supabase dashboard -> Connect -> Session pooler. The direct db.xxx.supabase.co host uses IPv6 by default; IPv4 needs the paid IPv4 add-on, so the pooler avoids ENOTFOUND and timeouts.",
              },
              {
                step: "2",
                title: "Paste and connect",
                body: "Use a read-only role. dbdiagramr reads schema metadata from pg_catalog for one request, then discards the connection string.",
              },
              {
                step: "3",
                title: "Read the diagram",
                body: "public stays unprefixed; auth and storage tables are labelled with their schema. Search, trace foreign keys, export SVG or PNG.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-[20px] border border-border bg-white p-6 shadow-sm"
              >
                <div className="font-mono text-xs font-medium uppercase tracking-widest text-accent">
                  Step {item.step}
                </div>
                <h3 className="mt-2 text-lg font-medium text-ink">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            What the diagram shows
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">All three Supabase schemas</strong>:
                public, auth, and storage, up to 500 tables.
              </li>
              <li>
                <strong className="text-ink">Real relationships</strong>:
                foreign keys from your tables to auth.users appear as lines, so
                profiles, teams, and memberships are easy to follow.
              </li>
              <li>
                <strong className="text-ink">Postgres-native types</strong>:
                uuid, jsonb, text[], enums, and domains render exactly as the
                database reports them.
              </li>
              <li>
                <strong className="text-ink">No row data</strong>: only catalog
                metadata is read. Nothing is stored or published.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <FaqAccordion items={faqs} variant="card" />
        </section>

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            Keep going
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/supabase-rls-check",
                title: "Supabase RLS Check",
                body: "See which public tables have RLS off, RLS with no policies, or RLS on with policies to review.",
              },
              {
                href: "/schema/supabase",
                title: "Supabase schema reference",
                body: "A static reference diagram of the Supabase auth schema with column details.",
              },
              {
                href: "/supabase-connection-string",
                title: "Supabase connection strings",
                body: "Every mode, port, username format, SSL setting, and driver fix in one guide.",
              },
              {
                href: "/blog/supabase-connection-string-ipv6-enotfound",
                title: "Fix Supabase ENOTFOUND",
                body: "Why the direct host fails on IPv4 networks and which pooler string to use instead.",
              },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-[20px] border border-border bg-white p-5 shadow-sm transition-colors hover:shadow-md"
              >
                <div className="font-medium text-ink">
                  {link.title} <span className="text-accent">→</span>
                </div>
                <div className="mt-1 text-sm text-muted">{link.body}</div>
              </Link>
            ))}
          </div>
        </section>

        <RelatedTools current="/supabase-er-diagram" />

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            See your Supabase schema now
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your Supabase pooler connection string and get an interactive
            ER diagram in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-[10px] bg-accent px-8 py-3 text-xs font-medium text-white transition-colors hover:bg-accent-hover"
          >
            Try it free &rarr;
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
