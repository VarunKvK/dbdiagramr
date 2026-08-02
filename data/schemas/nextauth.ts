import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

export const nextauthSchema: Schema = {
  tables: [
    table(
      "users",
      [
        col("id", "text", { pk: true }),
        col("name", "text", { nullable: true }),
        col("email", "text", { nullable: true }),
        col("emailVerified", "timestamptz", { nullable: true }),
        col("image", "text", { nullable: true }),
      ],
      []
    ),
    table(
      "accounts",
      [
        col("id", "text", { pk: true }),
        col("userId", "text"),
        col("type", "text"),
        col("provider", "text"),
        col("providerAccountId", "text"),
        col("refresh_token", "text", { nullable: true }),
        col("access_token", "text", { nullable: true }),
        col("expires_at", "integer", { nullable: true }),
        col("token_type", "text", { nullable: true }),
        col("scope", "text", { nullable: true }),
        col("id_token", "text", { nullable: true }),
        col("session_state", "text", { nullable: true }),
      ],
      [
        { column: "userId", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "sessions",
      [
        col("id", "text", { pk: true }),
        col("sessionToken", "text"),
        col("userId", "text"),
        col("expires", "timestamptz"),
      ],
      [
        { column: "userId", referencesTable: "users", referencesColumn: "id" },
      ]
    ),
    table(
      "verification_tokens",
      [
        col("identifier", "text"),
        col("token", "text"),
        col("expires", "timestamptz"),
      ],
      []
    ),
  ],
};
