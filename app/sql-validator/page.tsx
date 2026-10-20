import type { Metadata } from "next";
import dynamic from "next/dynamic";
import ToolPageShell, {
  buildToolJsonLd,
} from "@/components/ToolPageShell";

const SqlValidator = dynamic(() => import("@/components/SqlValidator"), {
  ssr: false,
  loading: () => (
    <div className="rounded-[20px] border border-border bg-white p-8 text-center font-mono text-sm text-muted shadow-sm">
      Loading Postgres parser…
    </div>
  ),
});

const URL = "https://www.dbdiagramr.space/sql-validator";
const TITLE = "PostgreSQL SQL Validator & Syntax Checker";
const DESCRIPTION =
  "Check PostgreSQL syntax online using the real Postgres parser. Get line-level errors and clear fixes. Free, instant, no signup.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords:
    "sql validator, postgresql syntax checker, sql syntax checker, validate sql online, postgres query validator",
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
    q: 'Why do I get "syntax error at or near"?',
    a: "That is PostgreSQL telling you the exact token where parsing failed, usually a missing comma, a misplaced keyword, or a typo just before the quoted word. Paste the query here and the validator points at the precise line and column, which is almost always one token after the real mistake.",
  },
  {
    q: "Is it free?",
    a: "Yes, completely free with no signup. Validation runs in your browser via WebAssembly, so even large migration files check instantly.",
  },
  {
    q: "Is my SQL uploaded anywhere?",
    a: "No. The real PostgreSQL parser runs as WebAssembly entirely in your browser. Your SQL is never uploaded, stored, or logged, safe for production queries.",
  },
  {
    q: "Which PostgreSQL features are supported?",
    a: "Everything the real parser accepts: SELECT with CTEs and window functions, DDL, DML, dollar-quoted bodies, casts, arrays, jsonb operators, and procedural blocks. If PostgreSQL 18 accepts it, this validator accepts it.",
  },
  {
    q: "Can I turn valid schema SQL into an ER diagram?",
    a: "Yes. When your SQL validates and contains CREATE TABLE statements, a Visualize button appears that opens it in dbdiagramr as an interactive ER diagram.",
  },
];

const jsonLd = buildToolJsonLd({
  appName: "PostgreSQL SQL Validator",
  appDescription: DESCRIPTION,
  url: URL,
  faqs,
});

export default function SqlValidatorPage() {
  return (
    <ToolPageShell
      appName="PostgreSQL SQL Validator"
      h1="PostgreSQL SQL validator"
      intro="Paste any PostgreSQL and get a verdict from the real Postgres parser, not a regex approximation. Line-level errors with caret positioning, free, private, instant."
      current="/sql-validator"
      siblings={["/sql-formatter", "/database-schema-analyzer", "/csv-to-sql"]}
      faqs={faqs}
      exploreLinks={[
        { href: "/sql-formatter", label: "SQL Formatter" },
        { href: "/blog/how-to-format-sql-postgres", label: "How to Format SQL" },
      ]}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <SqlValidator />
    </ToolPageShell>
  );
}
