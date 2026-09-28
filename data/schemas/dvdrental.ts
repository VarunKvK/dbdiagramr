import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// DVD Rental sample database (postgresqltutorial.com) — generated from the
// plain-SQL dump (neondatabase/postgres-sample-dbs dvdrental.sql) via parsePostgres,
// then hand-verified.
export const dvdrentalSchema: Schema = {
  tables: [
    table(
      "customer",
      [
        col("customer_id", "integer", { pk: true, default: "nextval('public.customer_customer_id_seq'::regclass)" }),
        col("store_id", "smallint"),
        col("first_name", "character varying(45)"),
        col("last_name", "character varying(45)"),
        col("email", "character varying(50)", { nullable: true }),
        col("address_id", "smallint"),
        col("activebool", "boolean", { default: "true" }),
        col("create_date", "date", { default: "('now'::text)::date" }),
        col("last_update", "timestamp without time zone", { nullable: true, default: "now()" }),
        col("active", "integer", { nullable: true }),
      ],
      [
        { column: "address_id", referencesTable: "address", referencesColumn: "address_id" },
        // The simplified dump omits this constraint; the official DVD Rental
        // schema defines customer.store_id -> store.store_id.
        { column: "store_id", referencesTable: "store", referencesColumn: "store_id" },
      ]
    ),
    table(
      "actor",
      [
        col("actor_id", "integer", { pk: true, default: "nextval('public.actor_actor_id_seq'::regclass)" }),
        col("first_name", "character varying(45)"),
        col("last_name", "character varying(45)"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "category",
      [
        col("category_id", "integer", { pk: true, default: "nextval('public.category_category_id_seq'::regclass)" }),
        col("name", "character varying(25)"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "film",
      [
        col("film_id", "integer", { pk: true, default: "nextval('public.film_film_id_seq'::regclass)" }),
        col("title", "character varying(255)"),
        col("description", "text", { nullable: true }),
        col("release_year", "public.year", { nullable: true }),
        col("language_id", "smallint"),
        col("rental_duration", "smallint", { default: "3" }),
        col("rental_rate", "numeric(4,2)", { default: "4.99" }),
        col("length", "smallint", { nullable: true }),
        col("replacement_cost", "numeric(5,2)", { default: "19.99" }),
        col("rating", "public.mpaa_rating", { nullable: true, default: "'G'" }),
        col("last_update", "timestamp without time zone", { default: "now()" }),
        col("special_features", "text[]", { nullable: true }),
        col("fulltext", "tsvector"),
      ],
      [
        { column: "language_id", referencesTable: "language", referencesColumn: "language_id" },
      ]
    ),
    table(
      "film_actor",
      [
        col("actor_id", "smallint", { pk: true }),
        col("film_id", "smallint", { pk: true }),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      [
        { column: "actor_id", referencesTable: "actor", referencesColumn: "actor_id" },
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
      ]
    ),
    table(
      "film_category",
      [
        col("film_id", "smallint", { pk: true }),
        col("category_id", "smallint", { pk: true }),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      [
        { column: "category_id", referencesTable: "category", referencesColumn: "category_id" },
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
      ]
    ),
    table(
      "address",
      [
        col("address_id", "integer", { pk: true, default: "nextval('public.address_address_id_seq'::regclass)" }),
        col("address", "character varying(50)"),
        col("address2", "character varying(50)", { nullable: true }),
        col("district", "character varying(20)"),
        col("city_id", "smallint"),
        col("postal_code", "character varying(10)", { nullable: true }),
        col("phone", "character varying(20)"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      [
        { column: "city_id", referencesTable: "city", referencesColumn: "city_id" },
      ]
    ),
    table(
      "city",
      [
        col("city_id", "integer", { pk: true, default: "nextval('public.city_city_id_seq'::regclass)" }),
        col("city", "character varying(50)"),
        col("country_id", "smallint"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      [
        { column: "country_id", referencesTable: "country", referencesColumn: "country_id" },
      ]
    ),
    table(
      "country",
      [
        col("country_id", "integer", { pk: true, default: "nextval('public.country_country_id_seq'::regclass)" }),
        col("country", "character varying(50)"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "inventory",
      [
        col("inventory_id", "integer", { pk: true, default: "nextval('public.inventory_inventory_id_seq'::regclass)" }),
        col("film_id", "smallint"),
        col("store_id", "smallint"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      [
        { column: "film_id", referencesTable: "film", referencesColumn: "film_id" },
        // The simplified dump omits this constraint; the official DVD Rental
        // schema defines inventory.store_id -> store.store_id.
        { column: "store_id", referencesTable: "store", referencesColumn: "store_id" },
      ]
    ),
    table(
      "language",
      [
        col("language_id", "integer", { pk: true, default: "nextval('public.language_language_id_seq'::regclass)" }),
        col("name", "character(20)"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      []
    ),
    table(
      "payment",
      [
        col("payment_id", "integer", { pk: true, default: "nextval('public.payment_payment_id_seq'::regclass)" }),
        col("customer_id", "smallint"),
        col("staff_id", "smallint"),
        col("rental_id", "integer"),
        col("amount", "numeric(5,2)"),
        col("payment_date", "timestamp without time zone"),
      ],
      [
        { column: "customer_id", referencesTable: "customer", referencesColumn: "customer_id" },
        { column: "rental_id", referencesTable: "rental", referencesColumn: "rental_id" },
        { column: "staff_id", referencesTable: "staff", referencesColumn: "staff_id" },
      ]
    ),
    table(
      "rental",
      [
        col("rental_id", "integer", { pk: true, default: "nextval('public.rental_rental_id_seq'::regclass)" }),
        col("rental_date", "timestamp without time zone"),
        col("inventory_id", "integer"),
        col("customer_id", "smallint"),
        col("return_date", "timestamp without time zone", { nullable: true }),
        col("staff_id", "smallint"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
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
        col("first_name", "character varying(45)"),
        col("last_name", "character varying(45)"),
        col("address_id", "smallint"),
        col("email", "character varying(50)", { nullable: true }),
        col("store_id", "smallint"),
        col("active", "boolean", { default: "true" }),
        col("username", "character varying(16)"),
        col("password", "character varying(40)", { nullable: true }),
        col("last_update", "timestamp without time zone", { default: "now()" }),
        col("picture", "bytea", { nullable: true }),
      ],
      [
        { column: "address_id", referencesTable: "address", referencesColumn: "address_id" },
        // The simplified dump omits this constraint; the official DVD Rental
        // schema defines staff.store_id -> store.store_id.
        { column: "store_id", referencesTable: "store", referencesColumn: "store_id" },
      ]
    ),
    table(
      "store",
      [
        col("store_id", "integer", { pk: true, default: "nextval('public.store_store_id_seq'::regclass)" }),
        col("manager_staff_id", "smallint"),
        col("address_id", "smallint"),
        col("last_update", "timestamp without time zone", { default: "now()" }),
      ],
      [
        { column: "address_id", referencesTable: "address", referencesColumn: "address_id" },
        { column: "manager_staff_id", referencesTable: "staff", referencesColumn: "staff_id" },
      ]
    ),
  ],
};
