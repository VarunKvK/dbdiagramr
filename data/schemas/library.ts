import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Library management system — canonical student-project / DBMS-lab schema.
// Key modeling point: ISBN identifies a title (books), while loans always
// reference physical copies (copies) — the join that student ER diagrams
// most often get wrong.
export const librarySchema: Schema = {
  tables: [
    table(
      "publishers",
      [
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("city", "varchar", { nullable: true }),
        col("country", "varchar", { nullable: true }),
      ],
      []
    ),
    table(
      "authors",
      [
        col("id", "uuid", { pk: true }),
        col("first_name", "varchar"),
        col("last_name", "varchar"),
        col("birth_year", "integer", { nullable: true }),
      ],
      []
    ),
    table(
      "books",
      [
        col("isbn", "varchar(13)", { pk: true }),
        col("title", "varchar"),
        col("publisher_id", "uuid", { nullable: true }),
        col("published_year", "integer", { nullable: true }),
        col("edition", "integer", { default: "1" }),
        col("category", "varchar", { nullable: true }),
        col("price", "numeric(10,2)", { nullable: true }),
      ],
      [{ column: "publisher_id", referencesTable: "publishers", referencesColumn: "id" }]
    ),
    table(
      "book_authors",
      [
        col("isbn", "varchar(13)", { pk: true }),
        col("author_id", "uuid", { pk: true }),
      ],
      [
        { column: "isbn", referencesTable: "books", referencesColumn: "isbn" },
        { column: "author_id", referencesTable: "authors", referencesColumn: "id" },
      ]
    ),
    table(
      "copies",
      [
        col("id", "uuid", { pk: true }),
        col("isbn", "varchar(13)"),
        col("barcode", "varchar", { nullable: true }),
        col("shelf", "varchar", { nullable: true }),
        col("status", "varchar", { default: "'available'" }),
      ],
      [{ column: "isbn", referencesTable: "books", referencesColumn: "isbn" }]
    ),
    table(
      "members",
      [
        col("id", "uuid", { pk: true }),
        col("first_name", "varchar"),
        col("last_name", "varchar"),
        col("email", "varchar"),
        col("phone", "varchar", { nullable: true }),
        col("address", "text", { nullable: true }),
        col("joined_at", "timestamptz"),
      ],
      []
    ),
    table(
      "librarians",
      [
        col("id", "uuid", { pk: true }),
        col("first_name", "varchar"),
        col("last_name", "varchar"),
        col("login_id", "varchar"),
        col("hired_at", "timestamptz"),
      ],
      []
    ),
    table(
      "loans",
      [
        col("id", "uuid", { pk: true }),
        col("copy_id", "uuid"),
        col("member_id", "uuid"),
        col("issued_by", "uuid", { nullable: true }),
        col("issued_at", "timestamptz"),
        col("due_at", "timestamptz"),
        col("returned_at", "timestamptz", { nullable: true }),
      ],
      [
        { column: "copy_id", referencesTable: "copies", referencesColumn: "id" },
        { column: "member_id", referencesTable: "members", referencesColumn: "id" },
        { column: "issued_by", referencesTable: "librarians", referencesColumn: "id" },
      ]
    ),
    table(
      "reservations",
      [
        col("id", "uuid", { pk: true }),
        col("isbn", "varchar(13)"),
        col("member_id", "uuid"),
        col("reserved_at", "timestamptz"),
        col("fulfilled_at", "timestamptz", { nullable: true }),
      ],
      [
        { column: "isbn", referencesTable: "books", referencesColumn: "isbn" },
        { column: "member_id", referencesTable: "members", referencesColumn: "id" },
      ]
    ),
    table(
      "fines",
      [
        col("id", "uuid", { pk: true }),
        col("loan_id", "uuid"),
        col("amount", "numeric(10,2)"),
        col("paid_at", "timestamptz", { nullable: true }),
      ],
      [{ column: "loan_id", referencesTable: "loans", referencesColumn: "id" }]
    ),
  ],
};
