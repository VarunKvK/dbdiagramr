import type { Column, Schema, Table } from "./types";
import { schemaToSql } from "./schemaExport";

// Structural diff of two parsed schemas -> human summary + ALTER statements.
// Best-effort migration sketch: review before running on production.

export type ColChange = {
  name: string;
  changes: string[];
};

export type TableDiff = {
  table: string;
  addedCols: Column[];
  removedCols: string[];
  changedCols: ColChange[];
  addedFks: { column: string; referencesTable: string; referencesColumn: string }[];
  removedFks: { column: string; referencesTable: string; referencesColumn: string }[];
  pkChanged: { from: string[]; to: string[] } | null;
};

export type SchemaDiff = {
  addedTables: Table[];
  removedTables: string[];
  changedTables: TableDiff[];
};

function normType(t: string): string {
  return t.toLowerCase().replace(/\s+/g, " ").trim();
}

function normDefault(d: string | null): string {
  return (d ?? "").trim();
}

function sameFk(
  a: { column: string; referencesTable: string; referencesColumn: string },
  b: { column: string; referencesTable: string; referencesColumn: string }
): boolean {
  return (
    a.column === b.column &&
    a.referencesTable.toLowerCase() === b.referencesTable.toLowerCase() &&
    a.referencesColumn.toLowerCase() === b.referencesColumn.toLowerCase()
  );
}

export function diffSchemas(oldS: Schema, newS: Schema): SchemaDiff {
  const oldMap = new Map(oldS.tables.map((t) => [t.name.toLowerCase(), t]));
  const newMap = new Map(newS.tables.map((t) => [t.name.toLowerCase(), t]));
  const addedTables: Table[] = [];
  const removedTables: string[] = [];
  const changedTables: TableDiff[] = [];

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
    const removedCols = ot.columns
      .filter((c) => !newCols.has(c.name.toLowerCase()))
      .map((c) => c.name);
    const changedCols: ColChange[] = [];
    for (const nc of nt.columns) {
      const oc = oldCols.get(nc.name.toLowerCase());
      if (!oc) continue;
      const changes: string[] = [];
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
    const pkChanged =
      JSON.stringify(oldPk) !== JSON.stringify(newPk)
        ? { from: oldPk, to: newPk }
        : null;
    if (
      addedCols.length > 0 ||
      removedCols.length > 0 ||
      changedCols.length > 0 ||
      addedFks.length > 0 ||
      removedFks.length > 0 ||
      pkChanged
    ) {
      changedTables.push({
        table: nt.name,
        addedCols,
        removedCols,
        changedCols,
        addedFks,
        removedFks,
        pkChanged,
      });
    }
  }

  return { addedTables, removedTables, changedTables };
}

function colDef(c: Column): string {
  const parts = [c.name, c.type];
  if (c.nullable === "NO") parts.push("NOT NULL");
  if (c.default) parts.push(`DEFAULT ${c.default}`);
  return parts.join(" ");
}

export function diffToAlter(diff: SchemaDiff, newS: Schema): string[] {
  const out: string[] = [];
  // New tables first (full definitions, order-safe FKs via ALTERs)
  for (const t of diff.addedTables) {
    out.push(`-- New table: ${t.name}`);
    out.push(schemaToSql({ tables: [t] }).trimEnd());
  }
  // Changed tables
  for (const td of diff.changedTables) {
    out.push(`-- Changes to ${td.table}`);
    for (const c of td.addedCols) {
      out.push(`ALTER TABLE ${td.table} ADD COLUMN ${colDef(c)};`);
      if (c.nullable === "NO" && !c.default) {
        out.push(`-- NOTE: ${c.name} is NOT NULL with no default — backfill existing rows first.`);
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
        `-- NOTE: drop the FK on ${td.table}(${f.column}) manually — find its name with \\d ${td.table}`
      );
    }
  }
  // Dropped tables last, with dependent warnings
  const referenced = new Set<string>();
  for (const t of newS.tables) {
    for (const f of t.foreignKeys) referenced.add(f.referencesTable.toLowerCase());
  }
  for (const name of diff.removedTables) {
    out.push(`-- Removed table: ${name}`);
    if (referenced.has(name.toLowerCase())) {
      out.push(`-- NOTE: ${name} is still referenced by remaining tables — drop dependents first.`);
    }
    out.push(`DROP TABLE ${name};`);
  }
  return out;
}

export function diffSummary(diff: SchemaDiff): string[] {
  const lines: string[] = [];
  for (const t of diff.addedTables) lines.push(`+ table ${t.name} (${t.columns.length} columns)`);
  for (const t of diff.removedTables) lines.push(`- table ${t}`);
  for (const td of diff.changedTables) {
    const bits: string[] = [];
    if (td.addedCols.length > 0)
      bits.push(`+${td.addedCols.length} col (${td.addedCols.map((c) => c.name).join(", ")})`);
    if (td.removedCols.length > 0) bits.push(`-${td.removedCols.length} col (${td.removedCols.join(", ")})`);
    if (td.changedCols.length > 0) bits.push(`~${td.changedCols.length} col`);
    if (td.addedFks.length > 0) bits.push(`+${td.addedFks.length} FK`);
    if (td.removedFks.length > 0) bits.push(`-${td.removedFks.length} FK`);
    if (td.pkChanged) bits.push("PK changed");
    lines.push(`~ ${td.table}: ${bits.join(", ")}`);
  }
  return lines;
}

export function isEmptyDiff(diff: SchemaDiff): boolean {
  return (
    diff.addedTables.length === 0 &&
    diff.removedTables.length === 0 &&
    diff.changedTables.length === 0
  );
}
