import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import JsonToSql from "@/components/JsonToSql";

const URL = "https://www.dbdiagramr.space/json-to-sql";
const TITLE = "JSON to SQL Converter | CREATE TABLE + INSERT";
const DESCRIPTION =
  "Paste JSON and get a PostgreSQL CREATE TABLE with inferred types, plus INSERT statements. Handles nested objects. Free, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "json to sql, json to sql converter, json to create table, convert json to sql, json to postgres, json to insert",
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
    q: "How are nested JSON objects turned into tables?",
    a: "Each nested object and each array of objects becomes its own child table named parent_key, with a foreign-key column back to the parent row. Arrays of plain values and empty arrays collapse to jsonb. A natural id field becomes the primary key when its values are unique; otherwise the tool adds a SERIAL id.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Conversion runs in your browser; inputs up to 500KB convert instantly and INSERT output caps at 1000 rows with a note.",
  },
  {
    q: "Is my data uploaded anywhere?",
    a: "No. Parsing, type inference, and SQL generation run entirely in your browser. Your JSON is never uploaded, stored, or logged.",
  },
  {
    q: "Which PostgreSQL types are inferred?",
    a: "integer, bigint, double precision, boolean, date, timestamptz, uuid, text, and jsonb, with nullability inferred from nulls and missing keys. Mixed-type columns safely fall back to text or jsonb.",
  },
  {
    q: "Can I turn the result into an ER diagram?",
    a: "Yes. Click Visualize this schema to open the generated tables, including the flattened child tables and their foreign keys, as an interactive ER diagram.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "JSON to SQL Converter",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function JsonToSqlPage() {
  return (
    <ToolPageShell
      appName="JSON to SQL Converter"
      h1="JSON to SQL converter"
      intro="Paste a JSON object or array and get PostgreSQL CREATE TABLE statements with inferred types, plus INSERTs. Nested objects become properly linked child tables."
      current="/json-to-sql"
      siblings={["/csv-to-sql", "/sql-formatter", "/database-schema-analyzer"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/schema/chinook", label: "Chinook schema diagram" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <JsonToSql />
    </ToolPageShell>
  );
}
