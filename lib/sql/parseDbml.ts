import type { Column, ForeignKey, Schema, Table } from "@/lib/diagram";

// DBML subset parser: Table blocks, Enum blocks, Ref lines/blocks.
// Covers the common real-world subset; Project/TableGroup/indexes are ignored.
// https://dbml.dbdiagram.io/docs/

function stripLineComments(src: string): string {
  return src
    .split("\n")
    .map((line) => {
      let inSingle = false;
      let inBacktick = false;
      for (let i = 0; i < line.length - 1; i++) {
        const c = line[i];
        if (c === "'" && !inBacktick) inSingle = !inSingle;
        else if (c === "`" && !inSingle) inBacktick = !inBacktick;
        if (!inSingle && !inBacktick && c === "/" && line[i + 1] === "/") {
          return line.slice(0, i);
        }
      }
      return line;
    })
    .join("\n");
}

function splitSettings(raw: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let depth = 0;
  let inSingle = false;
  let inBacktick = false;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "'" && !inBacktick) inSingle = !inSingle;
    else if (c === "`" && !inSingle) inBacktick = !inBacktick;
    else if (!inSingle && !inBacktick) {
      if (c === "(") depth++;
      else if (c === ")") depth = Math.max(0, depth - 1);
      else if (c === "," && depth === 0) {
        parts.push(cur.trim());
        cur = "";
        continue;
      }
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function parseColumnLine(
  line: string
): { col: Column; enumRef?: string } | null {
  const trimmed = line.trim().replace(/;$/, "");
  if (!trimmed) return null;
  // name may be quoted
  const nameMatch = trimmed.match(/^("([^"]+)"|([A-Za-z0-9_]+))\s+([\s\S]*)$/);
  if (!nameMatch) return null;
  const name = nameMatch[2] ?? nameMatch[3];
  let rest = nameMatch[4].trim();
  let settings: string[] = [];
  const lb = rest.lastIndexOf("[");
  const rb = rest.lastIndexOf("]");
  if (lb !== -1 && rb > lb) {
    settings = splitSettings(rest.slice(lb + 1, rb));
    rest = rest.slice(0, lb).trim();
  }
  const type = rest || "text";

  let nullable = "YES";
  let isPrimaryKey = false;
  let defVal: string | null = null;
  for (const s of settings) {
    const low = s.toLowerCase();
    if (low === "pk" || low === "primary key") isPrimaryKey = true;
    else if (low === "not null") nullable = "NO";
    else if (low === "null") nullable = "YES";
    else if (low.startsWith("default:")) {
      defVal = s.slice(8).trim().replace(/^`|`$/g, "");
    }
  }
  if (isPrimaryKey) nullable = "NO";
  return {
    col: { name, type, nullable, default: defVal, isPrimaryKey },
  };
}

function extractBlockBody(src: string, openIdx: number): { body: string; end: number } {
  let depth = 0;
  let inSingle = false;
  for (let i = openIdx; i < src.length; i++) {
    const c = src[i];
    if (c === "'") inSingle = !inSingle;
    if (inSingle) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return { body: src.slice(openIdx + 1, i), end: i };
    }
  }
  return { body: src.slice(openIdx + 1), end: src.length };
}

type OwnedFk = ForeignKey & { __table: string };

function parseRefLine(line: string): OwnedFk[] {
  // forms: a.b > c.d | a.b < c.d | a.b - c.d (single or comma-separated pairs)
  const out: OwnedFk[] = [];
  const m = line.match(/^(.+?)\s*(<|>|<>|-)(\s*(.+))?$/);
  if (!m) return out;
  const left = m[1].trim();
  const op = m[2];
  const right = (m[4] ?? "").trim();
  if (!right) return out;
  const lp = left.split(".");
  const rp = right.split(".");
  if (lp.length !== 2 || rp.length !== 2) return out;
  const lcol = lp[1].replace(/^"|"$/g, "");
  const ltab = lp[0].replace(/^"|"$/g, "");
  const rcol = rp[1].replace(/^"|"$/g, "");
  const rtab = rp[0].replace(/^"|"$/g, "");
  if (op === "<") {
    out.push({ column: rcol, referencesTable: ltab, referencesColumn: lcol, __table: rtab });
  } else {
    out.push({ column: lcol, referencesTable: rtab, referencesColumn: rcol, __table: ltab });
  }
  return out;
}

