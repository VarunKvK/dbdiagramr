import { getAllSchemaEntries, getSchemaEntry } from "@/data/schemas/registry";
import { renderSchemaPng } from "@/lib/schemaImage";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function generateStaticParams() {
  return getAllSchemaEntries().map((entry) => ({ slug: entry.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  const entry = getSchemaEntry(params.slug);
  if (!entry) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const png = renderSchemaPng(entry.schema);
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
