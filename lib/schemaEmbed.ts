import type { SchemaEntry } from "@/data/schemas/registry";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildSchemaEmbed(
  entry: Pick<SchemaEntry, "slug" | "title">
): string {
  const url = `https://www.dbdiagramr.space/schema/${entry.slug}`;
  const imageUrl = `https://www.dbdiagramr.space/schemas/${entry.slug}-er-diagram.png`;
  const title = escapeHtml(entry.title);

  return `<a href="${url}">
  <img src="${imageUrl}" alt="${title}" width="1200" height="630" />
</a>
<p><a href="${url}">${title}</a> by dbdiagramr</p>`;
}
