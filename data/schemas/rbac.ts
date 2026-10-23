import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Role-based access control (RBAC) — canonical 5-table pattern plus org
// scoping for multi-tenant apps. Key modeling point: roles belong to an
// organization, so permissions resolve tenant-relative without a tenant
// column on every table; two join tables (membership_roles,
// role_permissions) carry the many-to-many edges.
export const rbacSchema: Schema = {
  tables: [
    table(
      "organizations",
      [
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("slug", "varchar"),
        col("created_at", "timestamptz"),
      ],
      []
    ),
    table(
      "users",
      [
        col("id", "uuid", { pk: true }),
        col("email", "varchar"),
        col("name", "varchar", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      []
    ),
    table(
      "memberships",
      [
        col("id", "uuid", { pk: true }),
        col("organization_id", "uuid"),
        col("user_id", "uuid"),
        col("joined_at", "timestamptz"),
      ],
      [
        { column: "organization_id", referencesTable: "organizations", referencesColumn: "id" },
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "roles",
      [
        col("id", "uuid", { pk: true }),
        col("organization_id", "uuid"),
        col("name", "varchar"),
        col("description", "text", { nullable: true }),
      ],
      [{ column: "organization_id", referencesTable: "organizations", referencesColumn: "id" }]
    ),
    table(
      "permissions",
      [
        col("id", "uuid", { pk: true }),
        col("resource", "varchar"),
        col("action", "varchar"),
        col("description", "text", { nullable: true }),
      ],
      []
    ),
    table(
      "membership_roles",
      [
        col("membership_id", "uuid", { pk: true }),
        col("role_id", "uuid", { pk: true }),
        col("granted_at", "timestamptz"),
      ],
      [
        { column: "membership_id", referencesTable: "memberships", referencesColumn: "id" },
        { column: "role_id", referencesTable: "roles", referencesColumn: "id" },
      ]
    ),
    table(
      "role_permissions",
      [
        col("role_id", "uuid", { pk: true }),
        col("permission_id", "uuid", { pk: true }),
      ],
      [
        { column: "role_id", referencesTable: "roles", referencesColumn: "id" },
        { column: "permission_id", referencesTable: "permissions", referencesColumn: "id" },
      ]
    ),
  ],
};
