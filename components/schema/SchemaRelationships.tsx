import type { Schema } from "@/lib/diagram";
import { getRelationships, type RelationshipKind } from "@/lib/relationships";

const KIND_LABEL: Record<RelationshipKind, string> = {
  "one-to-many": "One-to-many",
  "one-to-one": "One-to-one",
  self: "Self-referencing",
  "many-to-many": "Many-to-many",
};

function relationshipPath(relationship: {
  kind: RelationshipKind;
  table: string;
  columns: string[];
  referencesTable: string;
  referencesColumns: string[];
}): string {
  if (relationship.kind === "many-to-many") {
    return `${relationship.table} (${relationship.columns[0]} -> ${relationship.referencesColumns[0]}, ${relationship.columns[1]} -> ${relationship.referencesColumns[1]})`;
  }
  return `${relationship.table}.${relationship.columns.join(", ")} → ${relationship.referencesTable}.${relationship.referencesColumns.join(", ")}`;
}

export default function SchemaRelationships({
  schema,
  note,
}: {
  schema: Schema;
  note?: string;
}) {
  const relationships = getRelationships(schema);
  if (relationships.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="mb-3 text-2xl font-semibold tracking-tight text-ink">
        Table relationships
      </h2>
      <p className="mb-3 max-w-3xl leading-relaxed text-muted">
        {relationships.length} relationships connect the tables in this schema.
        Each entry shows the child columns, the parent columns they reference, and
        the cardinality.
      </p>
      {note && (
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-muted">
          {note}
        </p>
      )}
      {!note && <div className="mb-6" />}
      <div className="space-y-3 md:hidden">
        {relationships.map((relationship, index) => (
          <div
            key={`${relationship.table}-${relationship.columns.join("-")}-${index}`}
            className="rounded-[20px] border border-border bg-white p-4 shadow-sm"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-accent bg-accent-soft px-2 py-0.5 text-xs font-medium text-accent">
                {KIND_LABEL[relationship.kind]}
              </span>
            </div>
            <p className="mt-2 break-all font-mono text-xs leading-relaxed text-ink">
              {relationshipPath(relationship)}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {relationship.sentence}
            </p>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto rounded-[20px] border border-border bg-white shadow-sm md:block">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-border bg-surface text-left">
              <th className="px-4 py-3 font-medium text-ink">Relationship</th>
              <th className="px-4 py-3 font-medium text-ink">Type</th>
              <th className="px-4 py-3 font-medium text-ink">Meaning</th>
            </tr>
          </thead>
          <tbody>
            {relationships.map((relationship, index) => (
              <tr
                key={`${relationship.table}-${relationship.columns.join("-")}-${index}`}
                className="border-b border-border last:border-b-0"
              >
                <td className="whitespace-nowrap px-4 py-2.5 font-mono text-ink">
                  {relationshipPath(relationship)}
                </td>
                <td className="whitespace-nowrap px-4 py-2.5 text-muted">
                  {KIND_LABEL[relationship.kind]}
                </td>
                <td className="px-4 py-2.5 text-muted">
                  {relationship.sentence}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
