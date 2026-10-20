import type { Schema } from "@/lib/diagram";

const VERSION = "1";
const MAX_PAYLOAD = 20000;

export const MAX_PUBLIC_PAYLOAD = 5000;

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
