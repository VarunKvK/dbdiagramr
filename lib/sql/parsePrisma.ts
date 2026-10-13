import type { Column, ForeignKey, Schema, Table } from "@/lib/diagram";

// Prisma schema.prisma subset parser: model/enum blocks, scalar fields,
// @id/@unique/@default/@map/@relation, @@id/@@unique/@@map.
// Model-typed fields (relations) become diagram edges, not columns.

const PRISMA_TO_PG: Record<string, string> = {
  String: "text",
  Boolean: "boolean",
  Int: "integer",
  BigInt: "bigint",
  Float: "double precision",
  Decimal: "numeric",
  DateTime: "timestamptz",
  Json: "jsonb",
  Bytes: "bytea",
};

function stripComments(src: string): string {
  return src
    .split("\n")
    .map((line) => {
      let inStr = false;
      for (let i = 0; i < line.length - 1; i++) {
        const c = line[i];
        if (c === '"') inStr = !inStr;
        if (!inStr && c === "/" && line[i + 1] === "/") return line.slice(0, i);
      }
      return line;
    })
    .join("\n");
}

type Field = {
  name: string;
  typeBase: string;
  optional: boolean;
  isList: boolean;
  attrs: string;
};

function parseFieldLine(line: string): Field | null {
  const t = line.trim().replace(/;$/, "");
  if (!t || t.startsWith("@@")) return null;
  const m = t.match(/^([A-Za-z_][A-Za-z0-9_]*)\s+([A-Za-z_][A-Za-z0-9_.]*[\[\]?]*)\s*(.*)$/);
  if (!m) return null;
  let typeRaw = m[2];
  let optional = false;
  let isList = false;
  if (typeRaw.endsWith("?")) {
    optional = true;
    typeRaw = typeRaw.slice(0, -1);
  }
  if (typeRaw.endsWith("[]")) {
    isList = true;
    typeRaw = typeRaw.slice(0, -2);
  }
  return { name: m[1], typeBase: typeRaw, optional, isList, attrs: (m[3] ?? "").trim() };
}

