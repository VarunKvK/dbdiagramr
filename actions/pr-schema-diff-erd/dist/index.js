"use strict";

// src/index.ts
var import_node_child_process = require("node:child_process");
var import_node_fs = require("node:fs");

// src/lib/parsePostgres.ts
function stripComments(sql) {
  let out = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  const lines = out.split("\n");
  out = lines.map((line) => {
    let inSingle = false;
    let inDouble = false;
    for (let i = 0; i < line.length - 1; i++) {
      const c = line[i];
      const nxt = line[i + 1];
      if (c === "'" && !inDouble) {
        if (line[i + 1] === "'") {
          i++;
          continue;
        }
        inSingle = !inSingle;
      } else if (c === '"' && !inSingle) {
        inDouble = !inDouble;
      }
      if (!inSingle && !inDouble && c === "-" && nxt === "-") {
        return line.slice(0, i);
      }
    }
    return line;
  }).join("\n");
  return out;
}
function splitStatements(sql) {
  const stmts = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  let inDollar = false;
  let dollarTag = "";
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    if (!inSingle && !inDouble && c === "$") {
      const rest = sql.slice(i);
      const m = rest.match(/^\$([A-Za-z0-9_]*)\$/);
      if (m) {
        const tag = m[0];
        if (!inDollar) {
          inDollar = true;
          dollarTag = tag;
          cur += tag;
          i += tag.length - 1;
          continue;
        } else if (tag === dollarTag) {
          inDollar = false;
          dollarTag = "";
          cur += tag;
          i += tag.length - 1;
          continue;
        }
      }
    }
    if (inDollar) {
      cur += c;
      continue;
    }
    if (c === "'" && !inDouble) {
      if (sql[i + 1] === "'") {
        cur += "''";
        i++;
        continue;
      }
      inSingle = !inSingle;
      cur += c;
      continue;
    }
    if (c === '"' && !inSingle) {
      if (sql[i + 1] === '"') {
        cur += '""';
        i++;
        continue;
      }
      inDouble = !inDouble;
      cur += c;
      continue;
    }
    if (!inSingle && !inDouble && c === ";") {
      if (cur.trim()) stmts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) stmts.push(cur.trim());
  return stmts;
}
function extractTableName(createStmt) {
  const m = createStmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:ONLY\s+)?(?:"([^"]+)"|([A-Za-z0-9_."]+))\s*\(/i);
  if (!m) return null;
  const raw = m[1] ?? m[2];
  const parts = raw.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
  return parts[parts.length - 1];
}
function findMatchingParen(str, startIdx) {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = startIdx; i < str.length; i++) {
    const c = str[i];
    if (c === "'" && !inDouble) {
      if (str[i + 1] === "'") {
        i++;
        continue;
      }
      inSingle = !inSingle;
      continue;
    }
    if (c === '"' && !inSingle) {
      if (str[i + 1] === '"') {
        i++;
        continue;
      }
      inDouble = !inDouble;
      continue;
    }
    if (inSingle || inDouble) continue;
    if (c === "(") depth++;
    else if (c === ")") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}
function splitCommaDepth0(s) {
  const parts = [];
  let cur = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "'" && !inDouble) {
      if (s[i + 1] === "'") {
        cur += "''";
        i++;
        continue;
      }
      inSingle = !inSingle;
      cur += c;
      continue;
    }
    if (c === '"' && !inSingle) {
      if (s[i + 1] === '"') {
        cur += '""';
        i++;
        continue;
      }
      inDouble = !inDouble;
      cur += c;
      continue;
    }
    if (inSingle || inDouble) {
      cur += c;
      continue;
    }
    if (c === "(") depth++;
    else if (c === ")") depth = Math.max(0, depth - 1);
    else if (c === "," && depth === 0) {
      parts.push(cur.trim());
      cur = "";
      continue;
    }
    cur += c;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}
