import Link from "next/link";

const allTools = [
  {
    href: "/",
    label: "PostgreSQL ER Diagram",
    description: "Paste a connection string or SQL and explore tables and foreign keys.",
  },
  {
    href: "/database-schema-analyzer",
    label: "Schema Health Analyzer",
    description: "Find missing primary keys, orphan tables, and schema issues.",
  },
  {
    href: "/sql-formatter",
    label: "SQL Formatter",
    description: "Format messy PostgreSQL queries into readable SQL.",
  },
  {
    href: "/csv-to-sql",
    label: "CSV to SQL",
    description: "Turn a CSV file into CREATE TABLE and INSERT statements.",
  },
  {
    href: "/json-to-sql",
    label: "JSON to SQL",
    description: "Convert JSON objects into PostgreSQL tables and rows.",
  },
  {
    href: "/sql-validator",
    label: "SQL Validator",
    description: "Check PostgreSQL syntax and catch errors before running it.",
  },
  {
    href: "/sql-to-mermaid",
    label: "SQL to Mermaid",
    description: "Generate a Mermaid ER diagram from CREATE TABLE statements.",
  },
  {
    href: "/sql-to-typescript",
    label: "SQL to TypeScript",
    description: "Generate TypeScript types and Zod schemas from tables.",
  },
  {
    href: "/sql-to-prisma",
    label: "SQL to Prisma",
    description: "Convert PostgreSQL tables into a Prisma schema.",
  },
  {
    href: "/postgres-connection-string",
    label: "Connection String Builder",
    description: "Build, parse, and debug PostgreSQL connection strings.",
  },
  {
    href: "/sql-schema-diff",
    label: "Schema Diff",
    description: "Compare two schemas and get the ALTER statements to sync them.",
  },
  {
    href: "/dbml-to-sql",
    label: "DBML to SQL",
    description: "Convert DBML diagrams into PostgreSQL DDL.",
  },
  {
    href: "/prisma-erd-generator",
    label: "Prisma ERD",
    description: "Visualize a Prisma schema as an entity-relationship diagram.",
  },
  {
    href: "/github-schema-action",
    label: "PR Schema Diff Action",
    description: "Post schema changes and ER diagrams on every pull request.",
  },
];

export default function RelatedTools({
  current,
  siblings,
}: {
  current: string;
  siblings?: string[];
}) {
  const tools = siblings
    ? siblings
        .map((href) => allTools.find((t) => t.href === href))
        .filter((t): t is (typeof allTools)[number] => Boolean(t))
    : allTools.filter((t) => t.href !== current);
  return (
    <section className="mt-16">
      <h2 className="mb-4 text-2xl font-semibold tracking-tight text-ink">
        Related tools
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-[20px] border border-border bg-white p-5 shadow-sm transition-colors hover:shadow-md"
          >
            <div className="font-medium text-ink">
              {tool.label} <span className="text-accent">→</span>
            </div>
            <div className="mt-1 text-sm text-muted">
              {tool.description}
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 rounded-[20px] border border-border bg-white p-5 shadow-sm">
        <div className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
          Learn more
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/blog/free-online-database-diagram-tool" className="font-medium text-accent hover:text-accent-hover">
            Free Online Database Diagram Tool →
          </Link>
          <Link href="/blog/sql-to-schema-diagram-online" className="font-medium text-accent hover:text-accent-hover">
            SQL to Schema Diagram Online →
          </Link>
          <Link href="/blog/database-schema-health-check" className="font-medium text-accent hover:text-accent-hover">
            Schema Health Check Guide →
          </Link>
          <Link href="/schema" className="font-medium text-accent hover:text-accent-hover">
            Schema Library →
          </Link>
          <Link href="/tools" className="font-medium text-accent hover:text-accent-hover">
            All tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
