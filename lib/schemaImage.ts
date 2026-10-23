import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { diagramBounds, renderDiagramSVG, type Schema } from "@/lib/diagram";
import { layoutSchema } from "@/lib/diagramLayout";

const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = "#f3ffe6";
const FONT_SANS = "Liberation Sans";
const FONT_MONO = "Liberation Mono";

// resvg panics on the SVG glow filter when the card is scaled inside a
// transform (empty filter region). It is a drop shadow only, so drop it.
function withoutGlow(svg: string): string {
  return svg
    .replace(/\s*<filter id="glow"[\s\S]*?<\/filter>/, "")
    .replace(/\s*<rect[^>]*filter="url\(#glow\)"[^>]*\/>/g, "");
}

// resvg only has the bundled TTFs; map the diagram's web fonts onto them.
function withFonts(svg: string): string {
  return svg
    .replace(/fontFamily="Inter, sans-serif"/g, `fontFamily="${FONT_SANS}"`)
    .replace(/fontFamily="monospace"/g, `fontFamily="${FONT_MONO}"`);
}

// resvg panics on some marker-end paths at certain orientations. The
// cardinality badges already label each end, so drop the arrowheads.
function withoutMarkers(svg: string): string {
  return svg.replace(/\s*marker-end="url\(#arrowhead\)"/g, "");
}

function bestLayout(schema: Schema) {
  const layouts = [layoutSchema(schema, "LR"), layoutSchema(schema, "TB")];
  const target = WIDTH / (HEIGHT - 46);
  return layouts.reduce((best, candidate) => {
    const bestRatio = (() => {
      const b = diagramBounds(best);
      return b.vw / b.vh;
    })();
    const candidateBounds = diagramBounds(candidate);
    const candidateRatio = candidateBounds.vw / candidateBounds.vh;
    return Math.abs(Math.log(candidateRatio / target)) <
      Math.abs(Math.log(bestRatio / target))
      ? candidate
      : best;
  });
}

export function schemaDiagramSize(schema: Schema): {
  width: number;
  height: number;
} {
  const bounds = diagramBounds(bestLayout(schema));
  return { width: Math.ceil(bounds.vw), height: Math.ceil(bounds.vh) };
}

export function renderFullSchemaSvg(schema: Schema): string {
  const layout = bestLayout(schema);
  const size = schemaDiagramSize(schema);
  return withFonts(renderDiagramSVG(schema, layout, size));
}

function renderPng(svg: string, scale = 1): Uint8Array {
  const resvg = new Resvg(svg, {
    background: BACKGROUND,
    fitTo:
      scale === 1 ? undefined : { mode: "zoom", value: scale },
    font: {
      loadSystemFonts: false,
      defaultFontFamily: FONT_SANS,
      fontFiles: [
        path.join(process.cwd(), "app/fonts/LiberationSans-Regular.ttf"),
        path.join(process.cwd(), "app/fonts/LiberationMono-Regular.ttf"),
      ],
    },
  });
  return resvg.render().asPng();
}

