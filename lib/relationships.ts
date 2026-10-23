import type { ForeignKey, Schema, Table } from "@/lib/diagram";

export type RelationshipKind =
  | "one-to-many"
  | "one-to-one"
  | "self"
  | "many-to-many";

export type Relationship = {
  table: string;
  columns: string[];
  referencesTable: string;
  referencesColumns: string[];
  kind: RelationshipKind;
  nullable: boolean;
  sentence: string;
};

const IRREGULAR_SINGULAR: Record<string, string> = {
  people: "person",
  children: "child",
  men: "man",
  women: "woman",
  teeth: "tooth",
  feet: "foot",
};

const IRREGULAR_PLURAL: Record<string, string> = {
  person: "people",
  child: "children",
  man: "men",
  woman: "women",
  tooth: "teeth",
  foot: "feet",
};

function lastWord(value: string): string {
  const parts = value.split(" ");
  return parts[parts.length - 1] ?? value;
}

function replaceLastWord(value: string, replacement: string): string {
  const parts = value.split(" ");
  parts[parts.length - 1] = replacement;
  return parts.join(" ");
}

export function singularize(word: string): string {
  const lower = word.toLowerCase();
  if (IRREGULAR_SINGULAR[lower]) return IRREGULAR_SINGULAR[lower];
  if (lower.endsWith("ies") && lower.length > 3) return `${word.slice(0, -3)}y`;
  if (/(ses|xes|zes|ches|shes)$/.test(lower)) return word.slice(0, -2);
  if (lower.endsWith("s") && !lower.endsWith("ss")) return word.slice(0, -1);
  return word;
}

export function pluralize(word: string): string {
  const lower = word.toLowerCase();
  if (IRREGULAR_PLURAL[lower]) return IRREGULAR_PLURAL[lower];
  if (lower.endsWith("ies")) return word;
  if (lower.endsWith("s") && !lower.endsWith("ss")) return word;
  if (/(s|x|z|ch|sh)$/.test(lower)) return `${word}es`;
  if (lower.endsWith("y") && !/[aeiou]y$/.test(lower)) {
    return `${word.slice(0, -1)}ies`;
  }
  return `${word}s`;
}

function humanize(value: string): string {
  return (value.split(".").pop() ?? value).replace(/_/g, " ");
}

export function singularLabel(value: string): string {
  const label = humanize(value);
  return replaceLastWord(label, singularize(lastWord(label)));
}

export function pluralLabel(value: string): string {
  const label = humanize(value);
  return replaceLastWord(label, pluralize(lastWord(label)));
}

function isNullable(table: Table, column: string): boolean {
  return table.columns.find((item) => item.name === column)?.nullable === "YES";
}

function junctionForeignKeys(table: Table): ForeignKey[] | null {
  if (table.foreignKeys.length !== 2) return null;
  const pkColumns = table.columns
    .filter((column) => column.isPrimaryKey)
    .map((column) => column.name);
  if (pkColumns.length !== 2) return null;

  const fkColumns = table.foreignKeys.map((fk) => fk.column);
  const uniqueFkColumns = new Set(fkColumns);
  if (uniqueFkColumns.size !== 2) return null;

  const pkSet = new Set(pkColumns);
  return fkColumns.every((column) => pkSet.has(column)) ? table.foreignKeys : null;
}

function manyToManySentence(table: Table, first: ForeignKey, second: ForeignKey): string {
  return `Many ${pluralLabel(first.referencesTable)} can have many ${pluralLabel(
    second.referencesTable
  )} through ${table.name} (${table.name}.${first.column} -> ${first.referencesTable}.${first.referencesColumn}, ${table.name}.${second.column} -> ${second.referencesTable}.${second.referencesColumn}).`;
}

function sentenceFor(
  table: Table,
  fk: ForeignKey,
  kind: Exclude<RelationshipKind, "many-to-many">
): string {
  const nullable = isNullable(table, fk.column);
  const qualifier = nullable ? "optional" : "required";
  const reference = `${table.name}.${fk.column} -> ${fk.referencesTable}.${fk.referencesColumn}`;

  if (kind === "self") {
    return `One ${singularLabel(table.name)} can have many child ${pluralLabel(
      table.name
    )} (${reference}, ${qualifier}).`;
  }
  if (kind === "one-to-one") {
    return `Each ${singularLabel(table.name)} has one ${singularLabel(
      fk.referencesTable
    )} (${reference}, ${qualifier}).`;
  }
  return `One ${singularLabel(fk.referencesTable)} can have many ${pluralLabel(
    table.name
  )} (${reference}, ${qualifier}).`;
}

export function relationshipForForeignKey(table: Table, fk: ForeignKey): Relationship {
  const pkColumns = table.columns
    .filter((column) => column.isPrimaryKey)
    .map((column) => column.name);
  const kind: Exclude<RelationshipKind, "many-to-many"> =
    fk.referencesTable === table.name
      ? "self"
      : pkColumns.length === 1 && pkColumns[0] === fk.column
        ? "one-to-one"
        : "one-to-many";

  return {
    table: table.name,
    columns: [fk.column],
    referencesTable: fk.referencesTable,
    referencesColumns: [fk.referencesColumn],
    kind,
    nullable: isNullable(table, fk.column),
    sentence: sentenceFor(table, fk, kind),
  };
}

export function getRelationships(schema: Schema): Relationship[] {
  const relationships: Relationship[] = [];

  for (const table of schema.tables) {
    const junction = junctionForeignKeys(table);
    if (junction) {
      const [first, second] = junction;
      relationships.push({
        table: table.name,
        columns: junction.map((fk) => fk.column),
        referencesTable: `${first.referencesTable}, ${second.referencesTable}`,
        referencesColumns: junction.map((fk) => `${fk.referencesTable}.${fk.referencesColumn}`),
        kind: "many-to-many",
        nullable: false,
        sentence: manyToManySentence(table, first, second),
      });
      continue;
    }

    for (const fk of table.foreignKeys) {
      relationships.push(relationshipForForeignKey(table, fk));
    }
  }

  return relationships;
}

export function columnForeignKeyMap(table: Table): Map<string, ForeignKey[]> {
  const map = new Map<string, ForeignKey[]>();
  for (const fk of table.foreignKeys) {
    const list = map.get(fk.column) ?? [];
    list.push(fk);
    map.set(fk.column, list);
  }
  return map;
}
