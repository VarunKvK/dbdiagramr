import type { Column, ForeignKey, Schema, Table } from "@/lib/diagram";

function stripComments(sql: string): string {
  // Remove block comments /* ... */
  let out = sql.replace(/\/\*[\s\S]*?\*\//g, " ");
  // Remove line comments -- ... (but not inside strings)
  const lines = out.split("\n");
  out = lines
    .map((line) => {
      // Find -- not inside single/double quotes
      let inSingle = false;
      let inDouble = false;
      for (let i = 0; i < line.length - 1; i++) {
        const c = line[i];
        const nxt = line[i + 1];
        if (c === "'" && !inDouble) {
          // handle escaped '' inside single quotes
          if (line[i + 1] === "'") { i++; continue; }
          inSingle = !inSingle;
        } else if (c === '"' && !inSingle) {
          inDouble = !inDouble;
        }
        if (!inSingle && !inDouble && c === "-" && nxt === "-") {
          return line.slice(0, i);
        }
      }
      return line;
    })
    .join("\n");
  return out;
}

function splitStatements(sql: string): string[] {
  const stmts: string[] = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  let inDollar = false;
  let dollarTag = "";
  for (let i = 0; i < sql.length; i++) {
    const c = sql[i];
    // Handle dollar quoting $$ or $tag$
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
      // handle escaped double quote "" inside identifier
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

function extractTableName(createStmt: string): string | null {
  // CREATE TABLE [IF NOT EXISTS] [schema.]name (
  const m = createStmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:ONLY\s+)?(?:"([^"]+)"|([A-Za-z0-9_."]+))\s*\(/i);
  if (!m) return null;
  const raw = m[1] ?? m[2];
  // Handle schema-qualified like public.users or "public"."users" or auth.users
  const parts = raw.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
  return parts[parts.length - 1];
}

function findMatchingParen(str: string, startIdx: number): number {
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = startIdx; i < str.length; i++) {
    const c = str[i];
    if (c === "'" && !inDouble) {
      if (str[i + 1] === "'") { i++; continue; }
      inSingle = !inSingle;
      continue;
    }
    if (c === '"' && !inSingle) {
      if (str[i + 1] === '"') { i++; continue; }
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

function splitCommaDepth0(s: string): string[] {
  const parts: string[] = [];
  let cur = "";
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "'" && !inDouble) {
      if (s[i + 1] === "'") { cur += "''"; i++; continue; }
      inSingle = !inSingle;
      cur += c;
      continue;
    }
    if (c === '"' && !inSingle) {
      if (s[i + 1] === '"') { cur += '""'; i++; continue; }
      inDouble = !inDouble;
      cur += c;
      continue;
    }
    if (inSingle || inDouble) { cur += c; continue; }
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

function normalizeIdent(raw: string): string {
  return raw.replace(/^"|"$/g, "").trim();
}

function extractRefTableAndCol(referencesClause: string): { table: string; col: string } | null {
  // REFERENCES [schema.]table [(col)]
  const m = referencesClause.match(/REFERENCES\s+(?:"([^"]+)"|([A-Za-z0-9_."]+))(?:\s*\(\s*"?([^"\s\)]+)"?\s*\))?/i);
  if (!m) return null;
  const rawTable = m[1] ?? m[2];
  const col = m[3] ?? "id";
  const tableParts = rawTable.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
  const table = tableParts[tableParts.length - 1];
  return { table, col: normalizeIdent(col) };
}

