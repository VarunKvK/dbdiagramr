import type { Column, Schema, Table } from "@/lib/diagram";
import { columnForeignKeyMap } from "@/lib/relationships";

function columnKey(table: Table, column: Column): string {
  const fks = columnForeignKeyMap(table).get(column.name) ?? [];
  const references = fks
    .map((fk) => `${fk.referencesTable}.${fk.referencesColumn}`)
    .join(", ");

  if (column.isPrimaryKey && fks.length > 0) {
    return `PK, FK → ${references}`;
  }
  if (column.isPrimaryKey) return "PK";
  if (fks.length > 0) return `FK → ${references}`;
  return "-";
}

export default function SchemaColumnsTable({ schema }: { schema: Schema }) {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-border bg-white shadow-sm">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left">
            <th className="px-4 py-3 font-medium text-ink">Column</th>
            <th className="px-4 py-3 font-medium text-ink">Type</th>
            <th className="px-4 py-3 font-medium text-ink">Nullable</th>
            <th className="px-4 py-3 font-medium text-ink">Key</th>
          </tr>
        </thead>
        <tbody>
          {schema.tables.map((table) => (
            <TableRows key={table.name} table={table} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TableRows({ table }: { table: Table }) {
  return (
    <>
      <tr className="border-b border-border bg-accent-soft/50">
        <td colSpan={4} className="px-4 py-3 font-semibold text-accent">
          {table.name}
        </td>
      </tr>
      {table.columns.map((column) => {
        const key = columnKey(table, column);
        const hasKey = key !== "-";
        return (
          <tr
            key={`${table.name}-${column.name}`}
            className="border-b border-border last:border-b-0"
          >
            <td className="px-4 py-2.5 font-mono text-ink">{column.name}</td>
            <td className="px-4 py-2.5 font-mono text-muted">{column.type}</td>
            <td className="px-4 py-2.5 text-muted">
              {column.nullable === "NO" ? "No" : "Yes"}
            </td>
            <td className="px-4 py-2.5">
              {hasKey ? (
                <span className="whitespace-nowrap rounded-[20px] border border-accent bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                  {key}
                </span>
              ) : (
                <span className="text-xs text-muted">-</span>
              )}
            </td>
          </tr>
        );
      })}
    </>
  );
}
