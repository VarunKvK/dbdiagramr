import type { Column, Table } from "@/lib/diagram";

type ColOpts = {
  pk?: boolean;
  nullable?: boolean;
  default?: string | null;
};

export function col(name: string, type: string, opts: ColOpts = {}): Column {
  return {
    name,
    type,
    nullable: opts.nullable ? "YES" : "NO",
    default: opts.default ?? null,
    isPrimaryKey: opts.pk ?? false,
  };
}

export function table(
  name: string,
  columns: Column[],
  foreignKeys: { column: string; referencesTable: string; referencesColumn: string }[] = []
): Table {
  return { name, columns, foreignKeys };
}
