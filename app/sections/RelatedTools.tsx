import Link from "next/link";

const allTools = [
  { href: "/postgres-er-diagram", label: "PostgreSQL ER Diagram" },
  { href: "/supabase-schema-diagram", label: "Supabase Schema Diagram" },
  { href: "/free-schema-generator", label: "Free Schema Generator" },
  { href: "/database-diagram-online", label: "Database Diagram Online" },
  { href: "/postgres-schema-visualizer", label: "Schema Visualizer" },
  { href: "/database-schema-analyzer", label: "Schema Health Analyzer" },
  { href: "/sql-formatter", label: "SQL Formatter" },
];

export default function RelatedTools({ current }: { current: string }) {
  const tools = allTools.filter((t) => t.href !== current);
  return (
    <section className="mt-16">
      <h2 className="mb-4 text-2xl font-medium text-ink">
        Related tools
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => (
          <Link
            key={tool.href}
            href={tool.href}
            className="block rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="font-medium text-ink hover:text-indigo-600">
              {tool.label} →
            </div>
            <div className="mt-1 text-sm text-muted">
              Free, no signup. Visualize your PostgreSQL schema in seconds.
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5">
        <div className="text-sm font-medium uppercase tracking-wider text-muted">
          Learn more
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <Link href="/blog/free-online-database-diagram-tool" className="font-medium text-indigo-600 hover:text-indigo-500">
            Free Online Database Diagram Tool →
          </Link>
          <Link href="/blog/sql-to-schema-diagram-online" className="font-medium text-indigo-600 hover:text-indigo-500">
            SQL to Schema Diagram Online →
          </Link>
          <Link href="/blog/database-schema-health-check" className="font-medium text-indigo-600 hover:text-indigo-500">
            Schema Health Check Guide →
          </Link>
          <Link href="/schema" className="font-medium text-indigo-600 hover:text-indigo-500">
            Schema Library →
          </Link>
          <Link href="/tools" className="font-medium text-indigo-600 hover:text-indigo-500">
            All tools →
          </Link>
        </div>
      </div>
    </section>
  );
}
