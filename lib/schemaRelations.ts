import type { SchemaEntry } from "@/data/schemas/registry";

export function getRelatedSchemas(
  entry: SchemaEntry,
  allEntries: SchemaEntry[],
  limit = 5
): SchemaEntry[] {
  const bySlug = new Map(allEntries.map((item) => [item.slug, item]));
  const related: SchemaEntry[] = [];

  const add = (candidate: SchemaEntry | undefined) => {
    if (
      candidate &&
      candidate.slug !== entry.slug &&
      !related.some((item) => item.slug === candidate.slug)
    ) {
      related.push(candidate);
    }
  };

  for (const slug of entry.related ?? []) add(bySlug.get(slug));

  if (related.length < 4 && entry.category) {
    for (const candidate of allEntries) {
      if (candidate.category === entry.category) add(candidate);
      if (related.length >= limit) break;
    }
  }

  return related.slice(0, limit);
}
