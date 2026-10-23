import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

export const nextauthSchema: Schema = {
  tables: [
    table(
      "users",
      [
        col("id", "integer", { pk: true, default: "nextval('public.users_id_seq'::regclass)" }),
        col("name", "varchar(255)", { nullable: true }),
        col("email", "varchar(255)", { nullable: true }),
        col("emailVerified", "timestamptz", { nullable: true }),
        col("image", "text", { nullable: true }),
      ],
      []
    ),
    table(
      "accounts",
      [
        col("id", "integer", { pk: true, default: "nextval('public.accounts_id_seq'::regclass)" }),
        col("userId", "integer"),
        col("type", "varchar(255)"),
        col("provider", "varchar(255)"),
        col("providerAccountId", "varchar(255)"),
        col("refresh_token", "text", { nullable: true }),
        col("access_token", "text", { nullable: true }),
        col("expires_at", "bigint", { nullable: true }),
        col("id_token", "text", { nullable: true }),
        col("scope", "text", { nullable: true }),
        col("session_state", "text", { nullable: true }),
        col("token_type", "text", { nullable: true }),
      ],
      [
        { column: "userId", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "sessions",
      [
        col("id", "integer", { pk: true, default: "nextval('public.sessions_id_seq'::regclass)" }),
        col("userId", "integer"),
        col("expires", "timestamptz"),
        col("sessionToken", "varchar(255)"),
      ],
      [
        { column: "userId", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "verification_token",
      [
        col("identifier", "text", { pk: true }),
        col("token", "text", { pk: true }),
        col("expires", "timestamptz"),
      ],
      []
    ),
  ],
};
