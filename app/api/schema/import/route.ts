import { NextRequest, NextResponse } from "next/server";
import type { Schema } from "@/lib/diagram";

function isValidSchema(obj: unknown): obj is Schema {
  if (!obj || typeof obj !== "object") return false;
  const s = obj as { tables?: unknown };
  if (!Array.isArray(s.tables)) return false;
  for (const t of s.tables) {
    if (!t || typeof t !== "object") return false;
    const table = t as { name?: unknown; columns?: unknown; foreignKeys?: unknown };
    if (typeof table.name !== "string" || !Array.isArray(table.columns) || !Array.isArray(table.foreignKeys)) return false;
    for (const c of table.columns) {
      if (!c || typeof c !== "object") return false;
      const col = c as { name?: unknown; type?: unknown; nullable?: unknown; isPrimaryKey?: unknown };
      if (typeof col.name !== "string" || typeof col.type !== "string" || typeof col.nullable !== "string" || typeof col.isPrimaryKey !== "boolean") return false;
    }
    for (const fk of table.foreignKeys) {
      if (!fk || typeof fk !== "object") return false;
      const f = fk as { column?: unknown; referencesTable?: unknown; referencesColumn?: unknown };
      if (typeof f.column !== "string" || typeof f.referencesTable !== "string" || typeof f.referencesColumn !== "string") return false;
    }
  }
  return true;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON", details: "Paste the JSON result of the magic query — not the query itself." }, { status: 400 });
  }

  // Accept either {tables} directly or {schema:{tables}} or raw json_build_object output
  let schemaCandidate: unknown = body;

  if (body && typeof body === "object") {
    const b = body as Record<string, unknown>;
    // If user pasted raw DB output like {schema:{tables:[]}} or {schema: string}
    if (b.schema && typeof b.schema === "object") schemaCandidate = b.schema;
    else if (typeof b.schema === "string") {
      try { schemaCandidate = JSON.parse(b.schema as string); } catch { /* keep */ }
    }
    // If pasted array-wrapped result from SELECT ... AS schema → might be [{schema:{...}}] via some clients
    if (Array.isArray(b) && (b as unknown[])[0]) {
      const first = (b as Record<string, unknown>[])[0];
      if (first.schema) schemaCandidate = first.schema;
    }
    // Also handle {tables} wrapped in "schema" stringified json
    if (b.tables === undefined && typeof b.schema === "string") {
      try { schemaCandidate = JSON.parse(b.schema as string); } catch {}
    }
  }

  // If stringified JSON was pasted directly (common when copying from table view), try parse
  if (typeof schemaCandidate === "string") {
    try {
      schemaCandidate = JSON.parse(schemaCandidate as string);
    } catch {
      return NextResponse.json({ error: "Invalid schema JSON", details: "Could not parse JSON. Make sure you copied the full JSON value from the query result (the 'schema' column)." }, { status: 400 });
    }
  }

  // Handle double-wrapped {tables: ...} inside json
  if (!isValidSchema(schemaCandidate)) {
    // Try to unwrap one more level if user pasted the outer json_build_object result which is {tables: [...]}
    if (schemaCandidate && typeof schemaCandidate === "object" && "tables" in (schemaCandidate as Record<string, unknown>)) {
      // already shape, but isValidSchema failed due to malformed columns — give details
    }
    return NextResponse.json(
      { error: "Invalid schema shape", details: "Expected { tables: [{ name, columns: [{ name, type, nullable, default, isPrimaryKey }], foreignKeys: [{ column, referencesTable, referencesColumn }] }] }. If you pasted the query itself, run it first in your SQL editor and paste the result, not the query." },
      { status: 400 }
    );
  }

  const schema = schemaCandidate as Schema;

  // Sanitize: trim names, ensure defaults
  const sanitized: Schema = {
    tables: schema.tables.map((t) => ({
      name: String(t.name).trim(),
      columns: t.columns.map((c) => ({
        name: String(c.name).trim(),
        type: String(c.type),
        nullable: c.nullable === "YES" ? "YES" : "NO",
        default: c.default ?? null,
        isPrimaryKey: !!c.isPrimaryKey,
      })),
      foreignKeys: t.foreignKeys.map((fk) => ({
        column: String(fk.column).trim(),
        referencesTable: String(fk.referencesTable).trim(),
        referencesColumn: String(fk.referencesColumn).trim(),
      })),
    })),
  };

  if (sanitized.tables.length === 0) {
    return NextResponse.json({ error: "No tables found", details: "The pasted schema has 0 tables. Check you ran the query against a database with tables in the public schema." }, { status: 400 });
  }

  return NextResponse.json(sanitized, { status: 200 });
}
