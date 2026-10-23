import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Pagila sample database (DVD rental store, Sakila port) — generated from
// pagila-schema.sql (devrimgunduz/pagila) via parsePostgres, then hand-verified.
// Note: the production payment table is range-partitioned by month; monthly
// payment_p* partitions are omitted here so the diagram stays readable.
export const pagilaSchema: Schema = {
  extensions: ["vector"],
  domains: [
    {
      name: "public.year",
      as: "integer",
      constraint: "CONSTRAINT year_check CHECK (((VALUE >= 1901) AND (VALUE <= 2155)))",
    },
  ],
  enums: [
    {
      name: "public.mpaa_rating",
      values: ["G", "PG", "PG-13", "R", "NC-17"],
    },
  ],
  ddlNotes: [
    "Adapted for PostgreSQL 16 from a source that targets PostgreSQL 18: uuidv7() -> gen_random_uuid(), VIRTUAL -> STORED generated columns. Requires the pgvector extension (CREATE EXTENSION vector).",
    "The official 55 monthly payment partitions (payment_p2022_01 through payment_p2026_07) are omitted from this 16-table diagram; names and bounds match pagila-schema.sql v4.1.1.",
  ],
  tables: [
    table(
      "customer",
      [
        col("customer_id", "integer", { pk: true, default: "nextval('public.customer_customer_id_seq'::regclass)" }),
        col("store_id", "integer"),
        col("first_name", "text"),
        col("last_name", "text"),
        col("email", "text", { nullable: true }),
        col("address_id", "integer"),
        col("activebool", "boolean", { default: "true" }),
        col("create_date", "date", { default: "CURRENT_DATE" }),
        col("last_update", "timestamp with time zone", { nullable: true, default: "now()" }),
        col("active", "integer", { nullable: true }),
        col("uuid", "uuid", { default: "gen_random_uuid()" }),
      ],
      [
        { column: "address_id", referencesTable: "address", referencesColumn: "address_id" },
        { column: "store_id", referencesTable: "store", referencesColumn: "store_id" },
      ]
    ),
    table(
      "actor",
      [
        col("actor_id", "integer", { pk: true, default: "nextval('public.actor_actor_id_seq'::regclass)" }),
        col("first_name", "text"),
        col("last_name", "text"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "category",
      [
        col("category_id", "integer", { pk: true, default: "nextval('public.category_category_id_seq'::regclass)" }),
        col("name", "text"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "film",
      [
        col("film_id", "integer", { pk: true, default: "nextval('public.film_film_id_seq'::regclass)" }),
        col("title", "text"),
        col("description", "text", { nullable: true }),
        col("release_year", "public.year", { nullable: true }),
        col("language_id", "integer"),
        col("original_language_id", "integer", { nullable: true }),
        col("rental_duration", "smallint", { default: "3" }),
        col("rental_rate", "numeric(4,2)", { default: "4.99" }),
        col("length", "smallint", { nullable: true }),
        col("replacement_cost", "numeric(5,2)", { default: "19.99" }),
        col("rating", "public.mpaa_rating", { nullable: true, default: "'G'" }),
        col("last_update", "timestamp with time zone", { default: "now()" }),
        col("special_features", "text[]", { nullable: true }),
        col("fulltext", "tsvector"),
        col("length_hours", "numeric(4,2) GENERATED ALWAYS AS (round(length / 60.0, 2)) STORED", { nullable: true }),
      ],
      [
        { column: "language_id", referencesTable: "language", referencesColumn: "language_id" },
        { column: "original_language_id", referencesTable: "language", referencesColumn: "language_id" },
      ]
    ),
    table(
      "film_actor",
      [
        col("actor_id", "integer", { pk: true }),
        col("film_id", "integer", { pk: true }),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "actor_id", referencesTable: "actor", referencesColumn: "actor_id" },
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
      ]
    ),
    table(
      "film_category",
      [
        col("film_id", "integer", { pk: true }),
        col("category_id", "integer", { pk: true }),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "category_id", referencesTable: "category", referencesColumn: "category_id" },
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
      ]
    ),
    table(
      "film_embedding",
      [
        col("film_id", "integer", { pk: true }),
        col("embedding", "public.vector(20)"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
      ]
    ),
    table(
      "address",
      [
        col("address_id", "integer", { pk: true, default: "nextval('public.address_address_id_seq'::regclass)" }),
        col("address", "text"),
        col("address2", "text", { nullable: true }),
        col("district", "text"),
        col("city_id", "integer"),
        col("postal_code", "text", { nullable: true }),
        col("phone", "text"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "city_id", referencesTable: "city", referencesColumn: "city_id" },
      ]
    ),
    table(
      "city",
      [
        col("city_id", "integer", { pk: true, default: "nextval('public.city_city_id_seq'::regclass)" }),
        col("city", "text"),
        col("country_id", "integer"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "country_id", referencesTable: "country", referencesColumn: "country_id" },
      ]
    ),
    table(
      "country",
      [
        col("country_id", "integer", { pk: true, default: "nextval('public.country_country_id_seq'::regclass)" }),
        col("country", "text"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "inventory",
      [
        col("inventory_id", "integer", { pk: true, default: "nextval('public.inventory_inventory_id_seq'::regclass)" }),
        col("film_id", "integer"),
        col("store_id", "integer"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
        { column: "store_id", referencesTable: "store", referencesColumn: "store_id" },
      ]
    ),
    table(
      "language",
      [
        col("language_id", "integer", { pk: true, default: "nextval('public.language_language_id_seq'::regclass)" }),
        col("name", "text"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "payment",
      [
        col("payment_id", "integer", { pk: true, default: "nextval('public.payment_payment_id_seq'::regclass)" }),
        col("customer_id", "integer"),
        col("staff_id", "integer"),
        col("rental_id", "integer"),
        col("amount", "numeric(5,2)"),
        col("payment_date", "timestamp with time zone", { pk: true }),
        col("uuid", "uuid", { default: "gen_random_uuid()" }),
      ],
      [
        // Inherited from the monthly payment_p* partition constraints in the
        // dump (pg_dump emits FKs per partition, not on the parent table).
        { column: "customer_id", referencesTable: "customer", referencesColumn: "customer_id" },
        { column: "staff_id", referencesTable: "staff", referencesColumn: "staff_id" },
        { column: "rental_id", referencesTable: "rental", referencesColumn: "rental_id" },
      ]
    ),
    table(
      "rental",
      [
        col("rental_id", "integer", { pk: true, default: "nextval('public.rental_rental_id_seq'::regclass)" }),
        col("rental_date", "timestamp with time zone"),
        col("inventory_id", "integer"),
        col("customer_id", "integer"),
        col("return_date", "timestamp with time zone", { nullable: true }),
        col("staff_id", "integer"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
        col("uuid", "uuid", { default: "gen_random_uuid()" }),
      ],
      [
        { column: "customer_id", referencesTable: "customer", referencesColumn: "customer_id" },
        { column: "inventory_id", referencesTable: "inventory", referencesColumn: "inventory_id" },
        { column: "staff_id", referencesTable: "staff", referencesColumn: "staff_id" },
      ]
    ),
    table(
      "staff",
      [
        col("staff_id", "integer", { pk: true, default: "nextval('public.staff_staff_id_seq'::regclass)" }),
        col("first_name", "text"),
        col("last_name", "text"),
        col("address_id", "integer"),
        col("email", "text", { nullable: true }),
        col("store_id", "integer"),
        col("active", "boolean", { default: "true" }),
        col("username", "text"),
        col("password", "text", { nullable: true }),
        col("last_update", "timestamp with time zone", { default: "now()" }),
        col("picture", "bytea", { nullable: true }),
      ],
      [
        { column: "address_id", referencesTable: "address", referencesColumn: "address_id" },
        { column: "store_id", referencesTable: "store", referencesColumn: "store_id" },
      ]
    ),
    table(
      "store",
      [
        col("store_id", "integer", { pk: true, default: "nextval('public.store_store_id_seq'::regclass)" }),
        col("manager_staff_id", "integer"),
        col("address_id", "integer"),
        col("last_update", "timestamp with time zone", { default: "now()" }),
      ],
      [
        { column: "address_id", referencesTable: "address", referencesColumn: "address_id" },
      ]
    ),
  ],
};
