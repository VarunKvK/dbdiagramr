import type { SchemaQuery } from "@/data/schemas/registry";

export default function CommonQueries({ queries }: { queries: SchemaQuery[] }) {
  if (queries.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
        Common queries
      </h2>
      <p className="mb-6 max-w-3xl leading-relaxed text-muted">
        These PostgreSQL queries run against the schema shown on this page.
      </p>
      <div className="grid gap-5">
        {queries.map((query) => (
          <article
            key={query.title}
            className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm"
          >
            <div className="border-b border-border bg-surface px-5 py-4">
              <h3 className="font-semibold text-ink">{query.title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {query.description}
              </p>
            </div>
            <pre className="overflow-x-auto bg-ink p-5 font-mono text-xs leading-relaxed text-white/80">
              <code>{query.sql}</code>
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
}
