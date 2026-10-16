import type { Metadata } from "next";
import Link from "next/link";
import Footer from "@/app/sections/Footer";
import RelatedTools from "@/app/sections/RelatedTools";
import SchemaDiagram from "@/components/SchemaDiagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { ECOMMERCE_SQL } from "@/lib/sql/pgDumpSamples";

const schema = parseSqlToSchema(ECOMMERCE_SQL).schema;

export const metadata: Metadata = {
  title: "PostgreSQL ER Diagram Tool | Generate Diagrams in 10 Seconds",
  description:
    "Generate an interactive ER diagram from any PostgreSQL database. Paste your connection string and see tables, columns, and foreign keys instantly. Free.",
  keywords:
    "postgresql er diagram, postgres erd tool, postgresql database schema diagram, er diagram postgresql, postgresql table relationship diagram",
  alternates: {
    canonical: "https://www.dbdiagramr.space/postgres-er-diagram",
  },
  openGraph: {
    title: "PostgreSQL ER Diagram Tool | Generate Diagrams in 10 Seconds",
    description:
      "Generate an interactive ER diagram from any PostgreSQL database in under 10 seconds. No signup required.",
    type: "website",
    url: "https://www.dbdiagramr.space/postgres-er-diagram",
  },
  twitter: {
    card: "summary_large_image",
    title: "PostgreSQL ER Diagram Tool | Generate Diagrams in 10 Seconds",
    description:
      "Generate an interactive ER diagram from any PostgreSQL database in under 10 seconds.",
  },
};

const faqs = [
  {
    q: "What is a PostgreSQL ER diagram?",
    a: "An entity-relationship diagram (ERD) for PostgreSQL shows your tables, columns, data types, primary keys, and foreign keys as a visual map. It helps you understand how your database is structured and how tables relate to each other.",
  },
  {
    q: "How do I generate an ER diagram from PostgreSQL?",
    a: "Copy your PostgreSQL connection string from your database provider (Supabase, Neon, Railway, AWS RDS, etc.) and paste it into dbdiagramr. The tool reads your schema and generates an interactive ER diagram in under 10 seconds.",
  },
  {
    q: "How are many-to-many relationships shown?",
    a: "As their own node. A join table like film_actor appears as a table with two foreign-key lines, one to film, one to actor. Composite primary keys (order_id, product_id) get a PK badge on each column, so junction tables are instantly recognizable.",
  },
  {
    q: "How does the diagram display Postgres arrays, enums, and jsonb?",
    a: "Type strings are preserved exactly as PostgreSQL reports them: text[], integer[], custom enum names, jsonb, tstzrange, and domains all render verbatim on the column. Nothing is simplified into generic types, so the diagram matches \\d output.",
  },
  {
    q: "What do the PK badges and connecting lines mean?",
    a: "A PK badge marks a primary-key column. Each line is a foreign key from one table's column to another table's primary key. A line from a nullable column is an optional relationship; a line from a NOT NULL column is mandatory. Self-referencing keys (like employees.reports_to) draw as a loop back to the same table.",
  },
  {
    q: "Can I export the ER diagram?",
    a: "Yes. Export your diagram as PNG or SVG. You can also zoom, pan, and hover over tables to trace foreign key relationships interactively.",
  },
  {
    q: "Does Postgres support diagrams like SQL Server Management Studio?",
    a: "Postgres has no built-in diagram view like SSMS database diagrams. The usual workarounds are pgAdmin's graphical query builder, which is not a real ERD, or exporting the schema to an external tool. dbdiagramr fills that gap: paste your connection string and get the SSMS-style table-and-relationship view Postgres never shipped, with Postgres-native types (arrays, enums, jsonb) shown exactly as the database reports them.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "@id": "https://www.dbdiagramr.space/postgres-er-diagram#article",
      headline: "PostgreSQL ER Diagram Tool | Generate Diagrams in 10 Seconds",
      description:
        "Generate an interactive ER diagram from any PostgreSQL database. Paste your connection string and see tables, columns, and foreign keys instantly.",
      datePublished: "2026-09-08",
      dateModified: "2026-10-16",
      mainEntityOfPage: "https://www.dbdiagramr.space/postgres-er-diagram",
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
      "@id": "https://www.dbdiagramr.space/postgres-er-diagram#faq",
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
          name: "PostgreSQL ER Diagram",
          item: "https://www.dbdiagramr.space/postgres-er-diagram",
        },
      ],
    },
  ],
};

export default function PostgresErDiagramPage() {
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
            PostgreSQL
          </span>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-ink md:text-5xl">
            PostgreSQL ER Diagram Tool
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            Paste SQL or connect to your PostgreSQL database. See tables, columns,
            and foreign keys as an interactive ER diagram in seconds.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            {["Paste SQL or Connect", "Live Preview", "Export SVG/PNG"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent-soft px-4 py-1.5 text-xs font-medium text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                <p className="text-accent">{label}</p>
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-[20px] bg-ink shadow-lg">
          <div className="flex h-10 items-center gap-2 border-b border-white/10 bg-pine px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            <span className="ml-2 text-xs text-white/50">
              dbdiagramr.space/visualize
            </span>
          </div>
          <div className="h-[540px] overflow-hidden">
            <SchemaDiagram schema={schema} className="h-full w-full" />
          </div>
        </div>


        <section className="mt-16">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
            How Postgres-specific types render
          </h2>
          <div className="rounded-[20px] border border-border bg-white p-6 shadow-sm">
            <ul className="list-disc space-y-2 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">Arrays</strong>: text[],
                integer[], and multi-dimensional arrays render with brackets,
                exactly as \d shows them
              </li>
              <li>
                <strong className="text-ink">Enums and domains</strong>: custom
                type names (mpaa_rating, email_address) are preserved, never
                collapsed to varchar
              </li>
              <li>
                <strong className="text-ink">json / jsonb</strong>: shown as-is
                on the column; key structure inside the document is not expanded
              </li>
              <li>
                <strong className="text-ink">Ranges and network types</strong> --
                tstzrange, int4range, inet, cidr, and uuid all render verbatim
              </li>
              <li>
                <strong className="text-ink">Composite keys</strong>: every
                column in a multi-column primary key gets its own PK badge
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="grid gap-4">
            {faqs.map((faq) => (
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

        <RelatedTools current="/postgres-er-diagram" />

        <section className="mt-16 rounded-[20px] bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-semibold text-white">
            Generate your PostgreSQL ER diagram now
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram in under 10 seconds. No signup required.
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
