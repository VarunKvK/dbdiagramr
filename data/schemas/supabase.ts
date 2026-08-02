import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

export const supabaseSchema: Schema = {
  tables: [
    table(
      "users",
      [
        col("instance_id", "uuid", { nullable: true }),
        col("id", "uuid", { pk: true }),
        col("aud", "varchar(255)", { nullable: true }),
        col("role", "varchar(255)", { nullable: true }),
        col("email", "varchar(255)", { nullable: true }),
        col("encrypted_password", "varchar(255)", { nullable: true }),
        col("email_confirmed_at", "timestamptz", { nullable: true }),
        col("invited_at", "timestamptz", { nullable: true }),
        col("confirmation_token", "varchar(255)", { nullable: true }),
        col("confirmation_sent_at", "timestamptz", { nullable: true }),
        col("recovery_token", "varchar(255)", { nullable: true }),
        col("recovery_sent_at", "timestamptz", { nullable: true }),
        col("email_change_token_current", "varchar(255)", { nullable: true }),
        col("email_change_token_new", "varchar(255)", { nullable: true }),
        col("email_change", "varchar(255)", { nullable: true }),
        col("email_change_sent_at", "timestamptz", { nullable: true }),
        col("last_sign_in_at", "timestamptz", { nullable: true }),
        col("raw_app_meta_data", "jsonb", { nullable: true }),
        col("raw_user_meta_data", "jsonb", { nullable: true }),
        col("is_super_admin", "bool", { nullable: true }),
        col("created_at", "timestamptz", { nullable: true }),
        col("updated_at", "timestamptz", { nullable: true }),
        col("phone", "text", { nullable: true }),
        col("phone_confirmed_at", "timestamptz", { nullable: true }),
        col("phone_change", "text", { nullable: true }),
        col("phone_change_token", "varchar(255)", { nullable: true }),
        col("phone_change_sent_at", "timestamptz", { nullable: true }),
        col("confirmed_at", "timestamptz", { nullable: true }),
        col("email_change_confirm_status", "smallint", { nullable: true }),
        col("banned_until", "timestamptz", { nullable: true }),
        col("reauthentication_token", "varchar(255)", { nullable: true }),
        col("reauthentication_sent_at", "timestamptz", { nullable: true }),
        col("is_sso_user", "bool", { default: "false" }),
        col("deleted_at", "timestamptz", { nullable: true }),
        col("is_anonymous", "bool", { default: "false" }),
      ],
      []
    ),
    table(
      "identities",
      [
        col("provider_id", "text", { nullable: true }),
        col("user_id", "uuid"),
        col("identity_data", "jsonb"),
        col("provider", "text"),
        col("last_sign_in_at", "timestamptz", { nullable: true }),
        col("created_at", "timestamptz", { nullable: true }),
        col("updated_at", "timestamptz", { nullable: true }),
        col("email", "text", { nullable: true }),
        col("id", "text", { pk: true }),
      ],
      [
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "sessions",
      [
        col("id", "uuid", { pk: true }),
        col("user_id", "uuid"),
        col("created_at", "timestamptz", { nullable: true }),
        col("updated_at", "timestamptz", { nullable: true }),
        col("factor_id", "uuid", { nullable: true }),
        col("aal", "aal_level", { nullable: true }),
        col("not_after", "timestamptz", { nullable: true }),
        col("refreshed_at", "timestamptz", { nullable: true }),
        col("user_agent", "text", { nullable: true }),
        col("ip", "inet", { nullable: true }),
        col("tag", "text", { nullable: true }),
      ],
      [
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "refresh_tokens",
      [
        col("instance_id", "uuid", { nullable: true }),
        col("id", "bigint", { pk: true }),
        col("token", "varchar(255)", { nullable: true }),
        col("user_id", "varchar(255)", { nullable: true }),
        col("revoked", "bool", { nullable: true }),
        col("created_at", "timestamptz", { nullable: true }),
        col("updated_at", "timestamptz", { nullable: true }),
        col("parent", "varchar(255)", { nullable: true }),
        col("session_id", "uuid", { nullable: true }),
      ],
      [
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "instances",
      [
        col("id", "uuid", { pk: true }),
        col("uuid", "uuid", { nullable: true }),
        col("raw_base_config", "text", { nullable: true }),
        col("created_at", "timestamptz", { nullable: true }),
        col("updated_at", "timestamptz", { nullable: true }),
      ],
      []
    ),
    table(
      "audit_log_entries",
      [
        col("instance_id", "uuid", { nullable: true }),
        col("id", "uuid", { pk: true }),
        col("payload", "json", { nullable: true }),
        col("created_at", "timestamptz", { nullable: true }),
        col("ip_address", "varchar(64)", { nullable: true }),
      ],
      []
    ),
    table(
      "schema_migrations",
      [
        col("version", "varchar(255)", { pk: true }),
      ],
      []
    ),
  ],
};
