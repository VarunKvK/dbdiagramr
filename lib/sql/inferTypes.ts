// Shared PostgreSQL type inference for the CSV/JSON converter tools.
// Pure functions, no dependencies — safe for client components.

export type InferredColumn = {
  name: string;
  pgType: string;
  nullable: boolean;
  /** Set when this column is a real foreign key (not a name guess). */
  fk?: { referencesTable: string; referencesColumn: string };
};

export function sanitizeIdent(raw: string, fallback: string): string {
  let s = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  if (!s) s = fallback;
  if (/^[0-9]/.test(s)) s = `col_${s}`;
  return s;
}

function isIntLike(v: string): boolean {
  return /^-?\d+$/.test(v.trim());
}

function isFloatLike(v: string): boolean {
  return /^-?(\d+\.\d*|\.\d+|\d+)([eE][+-]?\d+)?$/.test(v.trim());
}

function isBoolLike(v: string): boolean {
  return /^(true|false|t|f|yes|no|y|n|1|0)$/i.test(v.trim());
}

function isDateOnly(v: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v.trim())) return false;
  const d = new Date(`${v.trim()}T00:00:00Z`);
  return !isNaN(d.getTime());
}

function isTimestampLike(v: string): boolean {
  const t = v.trim();
  if (isDateOnly(t)) return false;
  // ISO datetimes, "YYYY-MM-DD HH:mm:ss", RFC strings Date can parse
  if (!/^\d{4}-\d{2}-\d{2}[T ]/.test(t)) return false;
  const d = new Date(t.replace(" ", "T"));
  return !isNaN(d.getTime());
}

function isUuidLike(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    v.trim()
  );
}

/** Infer a PG type from a single raw string value (CSV cells are strings). */
export function inferStringValueType(v: string): string {
  const t = v.trim();
  if (t === "") return "text";
  if (isBoolLike(t) && !isIntLike(t)) return "boolean";
  if (isIntLike(t)) {
    const n = Number(t);
    if (Number.isSafeInteger(n) && Math.abs(n) <= 2147483647) return "integer";
    return "bigint";
  }
  if (isFloatLike(t)) return "double precision";
  if (isUuidLike(t)) return "uuid";
  if (isDateOnly(t)) return "date";
  if (isTimestampLike(t)) return "timestamptz";
  return "text";
}

/** Infer a PG type from a parsed JSON value. */
export function inferJsonValueType(v: unknown): string {
  if (v === null || v === undefined) return "text";
  if (typeof v === "boolean") return "boolean";
  if (typeof v === "number") {
    if (Number.isInteger(v)) {
      return Math.abs(v) <= 2147483647 ? "integer" : "bigint";
    }
    return "double precision";
  }
  if (typeof v === "string") {
    if (v.trim() === "") return "text";
    if (isDateOnly(v)) return "date";
    if (isTimestampLike(v)) return "timestamptz";
    if (isUuidLike(v)) return "uuid";
    return "text";
  }
  // Objects and arrays handled by the caller (nested tables / jsonb fallback)
  return "jsonb";
}

function mergeTypes(a: string, b: string): string {
  if (a === b) return a;
  if (a === "text" || b === "text") return "text";
  // integer widens freely
  const numeric = new Set(["integer", "bigint", "double precision"]);
  if (numeric.has(a) && numeric.has(b)) {
    if (a === "double precision" || b === "double precision")
      return "double precision";
    if (a === "bigint" || b === "bigint") return "bigint";
    return "integer";
  }
  if ((a === "date" && b === "timestamptz") || (b === "date" && a === "timestamptz"))
    return "timestamptz";
  return "text";
}

/**
 * Infer columns across rows. `getValue(row, key)` returns the raw value
 * (string for CSV, unknown for JSON). Empty values mark the column nullable
 * but don't influence the type.
 */
export function inferColumns<T>(
  rows: T[],
  keys: string[],
  getValue: (row: T, key: string) => unknown,
  inferValue: (v: unknown) => string
): InferredColumn[] {
  return keys.map((key, i) => {
    let type: string | null = null;
    let nullable = false;
    for (const row of rows) {
      const v = getValue(row, key);
      if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) {
        nullable = true;
        continue;
      }
      const t = inferValue(v);
      type = type === null ? t : mergeTypes(type, t);
    }
    return {
      name: sanitizeIdent(key, `column_${i + 1}`),
      pgType: type ?? "text",
      nullable,
    };
  });
}

function quoteLiteral(v: string): string {
  return `'${v.replace(/'/g, "''")}'`;
}

/** Format one INSERT value for a given PG type. */
export function formatInsertValue(v: unknown, pgType: string): string {
  if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) {
    return "NULL";
  }
  if (pgType === "boolean") {
    const t = String(v).trim().toLowerCase();
    return ["true", "t", "yes", "y", "1"].includes(t) ? "TRUE" : "FALSE";
  }
  if (["integer", "bigint", "double precision"].includes(pgType)) {
    const n = Number(String(v).trim());
    return Number.isFinite(n) ? String(n) : "NULL";
  }
  if (typeof v === "object") return quoteLiteral(JSON.stringify(v));
  return quoteLiteral(String(v));
}

/** True when every non-empty value in the column is distinct. */
export function isUniqueColumn<T>(
  rows: T[],
  getValue: (row: T) => unknown
): boolean {
  const seen = new Set<string>();
  for (const row of rows) {
    const v = getValue(row);
    if (v === null || v === undefined || (typeof v === "string" && v.trim() === "")) continue;
    const k = typeof v === "object" ? JSON.stringify(v) : String(v);
    if (seen.has(k)) return false;
    seen.add(k);
  }
  return seen.size > 0;
}

export function emitCreateTable(
  tableName: string,
  cols: InferredColumn[],
  opts: { ifNotExists?: boolean; primaryKey?: boolean } = {}
): string {
  const lines = cols.map((c, i) => {
    const pk = i === 0 && opts.primaryKey ? " PRIMARY KEY" : "";
    const nn = c.nullable && !pk ? "" : " NOT NULL";
    return `  ${c.name} ${c.pgType}${pk}${nn}`;
  });
  const guard = opts.ifNotExists ? "IF NOT EXISTS " : "";
  return `CREATE TABLE ${guard}${tableName} (\n${lines.join(",\n")}\n);`;
}

export function emitInserts(
  tableName: string,
  cols: InferredColumn[],
  rows: Record<string, unknown>[],
  getValue: (row: Record<string, unknown>, key: string, col: InferredColumn) => unknown,
  keys: string[]
): string {
  const colList = cols.map((c) => c.name).join(", ");
  const lines = rows.map((row) => {
    const vals = cols.map((c, i) =>
      formatInsertValue(getValue(row, keys[i], c), c.pgType)
    );
    return `(${vals.join(", ")})`;
  });
  return `INSERT INTO ${tableName} (${colList}) VALUES\n${lines.join(",\n")};`;
}
