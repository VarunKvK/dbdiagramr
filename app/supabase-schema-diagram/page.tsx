import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import TwoWaysToUse from "@/app/sections/TwoWaysToUse";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { SUPABASE_SQL } from "@/lib/sql/pgDumpSamples";

const schema = parseSqlToSchema(SUPABASE_SQL).schema;

export const metadata: Metadata = {
  title: "Supabase Schema Diagram -- Visualize Your Supabase Database",
  description:
    "Generate an ER diagram from your Supabase PostgreSQL database. See auth, storage, and foreign keys instantly. No signup, no setup.",
  keywords:
    "supabase schema diagram, supabase erd, supabase database diagram, supabase schema visualizer, supabase er diagram",
  alternates: {
    canonical: "https://www.dbdiagramr.space/supabase-schema-diagram",
  },
  openGraph: {
    title: "Supabase Schema Diagram -- Visualize Your Supabase Database",
    description:
      "Generate an ER diagram from your Supabase PostgreSQL database in under 10 seconds. No signup required.",
    type: "website",
    url: "https://www.dbdiagramr.space/supabase-schema-diagram",
    images: [{ url: "/Supabase-DbDiagramr-OG.png", width: 1800, height: 945 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Supabase Schema Diagram -- Visualize Your Supabase Database",
    description:
      "Generate an ER diagram from your Supabase PostgreSQL database in under 10 seconds.",
    images: ["/Supabase-DbDiagramr-OG.png"],
  },
};

const faqs = [
  {
    q: "How do I get my Supabase connection string?",
    a: "Go to your Supabase Dashboard, click Settings, then Database. Under Connection string, select the Session pooler (port 5432). Copy the full URI -- it starts with postgresql://. This is the string you paste into dbdiagramr.",
  },
  {
    q: "Why do I get ENOTFOUND or IPv6 errors with Supabase?",
    a: "Supabase uses IPv6 by default on the Direct connection. Use the Session pooler (port 5432) instead -- it works over IPv4 from anywhere. The Transaction pooler (port 6543) is for serverless functions and won't work with schema tools.",
  },
  {
    q: "Can I see the Supabase auth schema?",
    a: "Yes. When you connect your Supabase database, dbdiagramr shows all tables including the auth schema (users, identities, sessions, refresh_tokens), storage schema, and your public schema tables. Everything is in one diagram.",
  },
  {
    q: "Does this show RLS policies?",
    a: "Not yet. dbdiagramr currently shows tables, columns, foreign keys, and primary keys. Row Level Security policies are on the roadmap.",
  },
  {
    q: "Is this affiliated with Supabase?",
    a: "No. dbdiagramr is an independent tool that works with any PostgreSQL database. Supabase is just one of many providers we support -- it also works with Neon, Railway, AWS RDS, Google Cloud SQL, and self-hosted PostgreSQL.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/supabase-schema-diagram#article",
      headline: "Supabase Schema Diagram -- Visualize Your Supabase Database",
      description:
        "Generate an ER diagram from your Supabase PostgreSQL database. See auth, storage, and foreign keys instantly.",
      datePublished: "2026-09-08",
      dateModified: "2026-09-08",
      mainEntityOfPage:
        "https://www.dbdiagramr.space/supabase-schema-diagram",
      author: {
        "@type": "Person",
        name: "Varun Krishnan",
        url: "https://github.com/VarunKvK",
      },
      publisher: {
        "@type": "Organization",
        name: "dbdiagramr",
        url: "https://www.dbdiagramr.space",
        logo: {
          "@type": "ImageObject",
          url: "https://www.dbdiagramr.space/favicon.svg",
        },
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://www.dbdiagramr.space/supabase-schema-diagram#faq",
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
          name: "Supabase Schema Diagram",
          item:
            "https://www.dbdiagramr.space/supabase-schema-diagram",
        },
      ],
    },
  ],
};

export default function SupabaseSchemaDiagramPage() {
  return (
    <main className="min-h-screen bg-cream">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <Link
          href="/visualize"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
        >
          &larr; Try the tool
        </Link>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Supabase
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            Supabase Schema Diagram Generator
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            See your Supabase database -- auth tables, public tables, and foreign
            keys -- as an interactive ER diagram. Paste SQL or connect with
            Session pooler (port 5432).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Supabase Native", "Paste SQL or Connect", "Free"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-400 bg-[#D4D2FF] px-4 py-1.5 text-xs font-medium text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <p className="text-indigo-600">{label}</p>
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5">
          <div className="flex h-10 items-center gap-2 border-b border-[#333] bg-[#252525] px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            <span className="ml-2 text-xs text-[#999]">
              dbdiagramr.space/visualize
            </span>
          </div>
          <div className="h-[540px] overflow-hidden">
            <SchemaDiagram schema={schema} className="h-full w-full" />
          </div>
        </div>

        <TwoWaysToUse />

        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-medium text-ink">
            What gets visualized
          </h2>
          <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">Public schema</strong> -- your
                application tables, views, and foreign keys
              </li>
              <li>
                <strong className="text-ink">Auth schema</strong> -- users,
                identities, sessions, refresh_tokens
              </li>
              <li>
                <strong className="text-ink">Storage schema</strong> -- buckets,
                objects, and access controls
              </li>
              <li>
                <strong className="text-ink">All relationships</strong> --
                foreign keys drawn as lines between tables
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

        <RelatedTools current="/supabase-schema-diagram" />

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Visualize your own Supabase database
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your Supabase connection string and get an interactive ER
            diagram of your schema in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free &rarr;
          </a>
        </section>
      </div>
      <Footer />
    </main>
  );
}
