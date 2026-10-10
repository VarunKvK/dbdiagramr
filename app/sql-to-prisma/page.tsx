import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import SqlToPrisma from "@/components/SqlToPrisma";

const URL = "https://www.dbdiagramr.space/sql-to-prisma";
const TITLE = "SQL to Prisma Schema Converter -- Free Online | dbdiagramr";
const DESCRIPTION =
  "Turn CREATE TABLE statements into a ready-to-use schema.prisma with types and relations mapped. Free, instant, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "sql to prisma schema, sql to prisma, ddl to prisma, postgres to prisma, convert sql to schema.prisma",
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: URL,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

const faqs = [
  {
    q: "Is this the same as prisma db pull?",
    a: "No -- prisma db pull introspects a live database and needs credentials and a network round-trip. This tool converts SQL text you already have (a dump, a migration, docs) into schema.prisma syntax entirely in your browser. Use db pull for live databases; use this for SQL on your clipboard.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Paste DDL, copy schema.prisma -- models, scalar types with native mappings, @id attributes, and @relation fields included.",
  },
  {
    q: "Is my SQL uploaded anywhere?",
    a: "No. Parsing and Prisma generation run entirely in your browser. Your schema is never uploaded, stored, or logged.",
  },
  {
    q: "Which PostgreSQL features are supported?",
    a: "Tables become models (PascalCase with @@map back to the table name), columns map to scalars with @db native types (Uuid, Timestamptz, Decimal), primary keys become @id, common defaults (gen_random_uuid(), now()) become @default, and foreign keys become @relation fields on both sides.",
  },
  {
    q: "Can I turn the result into an ER diagram?",
    a: "Yes. Click Visualize this schema to open the same SQL in dbdiagramr as an interactive ER diagram -- the fastest way to review the relations Prisma will generate a client for.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "SQL to Prisma Schema Converter",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function SqlToPrismaPage() {
  return (
    <ToolPageShell
      appName="SQL to Prisma Schema Converter"
      h1="SQL to Prisma schema converter"
      intro="Turn PostgreSQL CREATE TABLE statements into a ready-to-use schema.prisma -- models, native type mappings, ids, defaults, and relations on both sides."
      current="/sql-to-prisma"
      siblings={["/sql-to-typescript", "/postgres-er-diagram", "/sql-formatter"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/schema/nextauth", label: "NextAuth schema diagram" },
        { href: "/sql-to-typescript", label: "SQL to TypeScript Types" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SqlToPrisma />
    </ToolPageShell>
  );
}