function normalizeIdent(raw) {
  return raw.replace(/^"|"$/g, "").trim();
}
function extractRefTableAndCol(referencesClause) {
  const m = referencesClause.match(/REFERENCES\s+(?:"([^"]+)"|([A-Za-z0-9_."]+))(?:\s*\(\s*"?([^"\s\)]+)"?\s*\))?/i);
  if (!m) return null;
  const rawTable = m[1] ?? m[2];
  const col = m[3] ?? "id";
  const tableParts = rawTable.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
  const table = tableParts[tableParts.length - 1];
  return { table, col: normalizeIdent(col) };
}
function parseColumnDef(def) {
  const trimmed = def.trim();
  if (!trimmed) return { skip: true };
  const upper = trimmed.toUpperCase();
  if (upper.startsWith("PRIMARY KEY") || upper.startsWith("FOREIGN KEY") || upper.startsWith("CONSTRAINT") || upper.startsWith("UNIQUE") || upper.startsWith("CHECK") || upper.startsWith("EXCLUDE")) {
    return { skip: true };
  }
  const nameMatch = trimmed.match(/^\s*(?:"([^"]+)"|([A-Za-z0-9_]+))\s+/);
  if (!nameMatch) return { skip: true };
  const colName = normalizeIdent(nameMatch[1] ?? nameMatch[2]);
  const rest = trimmed.slice(nameMatch[0].length);
  const restUpper = rest.toUpperCase();
  const constraintKeywords = [" NOT NULL", " NULL", " DEFAULT", " PRIMARY KEY", " PRIMARY", " REFERENCES", " UNIQUE", " CHECK", " COLLATE"];
  let typeEnd = rest.length;
  const ubRest = " " + restUpper;
  for (const kw of constraintKeywords) {
    const idx = ubRest.indexOf(kw);
    if (idx !== -1) {
      const absIdx = idx - 1;
      if (absIdx >= 0 && absIdx < typeEnd) typeEnd = absIdx;
    }
  }
  let type = rest.slice(0, typeEnd).trim();
  if (!type) type = "text";
  const nullable = restUpper.includes("NOT NULL") ? "NO" : "YES";
  let defVal = null;
  const defMatch = rest.match(/DEFAULT\s+((?:'(?:''|[^'])*'|"(?:[^"])*"|\$\$[\s\S]*?\$\$|\S+)(?:\s*\([^)]*\))?)/i);
  if (defMatch) {
    let rawDef = defMatch[1].trim();
    rawDef = rawDef.replace(/,$/, "");
    defVal = rawDef;
  } else {
    const altDef = rest.match(/DEFAULT\s+([^\s,]+)/i);
    if (altDef) defVal = altDef[1];
  }
  if (defVal === "") defVal = null;
  const isPrimaryKey = /\bPRIMARY\s+KEY\b/i.test(rest);
  let fk;
  const refIdx = restUpper.indexOf("REFERENCES");
  if (refIdx !== -1) {
    const refClause = rest.slice(refIdx);
    const ref = extractRefTableAndCol(refClause);
    if (ref) {
      fk = { column: colName, referencesTable: ref.table, referencesColumn: ref.col };
    }
  }
  const col = {
    name: colName,
    type,
    nullable: isPrimaryKey ? "NO" : nullable,
    // PK implies not null
    default: defVal,
    isPrimaryKey
  };
  return { col, fk };
}
function handleTableConstraint(def, columns, foreignKeys) {
  const upper = def.trim().toUpperCase();
  let d = def.trim();
  if (upper.startsWith("CONSTRAINT")) {
    const m = d.match(/^CONSTRAINT\s+(?:"[^"]+"\s+|\S+\s+)?([\s\S]*)$/i);
    if (m) d = m[1];
  }
  const up = d.toUpperCase();
  if (up.startsWith("PRIMARY KEY")) {
    const m = d.match(/PRIMARY\s+KEY\s*\(\s*([^)]+)\s*\)/i);
    if (m) {
      const cols = m[1].split(",").map((c) => normalizeIdent(c.trim()));
      for (const cn of cols) {
        const c = columns.find((x) => x.name === cn);
        if (c) c.isPrimaryKey = true;
      }
    }
  } else if (up.startsWith("FOREIGN KEY")) {
    const fkMatch = d.match(/FOREIGN\s+KEY\s*\(\s*([^)]+)\s*\)\s*REFERENCES\s+(?:"([^"]+)"|([A-Za-z0-9_."]+))(?:\s*\(\s*([^)]+)\s*\))?/i);
    if (fkMatch) {
      const localColsRaw = fkMatch[1];
      const refTableRaw = fkMatch[2] ?? fkMatch[3];
      const refColsRaw = fkMatch[4];
      const localCols = localColsRaw.split(",").map((c) => normalizeIdent(c.trim()));
      const refCols = refColsRaw ? refColsRaw.split(",").map((c) => normalizeIdent(c.trim())) : localCols.map(() => "id");
      const refTableParts = refTableRaw.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
      const refTable = refTableParts[refTableParts.length - 1];
      localCols.forEach((lc, i) => {
        const rc = refCols[i] ?? refCols[0] ?? "id";
        foreignKeys.push({ column: lc, referencesTable: refTable, referencesColumn: rc });
      });
    }
  } else if (up.startsWith("UNIQUE") || up.startsWith("CHECK") || up.startsWith("EXCLUDE")) {
  }
}
function parseSqlToSchema(sql) {
  const warnings = [];
  if (!sql || !sql.trim()) throw new Error("Paste your CREATE TABLE SQL - empty input.");
  const trimmedUpper = sql.trim().toUpperCase();
  if (trimmedUpper.startsWith("SELECT")) {
    throw new Error("You pasted a SELECT query. Paste your CREATE TABLE statements instead (from pg_dump or Supabase export). Or use the Connection string tab for live introspection.");
  }
  if (sql.trim().startsWith("{") && sql.trim().includes('"tables"')) {
    throw new Error("You pasted JSON. This tab expects SQL (CREATE TABLE ...). Paste SQL here, or switch to Connection string.");
  }
  const noComments = stripComments(sql);
  const statements = splitStatements(noComments);
  const tables = [];
  const tableMap = /* @__PURE__ */ new Map();
  for (const stmtRaw of statements) {
    const stmt = stmtRaw.trim();
    if (!stmt) continue;
    const upper = stmt.toUpperCase();
    if (upper.startsWith("CREATE TABLE")) {
      const tableName = extractTableName(stmt);
      if (!tableName) {
        warnings.push(`Could not parse table name in: ${stmt.slice(0, 60)}...`);
        continue;
      }
      const firstParen = stmt.indexOf("(");
      if (firstParen === -1) {
        warnings.push(`No column list for table ${tableName}`);
        continue;
      }
      const closing = findMatchingParen(stmt, firstParen);
      if (closing === -1) {
        warnings.push(`Unmatched parentheses for table ${tableName}`);
        continue;
      }
      const body = stmt.slice(firstParen + 1, closing);
      const defs = splitCommaDepth0(body);
      const columns = [];
      const foreignKeys = [];
      const pendingConstraints = [];
      for (const d of defs) {
        const trimmed = d.trim();
        if (!trimmed) continue;
        const up = trimmed.toUpperCase();
        if (up.startsWith("PRIMARY KEY") || up.startsWith("FOREIGN KEY") || up.startsWith("CONSTRAINT") || up.startsWith("UNIQUE") || up.startsWith("CHECK") || up.startsWith("EXCLUDE")) {
          pendingConstraints.push(trimmed);
          continue;
        }
        const parsed = parseColumnDef(trimmed);
        if (parsed.skip) {
          pendingConstraints.push(trimmed);
          continue;
        }
        if (parsed.col) columns.push(parsed.col);
        if (parsed.fk) foreignKeys.push(parsed.fk);
      }
      for (const pc of pendingConstraints) {
        handleTableConstraint(pc, columns, foreignKeys);
      }
      const table = { name: tableName, columns, foreignKeys };
      tables.push(table);
      tableMap.set(tableName, table);
    } else if (upper.startsWith("ALTER TABLE")) {
      const am = stmt.match(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:"([^"]+)"|([A-Za-z0-9_."]+))\s+ADD\s+(?:CONSTRAINT\s+(?:"[^"]+"\s+|\S+\s+)?)?([\s\S]*)$/i);
      if (!am) {
        const addColMatch = stmt.match(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:"([^"]+)"|([A-Za-z0-9_."]+))\s+ADD\s+COLUMN\s+([\s\S]*)$/i);
        if (addColMatch) {
          const rawTable2 = addColMatch[1] ?? addColMatch[2];
          const tParts2 = rawTable2.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
          const tName2 = tParts2[tParts2.length - 1];
          const colDef2 = addColMatch[3].replace(/;$/, "").trim();
          const tbl2 = tableMap.get(tName2);
          if (tbl2) {
            const parsed = parseColumnDef(colDef2);
            if (parsed.col) tbl2.columns.push(parsed.col);
            if (parsed.fk) tbl2.foreignKeys.push(parsed.fk);
          } else {
            warnings.push(`ALTER TABLE for unknown table ${tName2}: ${colDef2.slice(0, 40)}`);
          }
        }
        continue;
      }
      const rawTable = am[1] ?? am[2];
      let rest = am[3].trim();
      const tParts = rawTable.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
      const tName = tParts[tParts.length - 1];
      const tbl = tableMap.get(tName);
      if (!tbl) {
        warnings.push(`ALTER TABLE for unknown table ${tName} - create it before altering`);
        continue;
      }
      if (rest.toUpperCase().startsWith("COLUMN ")) {
        rest = rest.slice(7).trim();
        const parsed = parseColumnDef(rest);
        if (parsed.col) tbl.columns.push(parsed.col);
        if (parsed.fk) tbl.foreignKeys.push(parsed.fk);
        continue;
      }
      const upRest = rest.toUpperCase();
      if (upRest.includes("FOREIGN KEY")) {
        handleTableConstraint(rest, tbl.columns, tbl.foreignKeys);
      } else if (upRest.startsWith("PRIMARY KEY")) {
        handleTableConstraint(rest, tbl.columns, tbl.foreignKeys);
      } else if (upRest.includes("FOREIGN KEY") || upRest.includes("REFERENCES")) {
        handleTableConstraint(rest, tbl.columns, tbl.foreignKeys);
      } else {
        if (/^\s*"?[A-Za-z0-9_]+/.test(rest)) {
          const parsed = parseColumnDef(rest);
          if (parsed.col) tbl.columns.push(parsed.col);
          if (parsed.fk) tbl.foreignKeys.push(parsed.fk);
        }
      }
    } else if (upper.startsWith("CREATE TYPE") || upper.startsWith("CREATE INDEX") || upper.startsWith("CREATE SEQUENCE") || upper.startsWith("COMMENT ON") || upper.startsWith("DROP") || upper.startsWith("SET ") || upper.startsWith("SELECT")) {
      continue;
    } else if (upper.startsWith("INSERT INTO") || upper.startsWith("COPY") || upper.startsWith("CREATE EXTENSION") || upper.startsWith("CREATE SCHEMA")) {
      continue;
    } else {
      if (stmt.trim().length > 0 && !stmt.trim().startsWith("--")) {
        warnings.push(`Ignored statement: ${stmt.slice(0, 50)}...`);
      }
    }
  }
  if (tables.length === 0) {
    throw new Error("No CREATE TABLE statements found. Paste SQL like:\n\nCREATE TABLE users (\n  id uuid PRIMARY KEY,\n  email varchar(255) NOT NULL\n);\n\nCREATE TABLE posts (\n  id uuid PRIMARY KEY,\n  user_id uuid REFERENCES users(id)\n);");
  }
  for (const t of tables) {
    for (const c of t.columns) {
      if (c.isPrimaryKey) c.nullable = "NO";
    }
  }
  return { schema: { tables }, warnings };
}

