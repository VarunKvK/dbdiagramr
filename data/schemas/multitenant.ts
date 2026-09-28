import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Multi-tenant SaaS, shared-schema pattern with a leading tenant_id column
// on every table. PKs and FKs are composite (tenant_id, id) — the Citus /
// Azure guidance — so cross-tenant joins are impossible at the database
// level and tables can be hash-sharded on tenant_id later.
export const multitenantSchema: Schema = {
  tables: [
    table(
      "tenants",
      [
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("slug", "varchar"),
        col("plan", "varchar", { default: "'free'" }),
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
      "tenant_users",
      [
        col("tenant_id", "uuid"),
        col("user_id", "uuid"),
        col("role", "varchar", { default: "'member'" }),
        col("joined_at", "timestamptz"),
      ],
      [
        { column: "tenant_id", referencesTable: "tenants", referencesColumn: "id" },
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "projects",
      [
        col("tenant_id", "uuid"),
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("status", "varchar", { default: "'active'" }),
        col("created_by", "uuid", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      [
        { column: "tenant_id", referencesTable: "tenants", referencesColumn: "id" },
        { column: "created_by", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "tasks",
      [
        col("tenant_id", "uuid"),
        col("id", "uuid", { pk: true }),
        col("project_id", "uuid"),
        col("title", "varchar"),
        col("status", "varchar", { default: "'todo'" }),
        col("assignee_id", "uuid", { nullable: true }),
        col("due_at", "timestamptz", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      [
        { column: "tenant_id", referencesTable: "tenants", referencesColumn: "id" },
        { column: "project_id", referencesTable: "projects", referencesColumn: "id" },
        { column: "assignee_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "invitations",
      [
        col("tenant_id", "uuid"),
        col("id", "uuid", { pk: true }),
        col("email", "varchar"),
        col("role", "varchar", { default: "'member'" }),
        col("token", "varchar"),
        col("expires_at", "timestamptz"),
        col("accepted_at", "timestamptz", { nullable: true }),
      ],
      [{ column: "tenant_id", referencesTable: "tenants", referencesColumn: "id" }]
    ),
    table(
      "api_keys",
      [
        col("tenant_id", "uuid"),
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("key_hash", "varchar"),
        col("key_prefix", "varchar", { nullable: true }),
        col("revoked_at", "timestamptz", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      [{ column: "tenant_id", referencesTable: "tenants", referencesColumn: "id" }]
    ),
    table(
      "events",
      [
        col("tenant_id", "uuid"),
        col("id", "uuid", { pk: true }),
        col("actor_id", "uuid", { nullable: true }),
        col("action", "varchar"),
        col("entity", "varchar", { nullable: true }),
        col("entity_id", "uuid", { nullable: true }),
        col("metadata", "jsonb", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      [
        { column: "tenant_id", referencesTable: "tenants", referencesColumn: "id" },
        { column: "actor_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
  ],
};
