import { renderShareOgPng } from "@/lib/schemaImage";
import { decodeSchema } from "@/lib/share";

export const runtime = "nodejs";

const MAX_TABLES = 200;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const payload = url.searchParams.get("d") ?? "";
  const schema = await decodeSchema(payload);
  if (!schema || schema.tables.length === 0 || schema.tables.length > MAX_TABLES) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const png = renderShareOgPng(schema);
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
