export default function About() {
  return (
    <section className="bg-cream pb-24 pt-[90px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col gap-6">
          <h2 className="text-3xl font-medium text-ink md:text-4xl">
            About DBdiagramr
            <span className="ml-0.5 text-indigo-600">.</span>
          </h2>
          <p className="max-w-2xl text-base leading-relaxed text-muted">
            DBdiagramr is a free tool that converts PostgreSQL connection strings into
            interactive entity-relationship diagrams. It introspects your live database
            schema, tables, columns, foreign keys, and constraints and renders them as
            a navigable SVG diagram you can pan, zoom, and export.
          </p>
          <div className="flex flex-wrap gap-3">
            {["No Sign-ups", "Opensource", "Export SVG/PNG"].map((label) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-indigo-400 bg-[#D4D2FF] px-4 py-1.5 text-xs font-medium text-ink"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-600 animate-pulse" />
                <p className="text-indigo-600">{label}</p>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-12 w-full">
          <iframe
            src="https://www.youtube.com/embed/z-YlCbOBvjQ"
            title="dbdiagramr demo"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="aspect-video w-full rounded-2xl shadow-sm"
          />
        </div>
      </div>
    </section>
  );
}
