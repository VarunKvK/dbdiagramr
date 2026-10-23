import assert from "node:assert/strict";
import test from "node:test";
import type { Schema } from "./diagram";
import { schemaToSql } from "./schemaExport";

const schema: Schema = {
  tables: [
    {
      name: "user",
      columns: [
        { name: "id", type: "text", nullable: "NO", default: null, isPrimaryKey: true },
      ],
      foreignKeys: [],
    },
    {
      name: "account",
      columns: [
        { name: "id", type: "text", nullable: "NO", default: null, isPrimaryKey: true },
        { name: "userId", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "userId", referencesTable: "user", referencesColumn: "id" },
      ],
    },
  ],
};

test("quotes reserved words and camelCase, leaves plain lowercase identifiers alone", () => {
  const sql = schemaToSql(schema);

  assert.match(sql, /CREATE TABLE "user" \(/);
  assert.match(sql, /"userId" text NOT NULL/);
  assert.match(sql, /CREATE TABLE account \(/);
  assert.match(sql, /FOREIGN KEY \("userId"\) REFERENCES "user" \(id\)/);
});

test("emits Postgres enum types before tables", () => {
  const sql = schemaToSql({
    enums: [{ name: "aal_level", values: ["aal1", "aal2"] }],
    tables: schema.tables,
  });

  assert.match(sql, /CREATE TYPE aal_level AS ENUM \('aal1', 'aal2'\);/);
  assert.ok(sql.indexOf("CREATE TYPE aal_level") < sql.indexOf('CREATE TABLE "user"'));
});

test("creates sequences referenced by nextval defaults before tables", () => {
  const sql = schemaToSql({
    tables: [
      {
        name: "customer",
        columns: [
          {
            name: "customer_id",
            type: "integer",
            nullable: "NO",
            default: "nextval('public.customer_customer_id_seq'::regclass)",
            isPrimaryKey: true,
          },
        ],
        foreignKeys: [],
      },
    ],
  });

  assert.match(
    sql,
    /CREATE SEQUENCE IF NOT EXISTS public\.customer_customer_id_seq;/
  );
  assert.ok(
    sql.indexOf("CREATE SEQUENCE") < sql.indexOf("CREATE TABLE customer")
  );
});
