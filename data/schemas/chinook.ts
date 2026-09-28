import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Chinook sample database (digital music store) — generated from the official
// Chinook_PostgreSql.sql dump (v1.4.5) via parsePostgres, then hand-verified.
export const chinookSchema: Schema = {
  tables: [
    table(
      "album",
      [
        col("album_id", "INT", { pk: true }),
        col("title", "VARCHAR(160)"),
        col("artist_id", "INT"),
      ],
      [
        { column: "artist_id", referencesTable: "artist", referencesColumn: "artist_id" },
      ]
    ),
    table(
      "artist",
      [
        col("artist_id", "INT", { pk: true }),
        col("name", "VARCHAR(120)", { nullable: true }),
      ],
      []
    ),
    table(
      "customer",
      [
        col("customer_id", "INT", { pk: true }),
        col("first_name", "VARCHAR(40)"),
        col("last_name", "VARCHAR(20)"),
        col("company", "VARCHAR(80)", { nullable: true }),
        col("address", "VARCHAR(70)", { nullable: true }),
        col("city", "VARCHAR(40)", { nullable: true }),
        col("state", "VARCHAR(40)", { nullable: true }),
        col("country", "VARCHAR(40)", { nullable: true }),
        col("postal_code", "VARCHAR(10)", { nullable: true }),
        col("phone", "VARCHAR(24)", { nullable: true }),
        col("fax", "VARCHAR(24)", { nullable: true }),
        col("email", "VARCHAR(60)"),
        col("support_rep_id", "INT", { nullable: true }),
      ],
      [
        { column: "support_rep_id", referencesTable: "employee", referencesColumn: "employee_id" },
      ]
    ),
    table(
      "employee",
      [
        col("employee_id", "INT", { pk: true }),
        col("last_name", "VARCHAR(20)"),
        col("first_name", "VARCHAR(20)"),
        col("title", "VARCHAR(30)", { nullable: true }),
        col("reports_to", "INT", { nullable: true }),
        col("birth_date", "TIMESTAMP", { nullable: true }),
        col("hire_date", "TIMESTAMP", { nullable: true }),
        col("address", "VARCHAR(70)", { nullable: true }),
        col("city", "VARCHAR(40)", { nullable: true }),
        col("state", "VARCHAR(40)", { nullable: true }),
        col("country", "VARCHAR(40)", { nullable: true }),
        col("postal_code", "VARCHAR(10)", { nullable: true }),
        col("phone", "VARCHAR(24)", { nullable: true }),
        col("fax", "VARCHAR(24)", { nullable: true }),
        col("email", "VARCHAR(60)", { nullable: true }),
      ],
      [
        { column: "reports_to", referencesTable: "employee", referencesColumn: "employee_id" },
      ]
    ),
    table(
      "genre",
      [
        col("genre_id", "INT", { pk: true }),
        col("name", "VARCHAR(120)", { nullable: true }),
      ],
      []
    ),
    table(
      "invoice",
      [
        col("invoice_id", "INT", { pk: true }),
        col("customer_id", "INT"),
        col("invoice_date", "TIMESTAMP"),
        col("billing_address", "VARCHAR(70)", { nullable: true }),
        col("billing_city", "VARCHAR(40)", { nullable: true }),
        col("billing_state", "VARCHAR(40)", { nullable: true }),
        col("billing_country", "VARCHAR(40)", { nullable: true }),
        col("billing_postal_code", "VARCHAR(10)", { nullable: true }),
        col("total", "NUMERIC(10,2)"),
      ],
      [
        { column: "customer_id", referencesTable: "customer", referencesColumn: "customer_id" },
      ]
    ),
    table(
      "invoice_line",
      [
        col("invoice_line_id", "INT", { pk: true }),
        col("invoice_id", "INT"),
        col("track_id", "INT"),
        col("unit_price", "NUMERIC(10,2)"),
        col("quantity", "INT"),
      ],
      [
        { column: "invoice_id", referencesTable: "invoice", referencesColumn: "invoice_id" },
        { column: "track_id", referencesTable: "track", referencesColumn: "track_id" },
      ]
    ),
    table(
      "media_type",
      [
        col("media_type_id", "INT", { pk: true }),
        col("name", "VARCHAR(120)", { nullable: true }),
      ],
      []
    ),
    table(
      "playlist",
      [
        col("playlist_id", "INT", { pk: true }),
        col("name", "VARCHAR(120)", { nullable: true }),
      ],
      []
    ),
    table(
      "playlist_track",
      [
        col("playlist_id", "INT", { pk: true }),
        col("track_id", "INT", { pk: true }),
      ],
      [
        { column: "playlist_id", referencesTable: "playlist", referencesColumn: "playlist_id" },
        { column: "track_id", referencesTable: "track", referencesColumn: "track_id" },
      ]
    ),
    table(
      "track",
      [
        col("track_id", "INT", { pk: true }),
        col("name", "VARCHAR(200)"),
        col("album_id", "INT", { nullable: true }),
        col("media_type_id", "INT"),
        col("genre_id", "INT", { nullable: true }),
        col("composer", "VARCHAR(220)", { nullable: true }),
        col("milliseconds", "INT"),
        col("bytes", "INT", { nullable: true }),
        col("unit_price", "NUMERIC(10,2)"),
      ],
      [
        { column: "album_id", referencesTable: "album", referencesColumn: "album_id" },
        { column: "genre_id", referencesTable: "genre", referencesColumn: "genre_id" },
        { column: "media_type_id", referencesTable: "media_type", referencesColumn: "media_type_id" },
      ]
    ),
  ],
};