export function parseDbmlToSchema(src: string): { schema: Schema; warnings: string[] } {
  const warnings: string[] = [];
  if (!src || !src.trim()) throw new Error("Paste DBML — e.g. Table users { id integer [pk] }.");
  const clean = stripLineComments(src);
  if (!/\b(Table|Enum|Ref)\b/i.test(clean)) {
    throw new Error("No Table, Enum, or Ref blocks found. Paste DBML like:\n\nTable users {\n  id integer [pk]\n  email varchar [not null]\n}");
  }

  const tables: Table[] = [];
  const tableMap = new Map<string, Table>();
  const pendingFks: OwnedFk[] = [];

  // Table blocks (skip nested indexes { } blocks inside)
  const tableRe = /\bTable\s+("([^"]+)"|([A-Za-z0-9_]+))(?:\s*\[[^\]]*\])?\s*\{/gi;
  let m: RegExpExecArray | null;
  while ((m = tableRe.exec(clean)) !== null) {
    const name = m[2] ?? m[3];
    const openIdx = clean.indexOf("{", m.index);
    const { body, end } = extractBlockBody(clean, openIdx);
    tableRe.lastIndex = end + 1;
    const columns: Column[] = [];
    const fks: ForeignKey[] = [];
    // drop nested indexes blocks
    const flat = body.replace(/\bindexes\s*\{[^}]*\}/gi, " ");
    for (const rawLine of flat.split("\n")) {
      const line = rawLine.trim();
      if (!line || /^Note:/i.test(line)) continue;
      const parsed = parseColumnLine(line);
      if (!parsed) {
        warnings.push(`Skipped line in table ${name}: ${line.slice(0, 50)}`);
        continue;
      }
      columns.push(parsed.col);
    }
    const table: Table = { name, columns, foreignKeys: fks };
    tables.push(table);
    tableMap.set(name, table);
  }

  // Enum blocks (kept as documentation only — enums don't change the diagram)
  const enumRe = /\bEnum\s+("([^"]+)"|([A-Za-z0-9_]+))\s*\{/gi;
  while ((m = enumRe.exec(clean)) !== null) {
    const openIdx = clean.indexOf("{", m.index);
    const { end } = extractBlockBody(clean, openIdx);
    enumRe.lastIndex = end + 1;
  }

  // Single-line refs: Ref: a.b > c.d
  for (const line of clean.split("\n")) {
    const t = line.trim().replace(/;$/, "");
    const rm = t.match(/^Ref\s*:\s*(.+)$/i);
    if (rm) {
      const fks = parseRefLine(rm[1]);
      if (fks.length === 0) warnings.push(`Could not parse ref: ${t.slice(0, 60)}`);
      pendingFks.push(...fks);
    }
  }

  // Ref blocks: Ref name { a.b > c.d ... }
  const refBlockRe = /\bRef\s+([A-Za-z0-9_]+)?\s*\{/gi;
  while ((m = refBlockRe.exec(clean)) !== null) {
    const openIdx = clean.indexOf("{", m.index);
    const { body, end } = extractBlockBody(clean, openIdx);
    refBlockRe.lastIndex = end + 1;
    for (const rawLine of body.split("\n")) {
      const line = rawLine.trim().replace(/;$/, "");
      if (!line) continue;
      const fks = parseRefLine(line);
      if (fks.length === 0) warnings.push(`Could not parse ref: ${line.slice(0, 60)}`);
      pendingFks.push(...fks);
    }
  }

  for (const fk of pendingFks) {
    const owner = tableMap.get(fk.__table);
    if (owner) {
      const { __table: _drop, ...cleanFk } = fk;
      void _drop;
      owner.foreignKeys.push(cleanFk);
    } else {
      warnings.push(`Ref to unknown table ${fk.__table}`);
    }
  }

  if (tables.length === 0) {
    throw new Error("No Table blocks found. Paste DBML like:\n\nTable users {\n  id integer [pk]\n}");
  }
  return { schema: { tables }, warnings };
}
