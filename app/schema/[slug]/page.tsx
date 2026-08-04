import { notFound } from "next/navigation";
import { getAllSchemaEntries, getSchemaEntry } from "@/data/schemas/registry";
import { generateDiagramSVG } from "@/lib/diagram";

export function generateStaticParams() {
  return getAllSchemaEntries().map((entry) => ({ slug: entry.slug }));
}

export default function SchemaPage({ params }: { params: { slug: string } }) {
  const entry = getSchemaEntry(params.slug);
  if (!entry) notFound();

  const svg = generateDiagramSVG(entry.schema);

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-6xl px-4 pb-16 pt-24">
        <a
          href="/schema"
          className="mb-8 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
        >
          ← All schemas
        </a>

        <div className="mb-10">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Schema Library
          </span>
          <h1 className="mt-4 text-4xl font-medium text-ink md:text-5xl">
            {entry.h1}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg leading-relaxed text-muted">
            {entry.intro}
          </p>
          <p className="mt-3 text-sm text-muted/70">
            Last updated: {entry.lastUpdated}
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            {entry.facts.map((fact) => (
              <div
                key={fact.label}
                className="rounded-lg bg-white px-4 py-3 shadow-sm ring-1 ring-black/5"
              >
                <div className="text-xs uppercase tracking-wider text-muted">
                  {fact.label}
                </div>
                <div className="mt-1 text-lg font-medium text-ink">
                  {fact.value}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5">
          <div className="flex h-10 items-center gap-2 border-b border-[#333] bg-[#252525] px-4">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
          </div>
          <div className="overflow-auto">
            <div
              className="min-w-[780px]"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          </div>
        </div>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-medium text-ink">
            Tables in the {entry.name} schema
          </h2>
          <div className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-[#fafafa] text-left">
                  <th className="px-4 py-3 font-medium text-ink">Column</th>
                  <th className="px-4 py-3 font-medium text-ink">Type</th>
                  <th className="px-4 py-3 font-medium text-ink">Nullable</th>
                  <th className="px-4 py-3 font-medium text-ink">Key</th>
                </tr>
              </thead>
              <tbody>
                {entry.schema.tables.map((table) => (
                  <TableRows
                    key={table.name}
                    tableName={table.name}
                    rows={table.columns}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-medium text-ink">
            Frequently asked questions
          </h2>
          <div className="grid gap-4">
            {entry.faqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5"
              >
                <h3 className="text-lg font-medium text-ink">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16 rounded-2xl bg-ink px-8 py-12 text-center">
          <h2 className="text-2xl font-medium text-white">
            Visualize your own database
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/70">
            Paste your PostgreSQL connection string and get an interactive ER
            diagram of your own schema in under 10 seconds. No signup required.
          </p>
          <a
            href="/visualize"
            className="mt-6 inline-block rounded-lg bg-white px-8 py-3 font-medium text-ink transition-colors hover:bg-indigo-100"
          >
            Try it free →
          </a>
        </section>
      </div>
    </main>
  );
}

function TableRows({
  tableName,
  rows,
}: {
  tableName: string;
  rows: { name: string; type: string; nullable: string; isPrimaryKey: boolean }[];
}) {
  return (
    <>
      <tr className="border-b border-border bg-indigo-50/50">
        <td
          colSpan={4}
          className="px-4 py-3 font-semibold text-indigo-700"
        >
          {tableName}
        </td>
      </tr>
      {rows.map((column) => (
        <tr key={`${tableName}-${column.name}`} className="border-b border-border last:border-b-0">
          <td className="px-4 py-2.5 font-mono text-ink">{column.name}</td>
          <td className="px-4 py-2.5 font-mono text-muted">{column.type}</td>
          <td className="px-4 py-2.5 text-muted">
            {column.nullable === "NO" ? "No" : "Yes"}
          </td>
          <td className="px-4 py-2.5">
            {column.isPrimaryKey ? (
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                PK
              </span>
            ) : (
              <span className="text-xs text-muted">—</span>
            )}
          </td>
        </tr>
      ))}
    </>
  );
}
