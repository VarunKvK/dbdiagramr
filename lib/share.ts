import type { Schema } from "@/lib/diagram";

const VERSION = "1";
const MAX_PAYLOAD = 20000;

// Public links put the compressed schema in the path. Vercel rejects request
// URLs over 14 KB (https://vercel.com/docs/errors/url_too_long), and common
// proxies default to an 8 KB request line. Measured payloads: the largest of
// the 16 built-in schemas is 1,665 chars (pagila, 16 tables); a representative
// 20-table schema is 1,926. 5,000 leaves ~3 KB below the 8 KB proxy limit and
// ~9 KB below Vercel's hard limit. Do not raise this above 8,000.
export const MAX_PUBLIC_PAYLOAD = 5000;

export type ShareKind = "private" | "public";

export function buildShareUrl(
  origin: string,
  payload: string,
  kind: ShareKind
): string | null {
  if (!payload) return null;
  if (kind === "public" && payload.length > MAX_PUBLIC_PAYLOAD) return null;
  const base = origin.replace(/\/+$/, "");
  return kind === "private"
    ? `${base}/visualize#s=${payload}`
    : `${base}/s/${payload}`;
}

export function buildShareDescription(schema: Schema): string {
  const count = schema.tables.length;
  if (count === 0) {
    return "Interactive ER diagram of a PostgreSQL schema. Explore tables, columns and foreign keys with dbdiagramr.";
  }

  if (count > 50) {
    return `Interactive ER diagram of a PostgreSQL schema with ${count} tables. Explore tables, columns and foreign keys with dbdiagramr.`;
  }

  const names = schema.tables.slice(0, 3).map((table) => {
    const short = table.name.split(".").pop() ?? table.name;
    return short.length > 24 ? `${short.slice(0, 23)}…` : short;
  });
  const more = count - names.length;
  const suffix = more > 0 ? ` and ${more} more` : "";
  return `Interactive ER diagram of a PostgreSQL schema with ${count} ${
    count === 1 ? "table" : "tables"
  }: ${names.join(", ")}${suffix}. Explore tables, columns and foreign keys with dbdiagramr.`;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded + "=".repeat((4 - (padded.length % 4)) % 4));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function deflate(input: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(input);
  const stream = new Blob([copy]).stream().pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function inflate(input: Uint8Array): Promise<Uint8Array> {
  const copy = new Uint8Array(input);
  const stream = new Blob([copy]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

export async function encodeSchema(schema: Schema): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(schema));
  const packed = await deflate(json);
  return `${VERSION}.${toBase64Url(packed)}`;
}

function isSchema(value: unknown): value is Schema {
  return (
    typeof value === "object" &&
    value !== null &&
    Array.isArray((value as { tables?: unknown }).tables)
  );
}

export async function decodeSchema(payload: string): Promise<Schema | null> {
  const trimmed = payload.trim();
  if (!trimmed || trimmed.length > MAX_PAYLOAD) return null;
  const dot = trimmed.indexOf(".");
  if (dot !== 1 || trimmed[0] !== VERSION) return null;
  try {
    const bytes = await inflate(fromBase64Url(trimmed.slice(2)));
    const parsed: unknown = JSON.parse(new TextDecoder().decode(bytes));
    return isSchema(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
