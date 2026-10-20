import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Better Auth core schema — user, session, account, verification.
// Derived from the official database docs (better-auth.com/docs/concepts/database):
// TypeScript field types mapped to PostgreSQL (string -> text, Date -> timestamptz).
// Key modeling point: an account is identified by the (providerId, accountId)
// pair, not the local id — the id is only the row identifier passed to account APIs.
export const betterauthSchema: Schema = {
  tables: [
    table(
      "user",
      [
        col("id", "text", { pk: true }),
        col("name", "text"),
        col("email", "text"),
        col("emailVerified", "boolean"),
        col("image", "text", { nullable: true }),
        col("createdAt", "timestamptz"),
        col("updatedAt", "timestamptz"),
      ],
      []
    ),
    table(
      "session",
      [
        col("id", "text", { pk: true }),
        col("userId", "text"),
        col("token", "text"),
        col("expiresAt", "timestamptz"),
        col("ipAddress", "text", { nullable: true }),
        col("userAgent", "text", { nullable: true }),
        col("createdAt", "timestamptz"),
        col("updatedAt", "timestamptz"),
      ],
      [{ column: "userId", referencesTable: "user", referencesColumn: "id" }]
    ),
    table(
      "account",
      [
        col("id", "text", { pk: true }),
        col("userId", "text"),
        col("accountId", "text"),
        col("providerId", "text"),
        col("accessToken", "text", { nullable: true }),
        col("refreshToken", "text", { nullable: true }),
        col("accessTokenExpiresAt", "timestamptz", { nullable: true }),
        col("refreshTokenExpiresAt", "timestamptz", { nullable: true }),
        col("scope", "text", { nullable: true }),
        col("idToken", "text", { nullable: true }),
        col("password", "text", { nullable: true }),
        col("createdAt", "timestamptz"),
        col("updatedAt", "timestamptz"),
      ],
      [{ column: "userId", referencesTable: "user", referencesColumn: "id" }]
    ),
    table(
      "verification",
      [
        col("id", "text", { pk: true }),
        col("identifier", "text"),
        col("value", "text"),
        col("expiresAt", "timestamptz"),
        col("createdAt", "timestamptz"),
        col("updatedAt", "timestamptz"),
      ],
      []
    ),
  ],
};
