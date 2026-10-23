import { mkdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { getAllSchemaEntries } from "@/data/schemas/registry";
import {
  renderFullSchemaPng,
  renderFullSchemaSvg,
  schemaDiagramSize,
  renderSchemaOgPng,
} from "@/lib/schemaImage";

const outputDir = path.join(process.cwd(), "public/schemas");
mkdirSync(outputDir, { recursive: true });

for (const entry of getAllSchemaEntries()) {
  const base = path.join(outputDir, `${entry.slug}-er-diagram`);
  const size = schemaDiagramSize(entry.schema);
  writeFileSync(`${base}.svg`, renderFullSchemaSvg(entry.schema), "utf8");
  writeFileSync(`${base}.png`, renderFullSchemaPng(entry.schema));
  writeFileSync(
    path.join(outputDir, `${entry.slug}-og.png`),
    renderSchemaOgPng(entry.schema)
  );

  const svgBytes = statSync(`${base}.svg`).size;
  const pngBytes = statSync(`${base}.png`).size;
  const ogBytes = statSync(path.join(outputDir, `${entry.slug}-og.png`)).size;
  console.log(
    `generated ${entry.slug} ${size.width}x${size.height} ` +
      `(svg ${(svgBytes / 1024).toFixed(1)} KiB, png ${(pngBytes / 1024 / 1024).toFixed(2)} MiB, og ${(ogBytes / 1024).toFixed(1)} KiB)`
  );
}
