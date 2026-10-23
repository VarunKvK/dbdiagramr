import type { RlsInfo, Schema } from "@/lib/diagram";

export type RlsStatus = "protected" | "no-policies" | "disabled" | "unknown";

export const RLS_META: Record<
  RlsStatus,
  { label: string; color: string; description: string }
> = {
  protected: {
    label: "RLS on, has policies",
    color: "#2f7d32",
    description:
      "RLS is on and at least one policy exists. Review that the policies are restrictive; USING (true) still exposes the table.",
  },
  "no-policies": {
    label: "RLS on, no policies",
    color: "#b45309",
    description:
      "RLS is on with zero policies. Non-owners are denied by default.",
  },
  disabled: {
    label: "RLS off",
    color: "#b91c1c",
    description:
      "RLS is off. Check table grants and whether the table is exposed through your API.",
  },
  unknown: {
    label: "RLS unknown",
    color: "#9ca3af",
    description: "Connect live to read RLS flags from PostgreSQL.",
  },
};

export function rlsStatus(rls?: RlsInfo): RlsStatus {
  if (!rls) return "unknown";
  if (!rls.enabled) return "disabled";
  return rls.policyCount > 0 ? "protected" : "no-policies";
}

export function rlsHint(table: { name: string; rls?: RlsInfo }): string {
  const rls = table.rls;
  switch (rlsStatus(rls)) {
    case "protected":
      return `${table.name}: RLS on, ${rls!.policyCount} ${
        rls!.policyCount === 1 ? "policy" : "policies"
      }${rls!.forced ? ", forced" : ""}. Review that they are restrictive.`;
    case "no-policies":
      return `${table.name}: RLS on but 0 policies. Non-owners are denied.`;
    case "disabled":
      return `${table.name}: RLS off. Check grants and API exposure.`;
    default:
      return `${table.name}: RLS unknown. Connect live to check.`;
  }
}

export type RlsSummary = {
  hasRls: boolean;
  total: number;
  disabled: number;
  noPolicies: number;
  protected: number;
};

function isPublicSchemaTable(table: Schema["tables"][number]): boolean {
  if (table.schema) return table.schema === "public";
  return !table.name.includes(".");
}

export function rlsSummary(schema: Schema): RlsSummary {
  const tables = schema.tables.filter(isPublicSchemaTable);
  let disabled = 0;
  let noPolicies = 0;
  let protectedTables = 0;

  for (const table of tables) {
    const status = rlsStatus(table.rls);
    if (status === "disabled") disabled += 1;
    else if (status === "no-policies") noPolicies += 1;
    else if (status === "protected") protectedTables += 1;
  }

  return {
    hasRls: tables.some((table) => table.rls !== undefined),
    total: tables.length,
    disabled,
    noPolicies,
    protected: protectedTables,
  };
}
