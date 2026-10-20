import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import SqlToTypescript from "@/components/SqlToTypescript";

const URL = "https://www.dbdiagramr.space/sql-to-typescript";
const TITLE = "SQL to TypeScript Types & Zod Schemas";
const DESCRIPTION =
  "Generate TypeScript interfaces and Zod schemas from PostgreSQL CREATE TABLE statements. Handles nullables and enums. Free, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "sql to typescript, sql to zod, postgres to typescript, ddl to typescript, generate zod from sql, sql to types",
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
    q: "How do PostgreSQL types map to TypeScript types?",
    a: "integers, floats, and numerics become number; booleans become boolean; timestamps and dates become Date; text, varchar, and uuid become string; json and jsonb become unknown; bytea becomes Buffer; array columns become T[]. Nullable columns become optional properties (with | null) and Zod .nullable() schemas.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Everything runs in your browser, paste DDL, toggle between interfaces and Zod, copy the output.",
  },
  {
    q: "Is my SQL uploaded anywhere?",
    a: "No. Parsing and code generation run entirely in your browser. Your schema is never uploaded, stored, or logged.",
  },
  {
    q: "Which PostgreSQL features are supported?",
    a: "Tables, columns with full type strings, primary keys, nullability, and defaults. Foreign keys shape the diagram tools but do not change the generated types, relations are yours to model in your ORM.",
  },
  {
    q: "Can I turn the result into an ER diagram?",
    a: "Yes. Click Visualize this schema to open the same SQL in dbdiagramr as an interactive ER diagram, handy for checking the relationships behind the types you just generated.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "SQL to TypeScript Types Generator",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function SqlToTypescriptPage() {
  return (
    <ToolPageShell
      appName="SQL to TypeScript Types Generator"
      h1="SQL to TypeScript types generator"
      intro="Paste PostgreSQL CREATE TABLE statements and get TypeScript interfaces or Zod validation schemas, nullables, arrays, dates, and uuids mapped correctly."
      current="/sql-to-typescript"
      siblings={["/sql-to-prisma", "/sql-formatter", "/sql-to-mermaid"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/sql-to-prisma", label: "SQL to Prisma Schema" },
        { href: "/sql-formatter", label: "SQL Formatter" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SqlToTypescript />
    </ToolPageShell>
  );
}
