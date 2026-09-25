import type { Schema } from "@/lib/diagram";

export type IssueSeverity = "error" | "warning" | "info";

export type SchemaIssue = {
  rule: string;
  severity: IssueSeverity;
  table?: string;
  column?: string;
  message: string;
  fix: string;
};

export type SchemaReport = {
  score: number;
  grade: string;
  tableCount: number;
  columnCount: number;
  foreignKeyCount: number;
  issues: SchemaIssue[];
};

const SCORE_PENALTY: Record<IssueSeverity, number> = {
  error: 15,
  warning: 5,
  info: 1,
};

function isSnakeCase(name: string): boolean {
  return /^[a-z][a-z0-9_]*$/.test(name);
}

function isCamelCase(name: string): boolean {
  return /^[a-z]+[A-Za-z0-9]*$/.test(name) && /[A-Z]/.test(name);
}

function gradeFor(score: number): string {
  if (score >= 90) return "A";
  if (score >= 75) return "B";
  if (score >= 60) return "C";
  return "D";
}

export function analyzeSchema(schema: Schema): SchemaReport {
  const issues: SchemaIssue[] = [];
  const tables = schema.tables ?? [];

  for (const table of tables) {
    const pkColumns = table.columns.filter((c) => c.isPrimaryKey);

    // 1. Table without primary key (error)
    if (pkColumns.length === 0) {
      issues.push({
        rule: "missing-primary-key",
        severity: "error",
        table: table.name,
        message: `Table "${table.name}" has no primary key.`,
        fix: "Add an id column: id UUID PRIMARY KEY DEFAULT gen_random_uuid() or id BIGSERIAL PRIMARY KEY.",
      });
    }

    // 2. FK columns without a nearby index note (warning).
    // The parser does not track indexes, so flag every FK for review.
    for (const fk of table.foreignKeys ?? []) {
      issues.push({
        rule: "fk-index-review",
        severity: "warning",
        table: table.name,
        column: fk.column,
        message: `Foreign key "${table.name}.${fk.column}" — confirm it is indexed. Postgres does not auto-index FK columns.`,
        fix: `CREATE INDEX idx_${table.name}_${fk.column} ON ${table.name} (${fk.column});`,
      });

      // 3. Nullable FK column (warning)
      const col = table.columns.find((c) => c.name === fk.column);
      if (col && col.nullable !== "NO") {
        issues.push({
          rule: "nullable-foreign-key",
          severity: "warning",
          table: table.name,
          column: fk.column,
          message: `Foreign key "${table.name}.${fk.column}" is nullable.`,
          fix: "Add NOT NULL if every row must reference the parent, or keep nullable only for genuinely optional relations.",
        });
      }
    }

    // 4. Column named "id" that is not the PK (warning)
    for (const col of table.columns) {
      if (col.name.toLowerCase() === "id" && !col.isPrimaryKey) {
        issues.push({
          rule: "id-not-primary-key",
          severity: "warning",
          table: table.name,
          column: col.name,
          message: `Column "${table.name}.id" is not the primary key — readers will assume it is.`,
          fix: "Rename it to something explicit, or make it the primary key.",
        });
      }
    }

    // 6. Wide table (info)
    if (table.columns.length > 30) {
      issues.push({
        rule: "wide-table",
        severity: "info",
        table: table.name,
        message: `Table "${table.name}" has ${table.columns.length} columns — unusually wide.`,
        fix: "Consider splitting rarely-used or repeated groups of columns into a related table.",
      });
    }

    // 7. Missing audit columns (info)
    const names = new Set(table.columns.map((c) => c.name.toLowerCase()));
    if (!names.has("created_at") && !names.has("createdat")) {
      issues.push({
        rule: "missing-created-at",
        severity: "info",
        table: table.name,
        message: `Table "${table.name}" has no created_at column.`,
        fix: "Add created_at TIMESTAMPTZ NOT NULL DEFAULT NOW() for debugging and auditing.",
      });
    }
  }

  // 5. Mixed naming conventions across tables (info, schema-level)
  const tableNames = tables.map((t) => t.name);
  const hasSnake = tableNames.some(isSnakeCase);
  const hasCamel = tableNames.some(isCamelCase);
  if (hasSnake && hasCamel) {
    issues.push({
      rule: "mixed-naming",
      severity: "info",
      message: "Table names mix snake_case and camelCase.",
      fix: "Pick one convention (snake_case is the Postgres norm) and rename for consistency.",
    });
  }

  const penalty = issues.reduce((sum, i) => sum + SCORE_PENALTY[i.severity], 0);
  const score = Math.max(0, 100 - penalty);
  const columnCount = tables.reduce((sum, t) => sum + t.columns.length, 0);
  const foreignKeyCount = tables.reduce(
    (sum, t) => sum + (t.foreignKeys?.length ?? 0),
    0
  );

  return {
    score,
    grade: gradeFor(score),
    tableCount: tables.length,
    columnCount,
    foreignKeyCount,
    issues,
  };
}
