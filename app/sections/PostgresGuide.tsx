import Link from "next/link";
import { ListOrdered, Type } from "lucide-react";
import { OutlineButton } from "@/components/ui/pills";
import FaqAccordion from "@/app/sections/FaqAccordion";

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
    <section id="postgres-guide" className="scroll-mt-16 bg-cream py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-xs font-medium uppercase tracking-widest text-muted">
              PostgreSQL guide
            </p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-ink md:text-5xl">
              PostgreSQL ER diagrams, <span className="text-accent">explained</span>
            </h2>
            <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-muted md:text-lg">
              A PostgreSQL ER diagram turns tables, columns, primary keys, and
              foreign keys into a picture you can read. dbdiagramr builds that
              picture from your real database, so the diagram matches what is
              deployed instead of a hand-maintained copy.
            </p>
            <Link
              href="/visualize"
              className="mt-4 inline-block text-sm font-medium text-accent hover:text-accent-hover md:hidden"
            >
              Open the visualizer →
            </Link>
          </div>
          <OutlineButton href="/visualize" className="hidden shrink-0 md:inline-flex">
            Open the visualizer →
          </OutlineButton>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2">
          <div className="rounded-[20px] bg-ink p-8 text-white">
            <Type size={28} strokeWidth={2} className="text-punch" />
            <h3 className="mt-6 text-2xl font-semibold tracking-tight">
              How Postgres-specific types render
            </h3>
            <ul className="mt-5 divide-y divide-white/10">
              <li className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <strong className="font-mono text-xs font-medium uppercase tracking-wider text-punch">
                  Arrays
                </strong>
                <span className="text-sm leading-relaxed text-white/70">
                  text[], integer[], and multi-dimensional arrays render with
                  brackets, exactly as \d shows them.
                </span>
              </li>
              <li className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <strong className="font-mono text-xs font-medium uppercase tracking-wider text-punch">
                  Enums and domains
                </strong>
                <span className="text-sm leading-relaxed text-white/70">
                  Custom type names (mpaa_rating, email_address) are preserved,
                  never collapsed to varchar.
                </span>
              </li>
              <li className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <strong className="font-mono text-xs font-medium uppercase tracking-wider text-punch">
                  json / jsonb
                </strong>
                <span className="text-sm leading-relaxed text-white/70">
                  Shown as-is on the column; the key structure inside the
                  document is not expanded.
                </span>
              </li>
              <li className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <strong className="font-mono text-xs font-medium uppercase tracking-wider text-punch">
                  Ranges and network types
                </strong>
                <span className="text-sm leading-relaxed text-white/70">
                  tstzrange, int4range, inet, cidr, and uuid all render
                  verbatim.
                </span>
              </li>
              <li className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
                <strong className="font-mono text-xs font-medium uppercase tracking-wider text-punch">
                  Composite keys
                </strong>
                <span className="text-sm leading-relaxed text-white/70">
                  Every column in a multi-column primary key gets its own PK
                  badge.
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-[20px] bg-accent-soft p-8 text-ink">
            <ListOrdered size={28} strokeWidth={2} className="text-accent" />
            <h3 className="mt-6 text-2xl font-semibold tracking-tight">
              How to generate a PostgreSQL ER diagram
            </h3>
            <ol className="mt-5 space-y-4">
              {postgresHowToSteps.map((step, index) => (
                <li key={step.name} className="flex gap-3">
                  <span className="pt-0.5 font-mono text-xs font-medium text-accent">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm leading-relaxed text-muted">
                    <strong className="font-semibold text-ink">
                      {step.name}.
                    </strong>{" "}
                    {step.text}
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 text-xs leading-relaxed text-muted">
              No installation and no schema code. Paste-SQL mode runs in your
              browser; a live connection string is used for one request and is
              never stored.
            </p>
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="text-2xl font-semibold tracking-tight text-ink">
              Frequently asked questions
            </h2>
            <p className="font-mono text-xs text-muted">Select a question to expand</p>
          </div>
          <div className="mt-6">
            <FaqAccordion items={postgresFaqs} />
          </div>
          <p className="mt-6 font-mono text-xs leading-relaxed text-muted">
            Still curious?{" "}
            <Link
              href="/visualize"
              className="font-medium text-accent hover:text-accent-hover"
            >
              Open the visualizer
            </Link>{" "}
            or browse the{" "}
            <Link
              href="/schema"
              className="font-medium text-accent hover:text-accent-hover"
            >
              schema library
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
