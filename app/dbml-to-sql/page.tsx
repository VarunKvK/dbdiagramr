import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import DbmlConverter from "@/components/DbmlConverter";

const URL = "https://www.dbdiagramr.space/dbml-to-sql";
const TITLE = "DBML to SQL Converter (and SQL to DBML) | dbdiagramr";
const DESCRIPTION =
  "Convert DBML to PostgreSQL DDL, or SQL back to DBML, in one click. Free online converter that runs in your browser. No signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "dbml to sql, sql to dbml, dbml converter, dbml to postgres, convert dbml to ddl",
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
    q: "What is DBML and how is it different from SQL DDL?",
    a: "DBML (Database Markup Language) is a compact human-readable format for defining schemas, Table blocks with columns and Ref lines for relationships. SQL DDL is what the database actually executes. DBML is shorter to write by hand; DDL is what you run. This tool converts both ways so design docs and migrations stay in sync.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Both directions convert instantly in your browser, Table and Enum blocks, column settings, and Ref lines included.",
  },
  {
    q: "Is my schema uploaded anywhere?",
    a: "No. Parsing and generation run entirely in your browser with zero dependencies. Your schema is never uploaded, stored, or logged.",
  },
  {
    q: "Which DBML features are supported?",
    a: "Table blocks with column types and settings (pk, not null, unique, default), single-line and block Refs in all three directions (>, <, -), and Enum blocks. Project headers, TableGroups, and indexes blocks are ignored for the diagram-relevant output.",
  },
  {
    q: "Can I turn the result into an ER diagram?",
    a: "Yes. Click Visualize this schema to open the converted SQL in dbdiagramr as an interactive ER diagram, useful for checking a hand-written DBML design before generating migrations.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "DBML to SQL Converter",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function DbmlToSqlPage() {
  return (
    <ToolPageShell
      appName="DBML to SQL Converter"
      h1="DBML to SQL converter"
      intro="Convert DBML Table blocks and Refs to PostgreSQL DDL, or SQL back to DBML, in one click. Free, instant, runs entirely in your browser."
      current="/dbml-to-sql"
      siblings={["/sql-to-prisma", "/sql-formatter", "/sql-to-mermaid"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/dbdiagram-io-vs-dbdiagramr", label: "dbdiagram.io vs dbdiagramr" },
        { href: "/postgres-er-diagram", label: "PostgreSQL ER Diagram Tool" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <DbmlConverter />
    </ToolPageShell>
  );
}
