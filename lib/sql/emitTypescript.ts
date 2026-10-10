import type { Schema } from "@/lib/diagram";

// Schema -> TypeScript interfaces + Zod schemas.

function toPascal(s: string): string {
  const clean = s.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  const parts = clean.split("_").filter(Boolean);
  const name =
    parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("") || "Row";
  return /^[A-Za-z_$]/.test(name) ? name : `Row${name}`;
}

function mapTs(pgType: string): string {
  const t = pgType.toLowerCase().replace(/\(.*\)/, "").trim();
  const isArray = pgType.trim().endsWith("[]");
  const base = t.replace(/\[\]$/, "");
  let scalar = "string";
  if (/^(smallint|integer|int|serial|bigint|bigserial|numeric|decimal|real|double|float|money)$/.test(base))
    scalar = "number";
  else if (/^boolean$/.test(base)) scalar = "boolean";
  else if (/timestamp|date|time/.test(base)) scalar = "Date";
  else if (/^jsonb?$/.test(base)) scalar = "unknown";
  else if (/^bytea$/.test(base)) scalar = "Buffer";
  return isArray ? `${scalar}[]` : scalar;
}

function mapZod(pgType: string): string {
  const t = pgType.toLowerCase().replace(/\(.*\)/, "").trim();
  const isArray = pgType.trim().endsWith("[]");
  const base = t.replace(/\[\]$/, "");
  let z = "z.string()";
  if (/^(smallint|integer|int|serial|bigint|bigserial|numeric|decimal|real|double|float|money)$/.test(base))
    z = "z.number()";
  else if (/^boolean$/.test(base)) z = "z.boolean()";
  else if (/timestamp|date|time/.test(base)) z = "z.coerce.date()";
  else if (/^jsonb?$/.test(base)) z = "z.unknown()";
  else if (/^uuid$/.test(base)) z = "z.string().uuid()";
  else if (/^bytea$/.test(base)) z = "z.instanceof(Buffer)";
  return isArray ? `z.array(${z})` : z;
}

export function schemaToTypescript(schema: Schema): string {
  const out: string[] = [];
  for (const t of schema.tables) {
    const name = toPascal(t.name);
    out.push(`export interface ${name} {`);
    for (const c of t.columns) {
      const opt = c.nullable === "YES" && !c.isPrimaryKey ? "?" : "";
      const nul = c.nullable === "YES" && !c.isPrimaryKey ? " | null" : "";
      out.push(`  ${c.name}${opt}: ${mapTs(c.type)}${nul};`);
    }
    out.push("}", "");
  }
  return out.join("\n").trimEnd() + "\n";
}

export function schemaToZod(schema: Schema): string {
  const out: string[] = ['import { z } from "zod";', ""];
  for (const t of schema.tables) {
    const name = toPascal(t.name);
    out.push(`export const ${name}Schema = z.object({`);
    for (const c of t.columns) {
      const base = mapZod(c.type);
      const zod =
        c.nullable === "YES" && !c.isPrimaryKey ? `${base}.nullable()` : base;
      out.push(`  ${c.name}: ${zod},`);
    }
    out.push("});", "");
    out.push(`export type ${name} = z.infer<typeof ${name}Schema>;`, "");
  }
  return out.join("\n").trimEnd() + "\n";
}
