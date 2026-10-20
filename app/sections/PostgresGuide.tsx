import Link from "next/link";

export const postgresFaqs = [
  {
    q: "What is a PostgreSQL ER diagram?",
    a: "An entity-relationship diagram (ERD) for PostgreSQL shows your tables, columns, data types, primary keys, and foreign keys as a visual map. It helps you understand how your database is structured and how tables relate to each other.",
  },
  {
    q: "How do I generate an ER diagram from PostgreSQL?",
    a: "Copy your PostgreSQL connection string from your database provider (Supabase, Neon, Railway, AWS RDS, etc.) and paste it into dbdiagramr. The tool reads your schema and generates an interactive ER diagram in under 10 seconds.",
  },
  {
    q: "How are many-to-many relationships shown?",
    a: "As their own node. A join table like film_actor appears as a table with two foreign-key lines, one to film, one to actor. Composite primary keys (order_id, product_id) get a PK badge on each column, so junction tables are instantly recognizable.",
  },
  {
    q: "How does the diagram display Postgres arrays, enums, and jsonb?",
    a: "Type strings are preserved exactly as PostgreSQL reports them: text[], integer[], custom enum names, jsonb, tstzrange, and domains all render verbatim on the column. Nothing is simplified into generic types, so the diagram matches \\d output.",
  },
  {
    q: "What do the PK badges and connecting lines mean?",
    a: "A PK badge marks a primary-key column. Each line is a foreign key from one table's column to another table's primary key. A line from a nullable column is an optional relationship; a line from a NOT NULL column is mandatory. Self-referencing keys (like employees.reports_to) draw as a loop back to the same table.",
  },
  {
    q: "Can I export the ER diagram?",
    a: "Yes. Export your diagram as PNG or SVG. You can also zoom, pan, and hover over tables to trace foreign key relationships interactively.",
  },
  {
    q: "Does Postgres support diagrams like SQL Server Management Studio?",
    a: "Postgres has no built-in diagram view like SSMS database diagrams. The usual workarounds are pgAdmin's graphical query builder, which is not a real ERD, or exporting the schema to an external tool. dbdiagramr fills that gap: paste your connection string and get the SSMS-style table-and-relationship view Postgres never shipped, with Postgres-native types (arrays, enums, jsonb) shown exactly as the database reports them.",
  },
];

export const postgresHowToSteps = [
  {
    name: "Get a read-only PostgreSQL connection string",
    text: "Copy the connection string from Supabase, Neon, Railway, RDS, or any PostgreSQL host. Use a read-only role if you can.",
  },
  {
    name: "Paste it into dbdiagramr",
    text: "Open the visualizer and paste the connection string, or paste a SQL dump instead. dbdiagramr reads tables, columns, primary keys, and foreign keys.",
  },
  {
    name: "Explore and export the diagram",
    text: "Search for a table, hover to trace relationships, then export the diagram as SVG or PNG.",
  },
];

export default function PostgresGuide() {
  return (
    <section id="postgres-guide" className="scroll-mt-16 border-t border-border bg-white py-20 md:py-28">
      <div className="mx-auto max-w-5xl px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
            PostgreSQL guide
          </p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
            PostgreSQL ER diagrams, explained
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-muted">
            A PostgreSQL ER diagram turns tables, columns, primary keys, and
            foreign keys into a picture you can read. dbdiagramr builds that
            picture from your real database, so the diagram matches what is
            deployed instead of a hand-maintained copy.{" "}
            <Link href="/visualize" className="font-medium text-accent hover:text-accent-hover">
              Open the visualizer
            </Link>{" "}
            to try it.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-[20px] border border-border bg-cream p-7">
            <h3 className="text-xl font-semibold text-ink">
              How Postgres-specific types render
            </h3>
            <ul className="mt-4 list-disc space-y-3 pl-5 leading-relaxed text-muted">
              <li>
                <strong className="text-ink">Arrays</strong>: text[],
                integer[], and multi-dimensional arrays render with brackets,
                exactly as \d shows them.
              </li>
              <li>
                <strong className="text-ink">Enums and domains</strong>: custom
                type names (mpaa_rating, email_address) are preserved, never
                collapsed to varchar.
              </li>
              <li>
                <strong className="text-ink">json / jsonb</strong>: shown as-is
                on the column; the key structure inside the document is not
                expanded.
              </li>
              <li>
                <strong className="text-ink">Ranges and network types</strong>:
                tstzrange, int4range, inet, cidr, and uuid all render verbatim.
              </li>
              <li>
                <strong className="text-ink">Composite keys</strong>: every
                column in a multi-column primary key gets its own PK badge.
              </li>
            </ul>
          </div>

          <div className="rounded-[20px] border border-border bg-cream p-7">
            <h3 className="text-xl font-semibold text-ink">
              How to generate a PostgreSQL ER diagram
            </h3>
            <ol className="mt-4 list-decimal space-y-4 pl-5 leading-relaxed text-muted">
              {postgresHowToSteps.map((step) => (
                <li key={step.name}>
                  <strong className="text-ink">{step.name}.</strong>{" "}
                  {step.text}
                </li>
              ))}
            </ol>
            <p className="mt-5 text-sm leading-relaxed text-muted">
              No installation and no schema code. Paste-SQL mode runs in your
              browser; a live connection string is used for one request and is
              never stored.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Frequently asked questions
          </h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {postgresFaqs.map((faq) => (
              <div
                key={faq.q}
                className="rounded-[20px] border border-border bg-cream p-6"
              >
                <h3 className="text-lg font-medium text-ink">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
