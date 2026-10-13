import Link from "next/link";

const allTools = [
  { href: "/postgres-er-diagram", label: "PostgreSQL ER Diagram" },
  { href: "/database-schema-analyzer", label: "Schema Health Analyzer" },
  { href: "/sql-formatter", label: "SQL Formatter" },
  { href: "/csv-to-sql", label: "CSV to SQL" },
  { href: "/json-to-sql", label: "JSON to SQL" },
  { href: "/sql-validator", label: "SQL Validator" },
  { href: "/sql-to-mermaid", label: "SQL to Mermaid" },
  { href: "/sql-to-typescript", label: "SQL to TypeScript" },
  { href: "/sql-to-prisma", label: "SQL to Prisma" },
  { href: "/postgres-connection-string", label: "Connection String Builder" },
  { href: "/sql-schema-diff", label: "Schema Diff" },
  { href: "/dbml-to-sql", label: "DBML to SQL" },
  { href: "/prisma-erd-generator", label: "Prisma ERD" },
  { href: "/github-schema-action", label: "PR Schema Diff Action" },
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
              Free, no signup. Visualize your PostgreSQL schema in seconds.
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
