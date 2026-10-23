import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Northwind Traders sample database (Microsoft sample, PostgreSQL port) — generated from
// the northwind_psql dump (pthom/northwind_psql) via parsePostgres, then hand-verified.
export const northwindSchema: Schema = {
  tables: [
    table(
      "categories",
      [
        col("category_id", "smallint", { pk: true }),
        col("category_name", "character varying(15)"),
        col("description", "text", { nullable: true }),
        col("picture", "bytea", { nullable: true }),
      ],
      []
    ),
    table(
      "customer_customer_demo",
      [
        col("customer_id", "character varying(5)", { pk: true }),
        col("customer_type_id", "character varying(5)", { pk: true }),
      ],
      [
        { column: "customer_type_id", referencesTable: "customer_demographics", referencesColumn: "customer_type_id" },
        { column: "customer_id", referencesTable: "customers", referencesColumn: "customer_id" },
      ]
    ),
    table(
      "customer_demographics",
      [
        col("customer_type_id", "character varying(5)", { pk: true }),
        col("customer_desc", "text", { nullable: true }),
      ],
      []
    ),
    table(
      "customers",
      [
        col("customer_id", "character varying(5)", { pk: true }),
        col("company_name", "character varying(40)"),
        col("contact_name", "character varying(30)", { nullable: true }),
        col("contact_title", "character varying(30)", { nullable: true }),
        col("address", "character varying(60)", { nullable: true }),
        col("city", "character varying(15)", { nullable: true }),
        col("region", "character varying(15)", { nullable: true }),
        col("postal_code", "character varying(10)", { nullable: true }),
        col("country", "character varying(15)", { nullable: true }),
        col("phone", "character varying(24)", { nullable: true }),
        col("fax", "character varying(24)", { nullable: true }),
      ],
      []
    ),
    table(
      "employees",
      [
        col("employee_id", "smallint", { pk: true }),
        col("last_name", "character varying(20)"),
        col("first_name", "character varying(10)"),
        col("title", "character varying(30)", { nullable: true }),
        col("title_of_courtesy", "character varying(25)", { nullable: true }),
        col("birth_date", "date", { nullable: true }),
        col("hire_date", "date", { nullable: true }),
        col("address", "character varying(60)", { nullable: true }),
        col("city", "character varying(15)", { nullable: true }),
        col("region", "character varying(15)", { nullable: true }),
        col("postal_code", "character varying(10)", { nullable: true }),
        col("country", "character varying(15)", { nullable: true }),
        col("home_phone", "character varying(24)", { nullable: true }),
        col("extension", "character varying(4)", { nullable: true }),
        col("photo", "bytea", { nullable: true }),
        col("notes", "text", { nullable: true }),
        col("reports_to", "smallint", { nullable: true }),
        col("photo_path", "character varying(255)", { nullable: true }),
      ],
      [
        { column: "reports_to", referencesTable: "employees", referencesColumn: "employee_id" },
      ]
    ),
    table(
      "employee_territories",
      [
        col("employee_id", "smallint", { pk: true }),
        col("territory_id", "character varying(20)", { pk: true }),
      ],
      [
        { column: "territory_id", referencesTable: "territories", referencesColumn: "territory_id" },
        { column: "employee_id", referencesTable: "employees", referencesColumn: "employee_id" },
      ]
    ),
    table(
      "order_details",
      [
        col("order_id", "smallint", { pk: true }),
        col("product_id", "smallint", { pk: true }),
        col("unit_price", "real"),
        col("quantity", "smallint"),
        col("discount", "real"),
      ],
      [
        { column: "product_id", referencesTable: "products", referencesColumn: "product_id" },
        { column: "order_id", referencesTable: "orders", referencesColumn: "order_id" },
      ]
    ),
    table(
      "orders",
      [
        col("order_id", "smallint", { pk: true }),
        col("customer_id", "character varying(5)", { nullable: true }),
        col("employee_id", "smallint", { nullable: true }),
        col("order_date", "date", { nullable: true }),
        col("required_date", "date", { nullable: true }),
        col("shipped_date", "date", { nullable: true }),
        col("ship_via", "smallint", { nullable: true }),
        col("freight", "real", { nullable: true }),
        col("ship_name", "character varying(40)", { nullable: true }),
        col("ship_address", "character varying(60)", { nullable: true }),
        col("ship_city", "character varying(15)", { nullable: true }),
        col("ship_region", "character varying(15)", { nullable: true }),
        col("ship_postal_code", "character varying(10)", { nullable: true }),
        col("ship_country", "character varying(15)", { nullable: true }),
      ],
      [
        { column: "customer_id", referencesTable: "customers", referencesColumn: "customer_id" },
        { column: "employee_id", referencesTable: "employees", referencesColumn: "employee_id" },
        { column: "ship_via", referencesTable: "shippers", referencesColumn: "shipper_id" },
      ]
    ),
    table(
      "products",
      [
        col("product_id", "smallint", { pk: true }),
        col("product_name", "character varying(40)"),
        col("supplier_id", "smallint", { nullable: true }),
        col("category_id", "smallint", { nullable: true }),
        col("quantity_per_unit", "character varying(20)", { nullable: true }),
        col("unit_price", "real", { nullable: true }),
        col("units_in_stock", "smallint", { nullable: true }),
        col("units_on_order", "smallint", { nullable: true }),
        col("reorder_level", "smallint", { nullable: true }),
        col("discontinued", "integer"),
      ],
      [
        { column: "category_id", referencesTable: "categories", referencesColumn: "category_id" },
        { column: "supplier_id", referencesTable: "suppliers", referencesColumn: "supplier_id" },
      ]
    ),
    table(
      "region",
      [
        col("region_id", "smallint", { pk: true }),
        col("region_description", "character varying(60)"),
      ],
      []
    ),
    table(
      "shippers",
      [
        col("shipper_id", "smallint", { pk: true }),
        col("company_name", "character varying(40)"),
        col("phone", "character varying(24)", { nullable: true }),
      ],
      []
    ),
    table(
      "suppliers",
      [
        col("supplier_id", "smallint", { pk: true }),
        col("company_name", "character varying(40)"),
        col("contact_name", "character varying(30)", { nullable: true }),
        col("contact_title", "character varying(30)", { nullable: true }),
        col("address", "character varying(60)", { nullable: true }),
        col("city", "character varying(15)", { nullable: true }),
        col("region", "character varying(15)", { nullable: true }),
        col("postal_code", "character varying(10)", { nullable: true }),
        col("country", "character varying(15)", { nullable: true }),
        col("phone", "character varying(24)", { nullable: true }),
        col("fax", "character varying(24)", { nullable: true }),
        col("homepage", "text", { nullable: true }),
      ],
      []
    ),
    table(
      "territories",
      [
        col("territory_id", "character varying(20)", { pk: true }),
        col("territory_description", "character varying(60)"),
        col("region_id", "smallint"),
      ],
      [
        { column: "region_id", referencesTable: "region", referencesColumn: "region_id" },
      ]
    ),
    table(
      "us_states",
      [
        col("state_id", "smallint", { pk: true }),
        col("state_name", "character varying(100)", { nullable: true }),
        col("state_abbr", "character varying(2)", { nullable: true }),
        col("state_region", "character varying(50)", { nullable: true }),
      ],
      []
    ),
  ],
};