// src/lib/schemaExport.ts
function quotePart(part) {
  if (/^[a-z_][a-z0-9_]*$/i.test(part)) return part;
  return `"${part.replace(/"/g, '""')}"`;
}
function qualify(name) {
  return name.split(".").map((p) => quotePart(p.trim())).join(".");
}
function schemaOf(name) {
  const parts = name.split(".").map((p) => p.trim());
  return parts.length > 1 ? parts.slice(0, -1).join(".") : null;
}
function schemaToSql(schema) {
  const lines = [
    `-- Generated by dbdiagramr (https://www.dbdiagramr.space)`,
    `-- PostgreSQL DDL exported from the interactive ER diagram below.`,
    ``
  ];
  const schemas = /* @__PURE__ */ new Set();
  for (const t of schema.tables) {
    const s = schemaOf(t.name);
    if (s && s.toLowerCase() !== "public") schemas.add(s);
  }
  for (const s of Array.from(schemas).sort()) {
    lines.push(`CREATE SCHEMA IF NOT EXISTS ${quotePart(s)};`, ``);
  }
  for (const t of schema.tables) {
    const pkCols = t.columns.filter((c) => c.isPrimaryKey);
    const singlePk = pkCols.length === 1;
    const defs = [];
    for (const c of t.columns) {
      const line = [quotePart(c.name), c.type];
      if (singlePk && c.isPrimaryKey) line.push("PRIMARY KEY");
      if (c.nullable === "NO" && !(singlePk && c.isPrimaryKey))
        line.push("NOT NULL");
      if (c.default !== null && c.default !== void 0 && c.default !== "")
        line.push(`DEFAULT ${c.default}`);
      defs.push(`  ${line.join(" ")}`);
    }
    if (!singlePk && pkCols.length > 1) {
      defs.push(
        `  PRIMARY KEY (${pkCols.map((c) => quotePart(c.name)).join(", ")})`
      );
    }
    lines.push(`CREATE TABLE ${qualify(t.name)} (`);
    lines.push(defs.join(",\n"));
    lines.push(`);`, ``);
  }
  for (const t of schema.tables) {
    for (const fk of t.foreignKeys) {
      const constraint = `fk_${t.name.replace(/\W+/g, "_")}_${fk.column.replace(/\W+/g, "_")}`.toLowerCase();
      lines.push(
        `ALTER TABLE ${qualify(t.name)} ADD CONSTRAINT ${quotePart(constraint)} FOREIGN KEY (${quotePart(fk.column)}) REFERENCES ${qualify(fk.referencesTable)} (${quotePart(fk.referencesColumn)});`
      );
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
function mermaidType(type) {
  const t = type.toLowerCase().replace(/\(.*\)/, "").trim();
  if (/char|varchar|text|citext|name/.test(t)) return "string";
  if (/serial|smallint|^int|bigint/.test(t)) return "int";
  if (/numeric|decimal|real|double|float|money/.test(t)) return "float";
  if (/bool/.test(t)) return "bool";
  if (/timestamp|date|time|interval/.test(t)) return "datetime";
  if (/uuid/.test(t)) return "uuid";
  if (/json/.test(t)) return "json";
  if (/bytea|blob|bit|varbit/.test(t)) return "blob";
  if (/array|\[\]/.test(t)) return "array";
  const first = t.split(/[\s(]/)[0] || "string";
  return /^[a-z][a-z0-9_]*$/.test(first) ? first : "string";
}
function mermaidIdent(name) {
  const flat = name.split(".").pop() ?? name;
  const clean = flat.replace(/[^a-zA-Z0-9_]/g, "_");
  return /^[a-zA-Z]/.test(clean) ? clean : `t_${clean}`;
}
function schemaToMermaid(schema) {
  const lines = ["erDiagram"];
  for (const t of schema.tables) {
    const entity = mermaidIdent(t.name);
    lines.push(`    ${entity} {`);
    for (const c of t.columns) {
      const marker = c.isPrimaryKey ? " PK" : "";
      lines.push(
        `        ${mermaidType(c.type)} ${mermaidIdent(c.name)}${marker}`
      );
    }
    lines.push(`    }`);
  }
  const seen = /* @__PURE__ */ new Set();
  for (const t of schema.tables) {
    for (const fk of t.foreignKeys) {
      const child = mermaidIdent(t.name);
      const parent = mermaidIdent(fk.referencesTable);
      const key = `${child}->${parent}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const label = mermaidIdent(fk.column);
      lines.push(`    ${parent} ||--o{ ${child} : "${label}"`);
    }
  }
  return lines.join("\n") + "\n";
}

// src/lib/diffSchemas.ts
function normType(t) {
  return t.toLowerCase().replace(/\s+/g, " ").trim();
}
function normDefault(d) {
  return (d ?? "").trim();
}
function sameFk(a, b) {
  return a.column === b.column && a.referencesTable.toLowerCase() === b.referencesTable.toLowerCase() && a.referencesColumn.toLowerCase() === b.referencesColumn.toLowerCase();
}
function diffSchemas(oldS, newS) {
  const oldMap = new Map(oldS.tables.map((t) => [t.name.toLowerCase(), t]));
  const newMap = new Map(newS.tables.map((t) => [t.name.toLowerCase(), t]));
  const addedTables = [];
  const removedTables = [];
  const changedTables = [];
  for (const t of newS.tables) {
    if (!oldMap.has(t.name.toLowerCase())) addedTables.push(t);
  }
  for (const t of oldS.tables) {
    if (!newMap.has(t.name.toLowerCase())) removedTables.push(t.name);
  }
  for (const nt of newS.tables) {
    const ot = oldMap.get(nt.name.toLowerCase());
    if (!ot) continue;
    const oldCols = new Map(ot.columns.map((c) => [c.name.toLowerCase(), c]));
    const newCols = new Map(nt.columns.map((c) => [c.name.toLowerCase(), c]));
    const addedCols = nt.columns.filter((c) => !oldCols.has(c.name.toLowerCase()));
    const removedCols = ot.columns.filter((c) => !newCols.has(c.name.toLowerCase())).map((c) => c.name);
    const changedCols = [];
    for (const nc of nt.columns) {
      const oc = oldCols.get(nc.name.toLowerCase());
      if (!oc) continue;
      const changes = [];
      if (normType(oc.type) !== normType(nc.type)) {
        changes.push(`type ${oc.type} -> ${nc.type}`);
      }
      if (oc.nullable !== nc.nullable) {
        changes.push(nc.nullable === "NO" ? "now NOT NULL" : "now nullable");
      }
      if (normDefault(oc.default) !== normDefault(nc.default)) {
        changes.push(
          nc.default ? `default -> ${nc.default}` : "default removed"
        );
      }
      if (changes.length > 0) changedCols.push({ name: nc.name, changes });
    }
    const addedFks = nt.foreignKeys.filter(
      (f) => !ot.foreignKeys.some((o) => sameFk(o, f))
    );
    const removedFks = ot.foreignKeys.filter(
      (f) => !nt.foreignKeys.some((n) => sameFk(n, f))
    );
    const oldPk = ot.columns.filter((c) => c.isPrimaryKey).map((c) => c.name).sort();
    const newPk = nt.columns.filter((c) => c.isPrimaryKey).map((c) => c.name).sort();
    const pkChanged = JSON.stringify(oldPk) !== JSON.stringify(newPk) ? { from: oldPk, to: newPk } : null;
    if (addedCols.length > 0 || removedCols.length > 0 || changedCols.length > 0 || addedFks.length > 0 || removedFks.length > 0 || pkChanged) {
      changedTables.push({
        table: nt.name,
        addedCols,
        removedCols,
        changedCols,
        addedFks,
        removedFks,
        pkChanged
      });
    }
  }
  return { addedTables, removedTables, changedTables };
}
function colDef(c) {
  const parts = [c.name, c.type];
  if (c.nullable === "NO") parts.push("NOT NULL");
  if (c.default) parts.push(`DEFAULT ${c.default}`);
  return parts.join(" ");
}
function diffToAlter(diff, newS) {
  const out = [];
  for (const t of diff.addedTables) {
    out.push(`-- New table: ${t.name}`);
    out.push(schemaToSql({ tables: [t] }).trimEnd());
  }
  for (const td of diff.changedTables) {
    out.push(`-- Changes to ${td.table}`);
    for (const c of td.addedCols) {
      out.push(`ALTER TABLE ${td.table} ADD COLUMN ${colDef(c)};`);
      if (c.nullable === "NO" && !c.default) {
        out.push(`-- NOTE: ${c.name} is NOT NULL with no default \u2014 backfill existing rows first.`);
      }
    }
    for (const name of td.removedCols) {
      out.push(`ALTER TABLE ${td.table} DROP COLUMN ${name};`);
    }
    const newTable = newS.tables.find(
      (t) => t.name.toLowerCase() === td.table.toLowerCase()
    );
    for (const ch of td.changedCols) {
      const nc = newTable?.columns.find(
        (c) => c.name.toLowerCase() === ch.name.toLowerCase()
      );
      if (!nc) continue;
      for (const change of ch.changes) {
        if (change.startsWith("type ")) {
          out.push(
            `ALTER TABLE ${td.table} ALTER COLUMN ${ch.name} TYPE ${nc.type} USING ${ch.name}::${nc.type};`
          );
        } else if (change === "now NOT NULL") {
          out.push(`ALTER TABLE ${td.table} ALTER COLUMN ${ch.name} SET NOT NULL;`);
        } else if (change === "now nullable") {
          out.push(`ALTER TABLE ${td.table} ALTER COLUMN ${ch.name} DROP NOT NULL;`);
        } else if (change.startsWith("default -> ")) {
          out.push(
            `ALTER TABLE ${td.table} ALTER COLUMN ${ch.name} SET DEFAULT ${nc.default};`
          );
        } else if (change === "default removed") {
          out.push(`ALTER TABLE ${td.table} ALTER COLUMN ${ch.name} DROP DEFAULT;`);
        }
      }
    }
    if (td.pkChanged) {
      out.push(
        `-- NOTE: primary key changed (${td.pkChanged.from.join(", ") || "(none)"} -> ${td.pkChanged.to.join(", ") || "(none)"})`
      );
      out.push(`ALTER TABLE ${td.table} DROP CONSTRAINT IF EXISTS ${td.table}_pkey;`);
      if (td.pkChanged.to.length > 0) {
        out.push(
          `ALTER TABLE ${td.table} ADD PRIMARY KEY (${td.pkChanged.to.join(", ")});`
        );
      }
    }
    for (const f of td.addedFks) {
      out.push(
        `ALTER TABLE ${td.table} ADD CONSTRAINT fk_${td.table}_${f.column} FOREIGN KEY (${f.column}) REFERENCES ${f.referencesTable} (${f.referencesColumn});`
      );
    }
    for (const f of td.removedFks) {
      out.push(
        `-- NOTE: drop the FK on ${td.table}(${f.column}) manually \u2014 find its name with \\d ${td.table}`
      );
    }
  }
  const referenced = /* @__PURE__ */ new Set();
  for (const t of newS.tables) {
    for (const f of t.foreignKeys) referenced.add(f.referencesTable.toLowerCase());
  }
  for (const name of diff.removedTables) {
    out.push(`-- Removed table: ${name}`);
    if (referenced.has(name.toLowerCase())) {
      out.push(`-- NOTE: ${name} is still referenced by remaining tables \u2014 drop dependents first.`);
    }
    out.push(`DROP TABLE ${name};`);
  }
  return out;
}
function isEmptyDiff(diff) {
  return diff.addedTables.length === 0 && diff.removedTables.length === 0 && diff.changedTables.length === 0;
}

// src/lib/glob.ts
function globToRegExp(glob) {
  let re = "";
  let i = 0;
  const g = glob.replace(/\\/g, "/");
  while (i < g.length) {
    const ch = g[i];
    if (ch === "*") {
      if (g[i + 1] === "*") {
        if (g[i + 2] === "/") {
          re += "(?:.*/)?";
          i += 3;
        } else {
          re += ".*";
          i += 2;
        }
      } else {
        re += "[^/]*";
        i += 1;
      }
    } else if (ch === "?") {
      re += "[^/]";
      i += 1;
    } else {
      re += ch.replace(/[.+^${}()|[\]\\]/g, "\\$&");
      i += 1;
    }
  }
  return new RegExp(`^${re}$`);
}

// src/core.ts
var COMMENT_MARKER = "<!-- pr-schema-diff-erd -->";
var ERD_START = "<!-- dbdiagramr:erd:start -->";
var ERD_END = "<!-- dbdiagramr:erd:end -->";
var MAX_MERMAID_TABLES = 60;
var MAX_COMMENT_CHARS = 6e4;
function renderErdBlock(schema) {
  const tableCount = schema.tables.length;
  if (tableCount === 0 || tableCount > MAX_MERMAID_TABLES) return null;
  const mermaid = schemaToMermaid(schema).trimEnd();
  if (mermaid.split("\n").length >= 500) return null;
  return `${ERD_START}
\`\`\`mermaid
${mermaid}
\`\`\`
${ERD_END}`;
}
function upsertErdBlock(readme, block) {
  const start = readme.indexOf(ERD_START);
  const end = readme.indexOf(ERD_END);
  let next;
  if (start !== -1 && end > start) {
    next = readme.slice(0, start) + block + readme.slice(end + ERD_END.length);
  } else {
    next = `${readme.trimEnd()}

## Database schema

${block}
`;
  }
  return { content: next, changed: next !== readme };
}
function parseFileMap(files) {
  const paths = Array.from(files.keys()).sort();
  const joined = paths.map((p) => files.get(p) ?? "").join("\n");
  const main2 = parseSqlToSchema(joined);
  const mergedWarnings = new Set(main2.warnings);
  const errorFiles = [];
  const attributed = /* @__PURE__ */ new Set();
  for (const p of paths) {
    const single = parseSqlToSchema(files.get(p) ?? "");
    for (const w of single.warnings) {
      if (mergedWarnings.has(w) && !attributed.has(w)) {
        errorFiles.push({ file: p, message: w });
        attributed.add(w);
      }
    }
  }
  for (const w of main2.warnings) {
    if (!attributed.has(w)) errorFiles.push({ file: "merged schema", message: w });
  }
  return { schema: main2.schema, warnings: main2.warnings, errorFiles };
}
function renderComment(args) {
  const { baseSha, headSha, stats, base, head } = args;
  const siteUrl = args.siteUrl ?? "https://www.dbdiagramr.space";
  const diff = diffSchemas(base.schema, head.schema);
  const changedCount = stats.added.length + stats.modified.length + stats.removed.length;
  const statBits = [];
  if (stats.added.length) statBits.push(`${stats.added.length} added`);
  if (stats.modified.length) statBits.push(`${stats.modified.length} modified`);
  if (stats.removed.length) statBits.push(`${stats.removed.length} removed`);
  const parts = [];
  parts.push(COMMENT_MARKER);
  parts.push("## \u{1F4CA} Schema diff");
  const statText = statBits.length ? ` (${statBits.join(", ")})` : "";
  parts.push(
    `_Migration files changed: **${changedCount}**${statText} \u2014 \`${baseSha.slice(0, 7)}\` \u2192 \`${headSha.slice(0, 7)}\`._`
  );
  parts.push("");
  const errorFiles = [...base.errorFiles, ...head.errorFiles];
  if (errorFiles.length > 0) {
    const shown = errorFiles.slice(0, 5);
    parts.push("> \u26A0\uFE0F **Parser warnings** (best-effort \u2014 verify manually):");
    for (const e of shown) {
      parts.push(`> - \`${e.file}\`: ${e.message}`);
    }
    if (errorFiles.length > shown.length) {
      parts.push(`> - \u2026and ${errorFiles.length - shown.length} more`);
    }
    parts.push("");
  }
  if (isEmptyDiff(diff)) {
    parts.push("\u2705 **No structural schema changes detected** between the two versions.");
    parts.push("");
  } else {
    parts.push("| Change | Table | Details |");
    parts.push("|---|---|---|");
    for (const t of diff.addedTables) {
      parts.push(
        `| \u2795 added | \`${escapePipes(t.name)}\` | ${t.columns.length} columns |`
      );
    }
    for (const name of diff.removedTables) {
      parts.push(`| \u2796 removed | \`${escapePipes(name)}\` | \u2014 |`);
    }
    for (const td of diff.changedTables) {
      const bits = [];
      if (td.addedCols.length)
        bits.push(`+${td.addedCols.length} col (${td.addedCols.map((c) => c.name).join(", ")})`);
      if (td.removedCols.length)
        bits.push(`-${td.removedCols.length} col (${td.removedCols.join(", ")})`);
      for (const ch of td.changedCols) {
        bits.push(`\`${ch.name}\`: ${ch.changes.join("; ")}`);
      }
      if (td.addedFks.length) bits.push(`+${td.addedFks.length} FK`);
      if (td.removedFks.length) bits.push(`-${td.removedFks.length} FK`);
      if (td.pkChanged)
        bits.push(`PK (${td.pkChanged.from.join(",") || "none"}) \u2192 (${td.pkChanged.to.join(",") || "none"})`);
      parts.push(`| \u270F\uFE0F changed | \`${escapePipes(td.table)}\` | ${escapePipes(bits.join(" \xB7 "))} |`);
    }
    parts.push("");
    const alters = diffToAlter(diff, head.schema);
    if (alters.length > 0) {
      parts.push("<details><summary>\u{1F4BE} <b>Migration preview</b> (review before running)</summary>");
      parts.push("");
      parts.push("```sql");
      parts.push(alters.join("\n"));
      parts.push("```");
      parts.push("");
      parts.push("</details>");
      parts.push("");
    }
  }
  const tableCount = head.schema.tables.length;
  if (isEmptyDiff(diff)) {
  } else if (tableCount === 0) {
  } else if (tableCount > MAX_MERMAID_TABLES) {
    parts.push(
      `_ER diagram skipped: ${tableCount} tables exceeds the ${MAX_MERMAID_TABLES}-table render limit._`
    );
    parts.push("");
  } else {
    const mermaid = schemaToMermaid(head.schema).trimEnd();
    if (mermaid.split("\n").length < 500) {
      parts.push("<details open><summary>\u{1F5FA}\uFE0F <b>ER diagram</b> (head)</summary>");
      parts.push("");
      parts.push("```mermaid");
      parts.push(mermaid);
      parts.push("```");
      parts.push("");
      parts.push("</details>");
      parts.push("");
    }
  }
  parts.push("---");
  const repoBit = args.repoUrl ? ` \xB7 [\u2B50 star the repo](${args.repoUrl})` : "";
  parts.push(
    `Free tool by [dbdiagramr](${siteUrl}) \u2014 paste your connection string, get the live ER diagram in 10s${repoBit}`
  );
  let out = parts.join("\n");
  if (out.length > MAX_COMMENT_CHARS) {
    out = out.slice(0, MAX_COMMENT_CHARS) + `

\u2026_(truncated \u2014 too many changes for one comment)_
${COMMENT_MARKER}`;
  }
  return out;
}
function escapePipes(s) {
  return s.replace(/\|/g, "\\|");
}

// src/index.ts
function getInput(name, fallback = "") {
  const key = `INPUT_${name.replace(/ /g, "_").toUpperCase()}`;
  const alt = `INPUT_${name.replace(/[- ]/g, "_").toUpperCase()}`;
  return process.env[key]?.trim() || process.env[alt]?.trim() || fallback;
}
function setOutput(name, value) {
  const file = process.env.GITHUB_OUTPUT;
  if (file) (0, import_node_fs.appendFileSync)(file, `${name}=${value}
`);
}
function info(msg) {
  process.stdout.write(`::notice::${msg}
`);
}
function fail(msg) {
  process.stdout.write(`::error::${msg}
`);
  process.exit(1);
}
function git(args, opts = {}) {
  return (0, import_node_child_process.execFileSync)("git", args, {
    encoding: "utf8",
    maxBuffer: opts.maxBuffer ?? 64 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"]
  });
}
function gitTry(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}
function ensureCommit(sha) {
  if (gitTry(["cat-file", "-e", `${sha}^{commit}`]) !== null) return;
  info(`Commit ${sha.slice(0, 7)} not present locally \u2014 fetching (needs a checkout with fetch-depth: 0, or network access).`);
  gitTry(["fetch", "--no-tags", "--depth=1", "origin", sha]);
  if (gitTry(["cat-file", "-e", `${sha}^{commit}`]) === null)
    fail(
      `Cannot read ${sha.slice(0, 7)}. Use actions/checkout with fetch-depth: 0 so the base commit exists.`
    );
}
function listTree(sha) {
  const out = git(["ls-tree", "-r", "-z", "--name-only", sha], { maxBuffer: 32 * 1024 * 1024 });
  return out.split("\0").filter(Boolean);
}
function showFile(sha, path) {
  return gitTry(["show", `${sha}:${path}`]);
}
var API = process.env.GITHUB_API_URL || "https://api.github.com";
async function api(token, method, url, body) {
  url = url.replace("https://api.github.com", API);
  const res = await fetch(url, {
    method,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "content-type": "application/json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "pr-schema-diff-erd"
    },
    body: body === void 0 ? void 0 : JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 403) {
      process.stdout.write(
        `::notice::Token is read-only (fork PR, or missing permissions: pull-requests/contents write) \u2014 skipping write. Copy the workflow's permissions block or run from a branch in the base repo.
`
      );
      process.exit(0);
    }
    fail(`GitHub API ${method} ${url} \u2192 ${res.status}: ${text.slice(0, 300)}`);
  }
  return await res.json();
}
async function repoFile(token, repo, filePath, ref) {
  const encoded = filePath.split("/").map(encodeURIComponent).join("/");
  const res = await fetch(
    `${API}/repos/${repo}/contents/${encoded}?ref=${encodeURIComponent(ref)}`,
    {
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/vnd.github+json",
        "user-agent": "pr-schema-diff-erd"
      }
    }
  );
  if (res.status === 404) return null;
  if (!res.ok) fail(`GitHub API GET contents ${filePath} \u2192 ${res.status}`);
  return await res.json();
}
async function updateReadme(args) {
  const { token, repo, pr, readmePath, headSchema } = args;
  if (pr.head.repo?.full_name !== repo) {
    info("Fork PR \u2014 skipping README update (the token cannot write to the fork).");
    return;
  }
  const block = renderErdBlock(headSchema);
  if (!block) {
    info("README ERD skipped: no tables, or the schema exceeds the render limit.");
    return;
  }
  const existing = await repoFile(token, repo, readmePath, pr.head.sha);
  if (existing && !existing.content) {
    info(`${readmePath} is too large for the contents API \u2014 skipping README update.`);
    return;
  }
  const current = existing?.content ? Buffer.from(existing.content, "base64").toString("utf8") : "";
  const { content, changed } = upsertErdBlock(current, block);
  if (!changed) {
    info(`${readmePath} ER diagram is already up to date.`);
    return;
  }
  await api(token, "PUT", `https://api.github.com/repos/${repo}/contents/${readmePath}`, {
    message: "docs: update ER diagram [skip ci]",
    content: Buffer.from(content).toString("base64"),
    branch: pr.head.ref,
    ...existing ? { sha: existing.sha } : {}
  });
  info(`Updated the ER diagram in ${readmePath} on ${pr.head.ref}.`);
}
async function main() {
  const glob = getInput("migrations-path", "**/migrations/**/*.sql");
  const token = getInput("github-token") || process.env.GITHUB_TOKEN || "";
  if (!token) fail("Missing github-token input.");
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (!eventPath) fail("GITHUB_EVENT_PATH not set \u2014 run this on pull_request events.");
  const event = JSON.parse((0, import_node_fs.readFileSync)(eventPath, "utf8"));
  const pr = event.pull_request;
  if (!pr) fail("Not a pull_request event.");
  const repo = event.repository?.full_name;
  if (!repo) fail("repository.full_name missing from event payload.");
  const prNumber = pr.number;
  const repoUrl = event.repository?.html_url ?? `https://github.com/${repo}`;
  const baseSha = pr.base.sha;
  const headSha = pr.head.sha;
  ensureCommit(baseSha);
  ensureCommit(headSha);
  const changedRaw = git(["diff", "--name-only", "-z", baseSha, headSha], {
    maxBuffer: 16 * 1024 * 1024
  });
  const changed = changedRaw.split("\0").filter(Boolean);
  const re = globToRegExp(glob);
  const changedSql = changed.filter((p) => re.test(p.replace(/\\/g, "/")));
  if (changedSql.length === 0) {
    setOutput("changed", "false");
    info("No migration files changed \u2014 nothing to do.");
    return;
  }
  setOutput("changed", "true");
  const baseFiles = listTree(baseSha).filter((p) => re.test(p.replace(/\\/g, "/")));
  const headFiles = listTree(headSha).filter((p) => re.test(p.replace(/\\/g, "/")));
  const baseSet = new Set(baseFiles);
  const headSet = new Set(headFiles);
  const added = headFiles.filter((p) => !baseSet.has(p));
  const removed = baseFiles.filter((p) => !headSet.has(p));
  const modified = headFiles.filter((p) => {
    if (!baseSet.has(p)) return false;
    return showFile(baseSha, p) !== showFile(headSha, p);
  });
  const baseMap = /* @__PURE__ */ new Map();
  const headMap = /* @__PURE__ */ new Map();
  for (const p of baseFiles) {
    const c = showFile(baseSha, p);
    if (c !== null) baseMap.set(p, c);
  }
  for (const p of headFiles) {
    const c = showFile(headSha, p);
    if (c !== null) headMap.set(p, c);
  }
  const baseParse = parseFileMap(baseMap);
  const headParse = parseFileMap(headMap);
  const comment = renderComment({
    baseSha,
    headSha,
    stats: { added, modified, removed },
    base: baseParse,
    head: headParse,
    repoUrl
  });
  const perPage = 100;
  const first = await api(
    token,
    "GET",
    `https://api.github.com/repos/${repo}/issues/${prNumber}/comments?per_page=${perPage}`
  );
  const existing = first.find((c) => (c.body ?? "").includes(COMMENT_MARKER));
  if (existing) {
    await api(token, "PATCH", `https://api.github.com/repos/${repo}/issues/comments/${existing.id}`, {
      body: comment
    });
    info(`Updated schema-diff comment ${existing.id} on PR #${prNumber}.`);
  } else {
    await api(token, "POST", `https://api.github.com/repos/${repo}/issues/${prNumber}/comments`, {
      body: comment
    });
    info(`Posted schema-diff comment on PR #${prNumber}.`);
  }
  const readmePath = getInput("readme-path");
  if (readmePath) {
    await updateReadme({
      token,
      repo,
      pr,
      readmePath,
      headSchema: headParse.schema
    });
  }
}
main().catch((err) => fail(String(err instanceof Error ? err.stack ?? err.message : err)));