export function renderFullSchemaPng(schema: Schema): Uint8Array {
  const svg = withFonts(
    withoutMarkers(withoutGlow(renderFullSchemaSvg(schema)))
  );
  return renderPng(svg, 2);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const OG_COLUMNS = 4;
const OG_PAD = 40;
const OG_GAP = 12;
const OG_HEADER = 150;
const OG_FOOTER = 56;

export function renderSchemaOgSvg(schema: Schema): string {
  const count = schema.tables.length;
  const rows = Math.max(1, Math.ceil(count / OG_COLUMNS));
  const cardWidth =
    (WIDTH - OG_PAD * 2 - (OG_COLUMNS - 1) * OG_GAP) / OG_COLUMNS;
  const availableHeight = HEIGHT - OG_HEADER - OG_FOOTER;
  const cardHeight = Math.min(
    104,
    (availableHeight - (rows - 1) * OG_GAP) / rows
  );
  const gridTop =
    OG_HEADER +
    Math.max(
      0,
      (availableHeight - (rows * cardHeight + (rows - 1) * OG_GAP)) / 2
    );

  const cards = schema.tables
    .map((table, index) => {
      const col = index % OG_COLUMNS;
      const row = Math.floor(index / OG_COLUMNS);
      const x = OG_PAD + col * (cardWidth + OG_GAP);
      const y = gridTop + row * (cardHeight + OG_GAP);
      const name = escapeXml(table.name);
      const nameSize = table.name.length > 24 ? 13.5 : 15;
      const columnCount = table.columns.length;
      const fkCount = table.foreignKeys.length;
      const metrics = `${columnCount} ${columnCount === 1 ? "column" : "columns"} · ${fkCount} ${fkCount === 1 ? "FK" : "FKs"}`;
      return `<g transform="translate(${x} ${y})">
    <rect width="${cardWidth}" height="${cardHeight}" rx="10" fill="#1e1e1e"/>
    <rect width="5" height="${cardHeight}" rx="2.5" fill="#3d7e16"/>
    <text x="18" y="31" font-family="${FONT_SANS}" font-size="${nameSize}" font-weight="700" fill="#ffffff">${name}</text>
    <text x="18" y="55" font-family="${FONT_SANS}" font-size="12" fill="#a3bfa0">${escapeXml(metrics)}</text>
  </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BACKGROUND}"/>
  <rect x="${OG_PAD}" y="36" width="190" height="30" rx="15" fill="#e3f4d4"/>
  <text x="${OG_PAD + 95}" y="56" text-anchor="middle" font-family="${FONT_SANS}" font-size="14" font-weight="700" letter-spacing="0.5" fill="#3d7e16">POSTGRESQL SCHEMA</text>
  <text x="${WIDTH - OG_PAD}" y="56" text-anchor="end" font-family="${FONT_SANS}" font-size="20" font-weight="700" fill="#1e1e1e">dbdiagramr.space</text>
  <text x="${WIDTH - OG_PAD}" y="79" text-anchor="end" font-family="${FONT_SANS}" font-size="13" fill="#4b5563">Free PostgreSQL ER diagrams</text>
  <text x="${OG_PAD}" y="120" font-family="${FONT_SANS}" font-size="38" font-weight="700" fill="#1e1e1e">${count} ${count === 1 ? "table" : "tables"}, every column mapped</text>
  <text x="${WIDTH - OG_PAD}" y="120" text-anchor="end" font-family="${FONT_SANS}" font-size="16" fill="#4b5563">${count === 0 ? "Empty schema" : "All tables shown"}</text>
  ${cards}
  <line x1="${OG_PAD}" y1="${HEIGHT - 48}" x2="${WIDTH - OG_PAD}" y2="${HEIGHT - 48}" stroke="#dbeccd" stroke-width="2"/>
  <text x="${OG_PAD}" y="${HEIGHT - 20}" font-family="${FONT_SANS}" font-size="14" font-weight="700" fill="#1e1e1e">Interactive PostgreSQL ER diagram</text>
  <text x="${WIDTH - OG_PAD}" y="${HEIGHT - 20}" text-anchor="end" font-family="${FONT_SANS}" font-size="14" fill="#4b5563">dbdiagramr.space</text>
</svg>`;
}

export function renderSchemaOgPng(schema: Schema): Uint8Array {
  return renderPng(renderSchemaOgSvg(schema));
}

const SHARE_CARD_WIDTH = 352;
const SHARE_CARD_HEIGHT = 84;
const SHARE_GAP_X = 24;
const SHARE_GAP_Y = 14;
const SHARE_COLUMNS = 3;
const SHARE_MAX_TABLES = 12;
const SHARE_GRID_TOP = 174;

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max - 1)}…` : value;
}

function rankedTables(schema: Schema) {
  const inbound = new Map<string, number>();
  for (const table of schema.tables) {
    for (const fk of table.foreignKeys) {
      inbound.set(fk.referencesTable, (inbound.get(fk.referencesTable) ?? 0) + 1);
    }
  }
  const score = (name: string, outbound: number) =>
    outbound + (inbound.get(name) ?? 0);

  return [...schema.tables].sort((a, b) => {
    const byConnections = score(b.name, b.foreignKeys.length) - score(a.name, a.foreignKeys.length);
    if (byConnections !== 0) return byConnections;
    if (b.columns.length !== a.columns.length) return b.columns.length - a.columns.length;
    return a.name.localeCompare(b.name);
  });
}

export function renderShareOgSvg(schema: Schema): string {
  const count = schema.tables.length;
  const shown = rankedTables(schema).slice(0, SHARE_MAX_TABLES);
  const more = count - shown.length;
  const title = `${count} ${count === 1 ? "table" : "tables"} at a glance`;

  const cards = shown
    .map((table, index) => {
      const col = index % SHARE_COLUMNS;
      const row = Math.floor(index / SHARE_COLUMNS);
      const x = 48 + col * (SHARE_CARD_WIDTH + SHARE_GAP_X);
      const y = SHARE_GRID_TOP + row * (SHARE_CARD_HEIGHT + SHARE_GAP_Y);
      const name = escapeXml(truncate(table.name.split(".").pop() ?? table.name, 22));
      const columnCount = table.columns.length;
      const fkCount = table.foreignKeys.length;
      const metrics = `${columnCount} ${columnCount === 1 ? "column" : "columns"} · ${fkCount} ${fkCount === 1 ? "FK" : "FKs"}`;
      return `<g transform="translate(${x} ${y})">
    <rect width="${SHARE_CARD_WIDTH}" height="${SHARE_CARD_HEIGHT}" rx="14" fill="#1e1e1e"/>
    <rect width="6" height="${SHARE_CARD_HEIGHT}" rx="3" fill="#3d7e16"/>
    <text x="24" y="37" font-family="${FONT_SANS}" font-size="26" font-weight="700" fill="#ffffff">${name}</text>
    <text x="24" y="64" font-family="${FONT_SANS}" font-size="15" fill="#a3bfa0">${escapeXml(metrics)}</text>
  </g>`;
    })
    .join("");

  const empty = count === 0
    ? `<text x="600" y="330" text-anchor="middle" font-family="${FONT_SANS}" font-size="28" fill="#4b5563">No tables in this schema</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BACKGROUND}"/>
  <rect x="48" y="40" width="190" height="30" rx="15" fill="#e3f4d4"/>
  <text x="143" y="60" text-anchor="middle" font-family="${FONT_SANS}" font-size="14" font-weight="700" letter-spacing="0.5" fill="#3d7e16">POSTGRESQL SCHEMA</text>
  <text x="1152" y="58" text-anchor="end" font-family="${FONT_SANS}" font-size="22" font-weight="700" fill="#1e1e1e">dbdiagramr.space</text>
  <text x="1152" y="82" text-anchor="end" font-family="${FONT_SANS}" font-size="13" fill="#4b5563">Free PostgreSQL ER diagrams</text>
  <text x="48" y="124" font-family="${FONT_SANS}" font-size="44" font-weight="700" fill="#1e1e1e">${escapeXml(title)}</text>
  <text x="48" y="154" font-family="${FONT_SANS}" font-size="18" fill="#4b5563">${more > 0 ? `Top ${shown.length} tables by relationships` : "All tables at a glance"}</text>
  ${cards}${empty}
  <line x1="48" y1="570" x2="1152" y2="570" stroke="#dbeccd" stroke-width="2"/>
  <text x="48" y="604" font-family="${FONT_SANS}" font-size="16" font-weight="700" fill="#1e1e1e">Interactive PostgreSQL ER diagram</text>
  <text x="1152" y="604" text-anchor="end" font-family="${FONT_SANS}" font-size="16" fill="#4b5563">${more > 0 ? `+${more} more ${more === 1 ? "table" : "tables"}` : "dbdiagramr.space"}</text>
</svg>`;
}

export function renderShareOgPng(schema: Schema): Uint8Array {
  return renderPng(renderShareOgSvg(schema));
}
