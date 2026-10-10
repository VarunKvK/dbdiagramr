import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import CsvToSql from "@/components/CsvToSql";

const URL = "https://www.dbdiagramr.space/csv-to-sql";
const TITLE = "CSV to SQL Converter -- Free, No Upload | dbdiagramr";
const DESCRIPTION =
  "Drop in a CSV and get CREATE TABLE and INSERT statements with column types detected. Your file never leaves the browser. No signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "csv to sql, csv to sql converter, csv to postgresql, convert csv to sql, csv to create table, import csv postgres",
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
    q: "How do I import a CSV into PostgreSQL?",
    a: "Two paths: paste the generated INSERT statements into psql for small files, or -- for large files -- use the generated CREATE TABLE then load with \\copy tablename FROM 'file.csv' WITH CSV HEADER. This tool gives you both the table definition and the INSERTs, so either path starts here.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup and no row limits in the browser. Files up to a few thousand rows convert instantly; the output caps INSERTs at 1000 rows with a note, so split very large files before importing.",
  },
  {
    q: "Is my data uploaded anywhere?",
    a: "No. Parsing and type detection run entirely in your browser with no server round-trip. Your CSV is never uploaded, stored, or logged -- you can safely convert files with real customer data.",
  },
  {
    q: "Which column types are detected?",
    a: "integer, bigint, double precision, boolean, date, timestamptz, uuid, and text -- with nullability inferred from empty cells. If every value in the first column is unique, it becomes the PRIMARY KEY. Mixed or ambiguous columns safely fall back to text.",
  },
  {
    q: "Can I turn the result into an ER diagram?",
    a: "Yes. Click Visualize this schema to open the generated SQL in dbdiagramr as an interactive ER diagram -- useful for sanity-checking the inferred types and keys before you run anything against production.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "CSV to SQL Converter",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function CsvToSqlPage() {
  return (
    <ToolPageShell
      appName="CSV to SQL Converter"
      h1="CSV to SQL converter"
      intro="Drop in a CSV and get a PostgreSQL CREATE TABLE with detected column types, plus INSERT statements for every row. Runs entirely in your browser -- your file never uploads."
      current="/csv-to-sql"
      siblings={["/json-to-sql", "/sql-formatter", "/database-schema-analyzer"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/free-schema-generator", label: "Free Schema Generator" },
        { href: "/schema/chinook", label: "Chinook schema diagram" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <CsvToSql />
    </ToolPageShell>
  );
}
