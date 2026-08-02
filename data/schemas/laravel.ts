import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

export const laravelSchema: Schema = {
  tables: [
    table(
      "users",
      [
        col("id", "bigint", { pk: true }),
        col("name", "varchar"),
        col("email", "varchar"),
        col("email_verified_at", "timestamp", { nullable: true }),
        col("password", "varchar"),
        col("remember_token", "varchar(100)", { nullable: true }),
        col("created_at", "timestamp", { nullable: true }),
        col("updated_at", "timestamp", { nullable: true }),
      ],
      []
    ),
    table(
      "password_reset_tokens",
      [
        col("email", "varchar", { pk: true }),
        col("token", "varchar"),
        col("created_at", "timestamp", { nullable: true }),
      ],
      []
    ),
    table(
      "sessions",
      [
        col("id", "varchar", { pk: true }),
        col("user_id", "bigint", { nullable: true }),
        col("ip_address", "varchar(45)", { nullable: true }),
        col("user_agent", "text", { nullable: true }),
        col("payload", "longtext"),
        col("last_activity", "integer"),
      ],
      [
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "jobs",
      [
        col("id", "bigint", { pk: true }),
        col("queue", "varchar"),
        col("payload", "longtext"),
        col("attempts", "tinyint"),
        col("reserved_at", "integer", { nullable: true }),
        col("available_at", "integer"),
        col("created_at", "integer"),
      ],
      []
    ),
    table(
      "failed_jobs",
      [
        col("id", "bigint", { pk: true }),
        col("uuid", "varchar"),
        col("connection", "text"),
        col("queue", "text"),
        col("payload", "longtext"),
        col("exception", "longtext"),
        col("failed_at", "timestamp", { default: "now()" }),
      ],
      []
    ),
    table(
      "cache",
      [
        col("key", "varchar", { pk: true }),
        col("value", "mediumtext"),
        col("expiration", "integer"),
      ],
      []
    ),
    table(
      "cache_locks",
      [
        col("key", "varchar", { pk: true }),
        col("owner", "varchar"),
        col("expiration", "integer"),
      ],
      []
    ),
  ],
};