function parseColumnDef(def: string): { col?: Column; fk?: ForeignKey; skip?: boolean } {
  const trimmed = def.trim();
  if (!trimmed) return { skip: true };
  const upper = trimmed.toUpperCase();
  // Table-level constraints
  if (
    upper.startsWith("PRIMARY KEY") ||
    upper.startsWith("FOREIGN KEY") ||
    upper.startsWith("CONSTRAINT") ||
    upper.startsWith("UNIQUE") ||
    upper.startsWith("CHECK") ||
    upper.startsWith("EXCLUDE")
  ) {
    return { skip: true }; // handled at table level separately, but keep as signal
  }

  // Column definition: name + rest
  // Name may be quoted "user id" or unquoted
  const nameMatch = trimmed.match(/^\s*(?:"([^"]+)"|([A-Za-z0-9_]+))\s+/);
  if (!nameMatch) return { skip: true };
  const colName = normalizeIdent(nameMatch[1] ?? nameMatch[2]);
  const rest = trimmed.slice(nameMatch[0].length);
  const restUpper = rest.toUpperCase();

  // Find type as before earliest constraint keyword
  const constraintKeywords = [" NOT NULL", " NULL", " DEFAULT", " PRIMARY KEY", " PRIMARY", " REFERENCES", " UNIQUE", " CHECK", " COLLATE"];
  // Actually search case-insensitive for keywords as word boundaries
  let typeEnd = rest.length;
  const ubRest = " " + restUpper; // pad to catch leading
  for (const kw of constraintKeywords) {
    const idx = ubRest.indexOf(kw);
    if (idx !== -1) {
      const absIdx = idx - 1; // adjust for pad
      if (absIdx >= 0 && absIdx < typeEnd) typeEnd = absIdx;
    }
  }
  let type = rest.slice(0, typeEnd).trim();
  if (!type) type = "text"; // fallback
  // Remove trailing commas? already trimmed
  // Clean type: remove extra spaces, keep as is but normalize later via formatType
  // Determine nullable
  const nullable = restUpper.includes("NOT NULL") ? "NO" : "YES";
  // Default
  let defVal: string | null = null;
  const defMatch = rest.match(/DEFAULT\s+((?:'(?:''|[^'])*'|"(?:[^"])*"|\$\$[\s\S]*?\$\$|\S+)(?:\s*\([^)]*\))?)/i);
  // Simpler: capture up to next constraint keyword after DEFAULT
  if (defMatch) {
    let rawDef = defMatch[1].trim();
    // Remove trailing commas
    rawDef = rawDef.replace(/,$/, "");
    defVal = rawDef;
  } else {
    const altDef = rest.match(/DEFAULT\s+([^\s,]+)/i);
    if (altDef) defVal = altDef[1];
  }
  // If no explicit DEFAULT but primary key maybe no default
  if (defVal === "") defVal = null;

  const isPrimaryKey = /\bPRIMARY\s+KEY\b/i.test(rest);
  let fk: ForeignKey | undefined;
  const refIdx = restUpper.indexOf("REFERENCES");
  if (refIdx !== -1) {
    const refClause = rest.slice(refIdx);
    const ref = extractRefTableAndCol(refClause);
    if (ref) {
      fk = { column: colName, referencesTable: ref.table, referencesColumn: ref.col };
    }
  }

  const col: Column = {
    name: colName,
    type: type,
    nullable: isPrimaryKey ? "NO" : nullable, // PK implies not null
    default: defVal,
    isPrimaryKey,
  };
  return { col, fk };
}

function handleTableConstraint(def: string, columns: Column[], foreignKeys: ForeignKey[]) {
  const upper = def.trim().toUpperCase();
  let d = def.trim();
  // Strip CONSTRAINT name if present
  if (upper.startsWith("CONSTRAINT")) {
    // Remove CONSTRAINT "name" prefix
    const m = d.match(/^CONSTRAINT\s+(?:"[^"]+"\s+|\S+\s+)?(.*)$/i);
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
    // FOREIGN KEY (col) REFERENCES table(col)
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
    // ignore for diagram
  }
}

export function parseSqlToSchema(sql: string): { schema: Schema; warnings: string[] } {
  const warnings: string[] = [];
  if (!sql || !sql.trim()) throw new Error("Paste your CREATE TABLE SQL - empty input.");
  const trimmedUpper = sql.trim().toUpperCase();
  if (trimmedUpper.startsWith("SELECT")) {
    throw new Error("You pasted a SELECT query. Paste your CREATE TABLE statements instead (from pg_dump or Supabase export). Or use the Connection string tab for live introspection.");
  }
  // If looks like JSON, hint
  if (sql.trim().startsWith("{") && sql.trim().includes('"tables"')) {
    throw new Error("You pasted JSON. This tab expects SQL (CREATE TABLE ...). Paste SQL here, or switch to Connection string.");
  }

  const noComments = stripComments(sql);
  const statements = splitStatements(noComments);

  const tables: Table[] = [];
  const tableMap = new Map<string, Table>();

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
      const columns: Column[] = [];
      const foreignKeys: ForeignKey[] = [];
      const pendingConstraints: string[] = [];
      for (const d of defs) {
        const trimmed = d.trim();
        if (!trimmed) continue;
        const up = trimmed.toUpperCase();
        if (
          up.startsWith("PRIMARY KEY") ||
          up.startsWith("FOREIGN KEY") ||
          up.startsWith("CONSTRAINT") ||
          up.startsWith("UNIQUE") ||
          up.startsWith("CHECK") ||
          up.startsWith("EXCLUDE")
        ) {
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
      // Handle table-level constraints
      for (const pc of pendingConstraints) {
        handleTableConstraint(pc, columns, foreignKeys);
      }
      // Deduplicate PK? keep as is
      const table: Table = { name: tableName, columns, foreignKeys };
      tables.push(table);
      tableMap.set(tableName, table);
    } else if (upper.startsWith("ALTER TABLE")) {
      // ALTER TABLE [ONLY] [schema.]table ADD ...
      const am = stmt.match(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:"([^"]+)"|([A-Za-z0-9_."]+))\s+ADD\s+(?:CONSTRAINT\s+(?:"[^"]+"\s+|\S+\s+)?)?([\s\S]*)$/i);
      if (!am) {
        // Could be ADD COLUMN etc - we can handle ADD COLUMN
        const addColMatch = stmt.match(/ALTER\s+TABLE\s+(?:ONLY\s+)?(?:"([^"]+)"|([A-Za-z0-9_."]+))\s+ADD\s+COLUMN\s+([\s\S]*)$/i);
        if (addColMatch) {
          const rawTable = addColMatch[1] ?? addColMatch[2];
          const tParts = rawTable.split(".").map((p) => p.replace(/^"|"$/g, "").trim());
          const tName = tParts[tParts.length - 1];
          const colDef = addColMatch[3].replace(/;$/, "").trim();
          const tbl = tableMap.get(tName);
          if (tbl) {
            const parsed = parseColumnDef(colDef);
            if (parsed.col) tbl.columns.push(parsed.col);
            if (parsed.fk) tbl.foreignKeys.push(parsed.fk);
          } else {
            warnings.push(`ALTER TABLE for unknown table ${tName}: ${colDef.slice(0,40)}`);
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
      // Handle ADD COLUMN prefix
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
      // ignored
      continue;
    } else if (upper.startsWith("INSERT INTO") || upper.startsWith("COPY") || upper.startsWith("CREATE EXTENSION") || upper.startsWith("CREATE SCHEMA")) {
      continue;
    } else {
      // Unknown statement - warn but don't fail
      if (stmt.trim().length > 0 && !stmt.trim().startsWith("--")) {
        warnings.push(`Ignored statement: ${stmt.slice(0, 50)}...`);
      }
    }
  }

  if (tables.length === 0) {
    throw new Error("No CREATE TABLE statements found. Paste SQL like:\n\nCREATE TABLE users (\n  id uuid PRIMARY KEY,\n  email varchar(255) NOT NULL\n);\n\nCREATE TABLE posts (\n  id uuid PRIMARY KEY,\n  user_id uuid REFERENCES users(id)\n);");
  }

  // Post-process: Ensure PK columns are marked non-nullable
  for (const t of tables) {
    for (const c of t.columns) {
      if (c.isPrimaryKey) c.nullable = "NO";
    }
  }

  return { schema: { tables }, warnings };
}
