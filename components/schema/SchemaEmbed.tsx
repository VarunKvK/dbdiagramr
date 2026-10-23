import type { SchemaEntry } from "@/data/schemas/registry";
import { buildSchemaEmbed } from "@/lib/schemaEmbed";
import { schemaDiagramSize } from "@/lib/schemaImage";
import EmbedCopyButton from "@/components/schema/EmbedCopyButton";

export default function SchemaEmbed({
  entry,
}: {
  entry: Pick<SchemaEntry, "slug" | "title" | "schema">;
}) {
  const html = buildSchemaEmbed(entry, schemaDiagramSize(entry.schema));

  return (
    <section className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Embed this diagram
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Paste this HTML into a README, docs page, or blog post. The image
            links back to the full schema page.
          </p>
        </div>
        <EmbedCopyButton html={html} />
      </div>
      <pre className="mt-4 overflow-x-auto rounded-[20px] border border-border bg-ink p-5 font-mono text-xs leading-relaxed text-white/80">
        <code>{html}</code>
      </pre>
    </section>
  );
}