export function parsePrismaToSchema(src: string): { schema: Schema; warnings: string[] } {
  const warnings: string[] = [];
  if (!src || !src.trim()) throw new Error("Paste a schema.prisma — models with fields and relations.");
  const clean = stripComments(src);
  if (!/\bmodel\s+[A-Za-z]/i.test(clean)) {
    throw new Error("No model blocks found. Paste a schema.prisma like:\n\nmodel User {\n  id Int @id\n  email String @unique\n}");
  }

  type Model = {
    name: string;
    tableName: string;
    fields: Field[];
    blockAttrs: string[];
  };
  const models: Model[] = [];
  const modelRe = /\bmodel\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{/gi;
  let m: RegExpExecArray | null;
  while ((m = modelRe.exec(clean)) !== null) {
    const name = m[1];
    // find matching close brace (no nesting in prisma blocks)
    const openIdx = clean.indexOf("{", m.index);
    const closeIdx = clean.indexOf("}", openIdx);
    if (closeIdx === -1) {
      warnings.push(`Unclosed model block ${name}`);
      continue;
    }
    modelRe.lastIndex = closeIdx + 1;
    const body = clean.slice(openIdx + 1, closeIdx);
    const fields: Field[] = [];
    const blockAttrs: string[] = [];
    for (const rawLine of body.split("\n")) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line.startsWith("@@")) {
        blockAttrs.push(line);
        continue;
      }
      const f = parseFieldLine(line);
      if (!f) {
        warnings.push(`Skipped line in model ${name}: ${line.slice(0, 50)}`);
        continue;
      }
      fields.push(f);
    }
    const mapM = blockAttrs.join("\n").match(/@@map\(\s*"([^"]+)"\s*\)/);
    models.push({ name, tableName: mapM ? mapM[1] : name, fields, blockAttrs });
  }

  const modelNames = new Set(models.map((x) => x.name));
  // Models targeted by an explicit @relation — their back-relation fields
  // (e.g. posts Post[] on User) are normal and skipped silently.
  const relationTargets = new Set<string>();
  for (const model of models) {
    for (const f of model.fields) {
      if (modelNames.has(f.typeBase) && /@relation\(\s*fields\s*:/.test(f.attrs)) {
        relationTargets.add(f.typeBase);
      }
    }
  }
  const tables: Table[] = [];

  for (const model of models) {
    const columns: Column[] = [];
    const fks: ForeignKey[] = [];
    // @@id composite keys
    const idBlock = model.blockAttrs.join("\n").match(/@@id\(\s*\[([^\]]+)\]\s*\)/);
    const idFields = idBlock ? idBlock[1].split(",").map((s) => s.trim()) : [];

    for (const f of model.fields) {
      const isRelation = modelNames.has(f.typeBase);
      if (isRelation) {
        // @relation(fields: [a], references: [b])
        const rel = f.attrs.match(/@relation\(\s*fields\s*:\s*\[([^\]]*)\]\s*,\s*references\s*:\s*\[([^\]]*)\]/);
        if (rel) {
          const localCols = rel[1].split(",").map((s) => s.trim()).filter(Boolean);
          const refCols = rel[2].split(",").map((s) => s.trim()).filter(Boolean);
          const target = models.find((x) => x.name === f.typeBase)!;
          localCols.forEach((lc, i) => {
            const localField = model.fields.find((x) => x.name === lc);
            const refField = target.fields.find((x) => x.name === (refCols[i] ?? refCols[0]));
            fks.push({
              column: localField
                ? (localField.attrs.match(/@map\("([^"]+)"\)/)?.[1] ?? lc)
                : lc,
              referencesTable: target.tableName,
              referencesColumn: refField
                ? (refField.attrs.match(/@map\("([^"]+)"\)/)?.[1] ?? refField.name)
                : (refCols[i] ?? refCols[0] ?? "id"),
            });
          });
        } else if (!relationTargets.has(model.name)) {
          warnings.push(
            `Relation ${model.name}.${f.name} has no fields/references — skipped. Only explicit @relation(fields, references) is supported.`
          );
        }
        // else: back-relation of an explicit relation — skip silently
        continue; // relation fields are not columns
      }
      // scalar or enum-typed field -> column
      const pgType = PRISMA_TO_PG[f.typeBase] ?? f.typeBase.toLowerCase();
      const colMap = f.attrs.match(/@map\("([^"]+)"\)/);
      const colName = colMap ? colMap[1] : f.name;
      const isPk =
        /@id\b/.test(f.attrs) ||
        idFields.includes(f.name);
      let defVal: string | null = null;
      const defM = f.attrs.match(/@default\(([^)]+)\)/);
      if (defM) {
        const d = defM[1].trim();
        if (/^autoincrement\(\)$/i.test(d)) defVal = null;
        else if (/^now\(\)$/i.test(d)) defVal = "now()";
        else if (/^dbgenerated\(/i.test(d)) {
          const inner = d.match(/^dbgenerated\("([^"]+)"\)$/i);
          defVal = inner ? inner[1] : null;
        } else if (/^uuid\(\)$/i.test(d)) defVal = "gen_random_uuid()";
        else if (/^cuid\(\)$/i.test(d)) defVal = null;
        else defVal = d;
      }
      columns.push({
        name: colName,
        type: f.isList ? `${pgType}[]` : pgType,
        nullable: f.optional && !isPk ? "YES" : "NO",
        default: defVal,
        isPrimaryKey: isPk,
      });
    }
    tables.push({ name: model.tableName, columns, foreignKeys: fks });
  }

  if (tables.length === 0) throw new Error("No models parsed from this schema.prisma.");
  return { schema: { tables }, warnings };
}
