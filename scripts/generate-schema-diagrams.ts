import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import { renderSchemaPng, renderSchemaSvg } from "@/lib/schemaImage";

const outputDir = path.join(process.cwd(), "public/schemas");
mkdirSync(outputDir, { recursive: true });

for (const entry of getAllSchemaEntries()) {
  const base = path.join(outputDir, `${entry.slug}-er-diagram`);
  writeFileSync(`${base}.svg`, renderSchemaSvg(entry.schema), "utf8");
  writeFileSync(`${base}.png`, renderSchemaPng(entry.schema));
  console.log(`generated ${entry.slug} (svg + png)`);
}
