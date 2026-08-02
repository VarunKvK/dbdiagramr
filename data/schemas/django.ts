import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

export const djangoSchema: Schema = {
  tables: [
    table(
      "auth_user",
      [
        col("id", "integer", { pk: true }),
        col("password", "varchar(128)"),
        col("last_login", "timestamp", { nullable: true }),
        col("is_superuser", "boolean", { default: "false" }),
        col("username", "varchar(150)"),
        col("first_name", "varchar(150)"),
        col("last_name", "varchar(150)"),
        col("email", "varchar(254)", { nullable: true }),
        col("is_staff", "boolean", { default: "false" }),
        col("is_active", "boolean", { default: "true" }),
        col("date_joined", "timestamp", { default: "now()" }),
      ],
      []
    ),
    table(
      "auth_group",
      [
        col("id", "integer", { pk: true }),
        col("name", "varchar(150)"),
      ],
      []
    ),
    table(
      "auth_permission",
      [
        col("id", "integer", { pk: true }),
        col("name", "varchar(255)"),
        col("content_type_id", "integer"),
        col("codename", "varchar(100)"),
      ],
      [
        {
          column: "content_type_id",
          referencesTable: "django_content_type",
          referencesColumn: "id",
        },
      ]
    ),
    table(
      "auth_user_groups",
      [
        col("id", "integer", { pk: true }),
        col("user_id", "integer"),
        col("group_id", "integer"),
      ],
      [
        { column: "user_id", referencesTable: "auth_user", referencesColumn: "id" },
        { column: "group_id", referencesTable: "auth_group", referencesColumn: "id" },
      ]
    ),
    table(
      "auth_user_user_permissions",
      [
        col("id", "integer", { pk: true }),
        col("user_id", "integer"),
        col("permission_id", "integer"),
      ],
      [
        { column: "user_id", referencesTable: "auth_user", referencesColumn: "id" },
        {
          column: "permission_id",
          referencesTable: "auth_permission",
          referencesColumn: "id",
        },
      ]
    ),
    table(
      "auth_group_permissions",
      [
        col("id", "integer", { pk: true }),
        col("group_id", "integer"),
        col("permission_id", "integer"),
      ],
      [
        { column: "group_id", referencesTable: "auth_group", referencesColumn: "id" },
        {
          column: "permission_id",
          referencesTable: "auth_permission",
          referencesColumn: "id",
        },
      ]
    ),
    table(
      "django_content_type",
      [
        col("id", "integer", { pk: true }),
        col("app_label", "varchar(100)"),
        col("model", "varchar(100)"),
      ],
      []
    ),
    table(
      "django_admin_log",
      [
        col("id", "integer", { pk: true }),
        col("action_time", "timestamp"),
        col("object_id", "text", { nullable: true }),
        col("object_repr", "varchar(200)"),
        col("action_flag", "smallint"),
        col("change_message", "text"),
        col("content_type_id", "integer", { nullable: true }),
        col("user_id", "integer"),
      ],
      [
        {
          column: "content_type_id",
          referencesTable: "django_content_type",
          referencesColumn: "id",
        },
        { column: "user_id", referencesTable: "auth_user", referencesColumn: "id" },
      ]
    ),
    table(
      "django_session",
      [
        col("session_key", "varchar(40)", { pk: true }),
        col("session_data", "text"),
        col("expire_date", "timestamp"),
      ],
      []
    ),
  ],
};
