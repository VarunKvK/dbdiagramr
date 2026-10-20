import path from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { diagramBounds, renderDiagramSVG } from "@/lib/diagram";
import { layoutSchema } from "@/lib/diagramLayout";
import { decodeSchema } from "@/lib/share";

export const runtime = "nodejs";

const MAX_TABLES = 200;
const WIDTH = 1200;
const HEIGHT = 630;
const BACKGROUND = "#f3ffe6";

const FOOTER = 46;
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

function frame(svg: string, layout: ReturnType<typeof layoutSchema>, tableCount: number): string {
  const { minX, minY, vw, vh } = diagramBounds(layout);
  const scale = Math.min(WIDTH / vw, 1.6);
  const contentHeight = HEIGHT - FOOTER;
  const scaledHeight = vh * scale;
  const tx = (WIDTH - vw * scale) / 2 - minX * scale;
  const ty =
    scaledHeight <= contentHeight
      ? (contentHeight - scaledHeight) / 2 - minY * scale
      : 18 - minY * scale;
  const body = svg.replace(/^<svg\b[^>]*>/, "").replace(/<\/svg>\s*$/, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${BACKGROUND}"/>
  <g transform="translate(${tx} ${ty}) scale(${scale})">${body}</g>
  <rect x="0" y="${HEIGHT - FOOTER}" width="${WIDTH}" height="${FOOTER}" fill="${BACKGROUND}"/>
  <text x="32" y="${HEIGHT - 17}" font-family="${FONT_SANS}" font-size="16" fill="#4b5563">${tableCount} ${tableCount === 1 ? "table" : "tables"}</text>
  <text x="${WIDTH - 32}" y="${HEIGHT - 17}" text-anchor="end" font-family="${FONT_SANS}" font-size="16" fill="#4b5563">Made with dbdiagramr</text>
</svg>`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const payload = url.searchParams.get("d") ?? "";
  const schema = await decodeSchema(payload);
  if (!schema || schema.tables.length === 0 || schema.tables.length > MAX_TABLES) {
    return new Response("Not found", { status: 404 });
  }

  const layout = layoutSchema(schema);
  const svg = frame(withFonts(withoutGlow(renderDiagramSVG(schema, layout))), layout, schema.tables.length);

  try {
    const resvg = new Resvg(svg, {
      background: BACKGROUND,
      font: {
        loadSystemFonts: false,
        defaultFontFamily: FONT_SANS,
        fontFiles: [
          path.join(process.cwd(), "app/fonts/LiberationSans-Regular.ttf"),
          path.join(process.cwd(), "app/fonts/LiberationMono-Regular.ttf"),
        ],
      },
    });
    const png = resvg.render().asPng();
    return new Response(new Uint8Array(png), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    return new Response("Render failed", { status: 500 });
  }
}
