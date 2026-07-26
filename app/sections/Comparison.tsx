const comparisons = [
  {
    feature: "Setup time",
    dbdiagramr: "Under 10 seconds",
    manual: "30 minutes to hours",
    sql: "Instant but no visuals",
  },
  {
    feature: "No signup required",
    dbdiagramr: true,
    manual: true,
    sql: true,
  },
  {
    feature: "Interactive diagram",
    dbdiagramr: true,
    manual: false,
    sql: false,
  },
  {
    feature: "Auto-layout tables",
    dbdiagramr: true,
    manual: false,
    sql: false,
  },
  {
    feature: "Shows foreign key relationships",
    dbdiagramr: true,
    manual: false,
    sql: false,
  },
  {
    feature: "Export as SVG / PNG",
    dbdiagramr: true,
    manual: true,
    sql: false,
  },
  {
    feature: "Live schema from your DB",
    dbdiagramr: true,
    manual: false,
    sql: true,
  },
  {
    feature: "Always up to date",
    dbdiagramr: true,
    manual: false,
    sql: true,
  },
  {
    feature: "Free to use",
    dbdiagramr: true,
    manual: true,
    sql: true,
  },
];

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
        <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        </svg>
      </span>
    ) : (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-red-500/5">
        <svg className="h-3.5 w-3.5 text-red-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </span>
    );
  }
  return <span className="text-sm text-[#737373]">{value}</span>;
}

const headers = [
  { key: "feature", label: "Feature", className: "text-left font-medium text-[#1a1a1a]" },
  { key: "dbdiagramr", label: "dbdiagramr", className: "text-center font-semibold text-indigo-600" },
  { key: "manual", label: "Drawing manually", className: "text-center text-[#737373]" },
  { key: "sql", label: "SQL queries / pgAdmin", className: "text-center text-[#737373]" },
];

export default function Comparison() {
  return (
    <section className="bg-[#fafafa]">
      <div className="mx-auto max-w-4xl px-4 py-24">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Comparison
          </span>
        </div>
        <h2 className="mb-4 text-center text-3xl font-medium text-[#1a1a1a] md:text-4xl">
          Why use dbdiagramr?
        </h2>
        <p className="mx-auto mb-16 max-w-lg text-center text-[#737373]">
          See how dbdiagramr compares to the alternatives for understanding your
          PostgreSQL schema.
        </p>

        <div className="overflow-hidden rounded-xl border border-[#e5e5e5] bg-white shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#e5e5e5] bg-[#fafafa]">
                {headers.map((h) => (
                  <th
                    key={h.key}
                    className={`px-4 py-3 text-xs font-medium uppercase tracking-wider ${h.className}`}
                  >
                    {h.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-[#e5e5e5] transition-colors hover:bg-[#fafafa] ${
                    i === comparisons.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-4 py-3 text-sm font-medium text-[#1a1a1a]">
                    {row.feature}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.dbdiagramr} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.manual} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Cell value={row.sql} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
