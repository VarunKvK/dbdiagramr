import type { Schema } from "@/lib/diagram";

export const rlsDemoSchema: Schema = {
  tables: [
    {
      name: "profiles",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "email", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "plan", type: "text", nullable: "NO", default: "'free'", isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "NO", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [],
      rls: { enabled: true, forced: false, policyCount: 3 },
    },
    {
      name: "posts",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "author_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "title", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "published", type: "boolean", nullable: "NO", default: "false", isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "NO", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "author_id", referencesTable: "profiles", referencesColumn: "id" },
      ],
      rls: { enabled: true, forced: false, policyCount: 2 },
    },
    {
      name: "comments",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "post_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "author_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "body", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "NO", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "author_id", referencesTable: "profiles", referencesColumn: "id" },
      ],
      rls: { enabled: true, forced: false, policyCount: 0 },
    },
    {
      name: "orders",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "customer_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "total", type: "numeric(10,2)", nullable: "NO", default: "0", isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "NO", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "customer_id", referencesTable: "profiles", referencesColumn: "id" },
      ],
      rls: { enabled: false, forced: false, policyCount: 0 },
    },
    {
      name: "order_items",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "order_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "product_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "quantity", type: "integer", nullable: "NO", default: "1", isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "order_id", referencesTable: "orders", referencesColumn: "id" },
      ],
      rls: { enabled: false, forced: false, policyCount: 0 },
    },
    {
      name: "audit_log",
      columns: [
        { name: "id", type: "bigint", nullable: "NO", default: "nextval('audit_log_id_seq')", isPrimaryKey: true },
        { name: "actor_id", type: "uuid", nullable: "YES", default: null, isPrimaryKey: false },
        { name: "action", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "NO", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "actor_id", referencesTable: "profiles", referencesColumn: "id" },
      ],
      rls: { enabled: true, forced: true, policyCount: 1 },
    },
  ],
};
