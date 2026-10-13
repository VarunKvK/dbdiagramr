import type { Metadata } from "next";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";
import SqlToMermaid from "@/components/SqlToMermaid";

const URL = "https://www.dbdiagramr.space/sql-to-mermaid";
const TITLE = "SQL to Mermaid ER Diagram Converter | Free | dbdiagramr";
const DESCRIPTION =
  "Paste CREATE TABLE statements and get Mermaid erDiagram code instantly. Copy it into GitHub, Notion, or your docs. Free, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "sql to mermaid, mermaid er diagram generator, sql to erdiagram, mermaid erd from sql, database to mermaid",
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
    q: "How do I add an ER diagram to a GitHub README?",
    a: "Paste the generated erDiagram code into a fenced mermaid block in your README. GitHub renders Mermaid natively, no images, no external service, and the diagram stays in version control next to the schema it documents.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Conversion runs in your browser; paste any size schema and copy the output.",
  },
  {
    q: "Is my SQL uploaded anywhere?",
    a: "No. Parsing and Mermaid generation run entirely in your browser. Your schema is never uploaded, stored, or logged.",
  },
  {
    q: "Which PostgreSQL features are supported?",
    a: "All standard DDL the dbdiagramr parser reads: tables, columns with full type strings, primary keys, inline and table-level foreign keys, and ALTER TABLE constraints. Postgres-specific types are normalized to Mermaid-safe type names.",
  },
  {
    q: "Can I turn the result into an interactive ER diagram?",
    a: "Yes. Click Visualize this schema to open the same SQL in dbdiagramr as a searchable, exportable ER diagram, better than a static Mermaid render for large schemas.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "SQL to Mermaid ER Diagram Converter",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function SqlToMermaidPage() {
  return (
    <ToolPageShell
      appName="SQL to Mermaid ER Diagram Converter"
      h1="SQL to Mermaid ER diagram converter"
      intro="Paste PostgreSQL CREATE TABLE statements and get Mermaid erDiagram code instantly, entities, attributes, keys, and relationships ready for GitHub, Notion, or your docs."
      current="/sql-to-mermaid"
      siblings={["/sql-formatter", "/postgres-er-diagram", "/database-schema-analyzer"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/blog/what-is-an-er-diagram", label: "How to Read an ER Diagram" },
        { href: "/postgres-er-diagram", label: "PostgreSQL ER Diagram Tool" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SqlToMermaid />
    </ToolPageShell>
  );
}
