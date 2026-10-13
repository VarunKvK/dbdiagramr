import type { Schema } from "@/lib/diagram";

// Schema -> DBML (https://dbml.dbdiagram.io/docs/)

function quoteDbmlIdent(name: string): string {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(name) ? name : `"${name}"`;
}

export function schemaToDbml(schema: Schema): string {
  const lines: string[] = [];
  for (const t of schema.tables) {
    lines.push(`Table ${quoteDbmlIdent(t.name)} {`);
    for (const c of t.columns) {
      const settings: string[] = [];
      if (c.isPrimaryKey) settings.push("pk");
      else if (c.nullable === "NO") settings.push("not null");
      if (c.default !== null && c.default !== undefined && c.default !== "") {
        settings.push(`default: \`${c.default}\``);
      }
      const suffix = settings.length > 0 ? ` [${settings.join(", ")}]` : "";
      lines.push(`  ${quoteDbmlIdent(c.name)} ${c.type}${suffix}`);
    }
    lines.push("}", "");
  }
  for (const t of schema.tables) {
    for (const fk of t.foreignKeys) {
      lines.push(
        `Ref: ${quoteDbmlIdent(t.name)}.${quoteDbmlIdent(fk.column)} > ${quoteDbmlIdent(fk.referencesTable)}.${quoteDbmlIdent(fk.referencesColumn)}`
      );
    }
  }
  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd() + "\n";
}
