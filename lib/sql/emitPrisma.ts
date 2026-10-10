import type { Schema } from "@/lib/diagram";

// Schema -> Prisma schema.prisma (PostgreSQL provider). Two passes: models
// first, then back-relations collected from foreign keys.

function toPascal(s: string): string {
  const clean = s.replace(/[^a-zA-Z0-9_]+/g, "_").replace(/^_+|_+$/g, "");
  const parts = clean.split("_").filter(Boolean);
  const name = parts.map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join("");
  return /^[A-Za-z]/.test(name) ? name : `Model${name}`;
}

function toCamel(s: string): string {
  const p = toPascal(s);
  return p.charAt(0).toLowerCase() + p.slice(1);
}

function mapType(pgType: string): { scalar: string; native: string | null } {
  const t = pgType.toLowerCase().replace(/\(.*\)/, "").trim();
  const isArray = /(\[\])$/.test(t) || pgType.trim().endsWith("[]");
  const base = t.replace(/\[\]$/, "");
  let scalar = "String";
  let native: string | null = null;
  if (/^(smallint|integer|int|serial)$/.test(base)) scalar = "Int";
  else if (/^(bigint|bigserial)$/.test(base)) scalar = "BigInt";
  else if (/^(numeric|decimal|real|double|float|money)$/.test(base)) scalar = "Decimal";
  else if (/^boolean$/.test(base)) scalar = "Boolean";
  else if (/^uuid$/.test(base)) { scalar = "String"; native = "@db.Uuid"; }
  else if (/timestamp/.test(base)) { scalar = "DateTime"; native = base.includes("tz") ? "@db.Timestamptz" : "@db.Timestamp"; }
  else if (/^date$/.test(base)) { scalar = "DateTime"; native = "@db.Date"; }
  else if (/^time$/.test(base)) { scalar = "DateTime"; native = "@db.Time"; }
  else if (/^jsonb?$/.test(base)) scalar = "Json";
  else if (/^bytea$/.test(base)) scalar = "Bytes";
  else if (/varchar|character|char|text|citext|name/.test(base)) scalar = "String";
  // enums / domains / unknown stay String (user refines to enum)
  return { scalar: isArray ? `${scalar}[]` : scalar, native: isArray ? null : native };
}

export function schemaToPrisma(schema: Schema): string {
  const modelOf = new Map<string, string>();
  for (const t of schema.tables) modelOf.set(t.name, toPascal(t.name));

  // back-relations: referencedModel -> [{ field, fromModel }]
  const backRefs = new Map<string, { field: string; fromModel: string }[]>();
  for (const t of schema.tables) {
    for (const fk of t.foreignKeys) {
      const fromModel = modelOf.get(t.name)!;
      const toModel = modelOf.get(fk.referencesTable) ?? toPascal(fk.referencesTable);
      const list = backRefs.get(toModel) ?? [];
      list.push({ field: toCamel(t.name), fromModel });
      backRefs.set(toModel, list);
    }
  }

  const out: string[] = [
    "generator client {",
    '  provider = "prisma-client-js"',
    "}",
    "",
    "datasource db {",
    '  provider = "postgresql"',
    "  url      = env(\"DATABASE_URL\")",
    "}",
    "",
  ];

  for (const t of schema.tables) {
    const model = modelOf.get(t.name)!;
    out.push(`model ${model} {`);
    for (const c of t.columns) {
      const { scalar, native } = mapType(c.type);
      const field = toCamel(c.name);
      const attrs: string[] = [];
      if (c.isPrimaryKey) attrs.push("@id");
      if (c.default && /gen_random_uuid|uuid_generate/i.test(c.default)) {
        attrs.push("@default(dbgenerated(\"gen_random_uuid()\"))");
      } else if (c.default && /now\(\)|CURRENT_TIMESTAMP/i.test(c.default)) {
        attrs.push("@default(now())");
      }
      if (native) attrs.push(native);
      const optional = c.nullable === "YES" && !c.isPrimaryKey ? "?" : "";
      // align columns loosely
      out.push(`  ${field} ${scalar}${optional}${attrs.length ? " " + attrs.join(" ") : ""}`);
    }
    for (const fk of t.foreignKeys) {
      const toModel = modelOf.get(fk.referencesTable) ?? toPascal(fk.referencesTable);
      const relField = toCamel(toModel);
      const fkField = toCamel(fk.column);
      out.push(
        `  ${relField} ${toModel} @relation(fields: [${fkField}], references: [${toCamel(fk.referencesColumn)}])`
      );
    }
    for (const b of backRefs.get(model) ?? []) {
      out.push(`  ${b.field} ${b.fromModel}[]`);
    }
    // @@map when the model name differs from the table name
    if (model.toLowerCase() !== t.name.toLowerCase()) {
      out.push(`  @@map("${t.name}")`);
    }
    out.push("}", "");
  }

  return out.join("\n").trimEnd() + "\n";
}
