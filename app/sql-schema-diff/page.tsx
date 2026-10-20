import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import SchemaDiff from "@/components/SchemaDiff";

const URL = "https://www.dbdiagramr.space/sql-schema-diff";
const TITLE = "SQL Schema Diff | Compare Schemas, Get ALTERs";
const DESCRIPTION =
  "Paste two versions of a schema to see added, removed, and changed tables and columns, plus the ALTER statements to migrate. Free.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "sql schema diff, compare database schemas, schema diff tool, postgres schema compare, migration diff generator",
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
    q: "How do I compare two PostgreSQL schemas?",
    a: "Paste the old schema (e.g. production, from pg_dump --schema-only) on the left and the new schema on the right. The tool lists every added, removed, and changed table and column, then generates the ALTER TABLE statements to migrate, including USING clauses for type changes and warnings where backfills are needed.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Comparison runs in your browser; paste any size schema pair and copy the migration.",
  },
  {
    q: "Is my schema uploaded anywhere?",
    a: "No. Parsing, diffing, and ALTER generation run entirely in your browser. Your schemas are never uploaded, stored, or logged.",
  },
  {
    q: "Which changes are detected?",
    a: "Added and dropped tables; added, dropped, and altered columns (type, nullability, defaults); primary-key changes; and added foreign keys. Removed foreign keys are flagged with instructions since their constraint names only exist in the live database.",
  },
  {
    q: "Can I visualize the new schema?",
    a: "Yes. Click Visualize the new schema to open it in dbdiagramr as an interactive ER diagram, the fastest review step before running the migration.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "SQL Schema Diff",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function SchemaDiffPage() {
  return (
    <ToolPageShell
      appName="SQL Schema Diff"
      h1="SQL schema diff tool"
      intro="Paste two versions of a PostgreSQL schema and get the structural diff plus the ALTER statements to migrate, added tables, dropped columns, type changes, and key changes, each flagged."
      current="/sql-schema-diff"
      siblings={["/database-schema-analyzer", "/sql-formatter", "/sql-validator"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/database-schema-analyzer", label: "Schema Health Analyzer" },
        { href: "/blog/database-schema-health-check", label: "Schema Health Check Guide" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SchemaDiff />
    </ToolPageShell>
  );
}
