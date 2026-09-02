import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Generic e-commerce schema — products, categories, customers, orders, etc.
// Pattern used by Shopify, WooCommerce, and most custom storefronts on PostgreSQL.
export const ecommerceSchema: Schema = {
  tables: [
    table(
      "customers",
      [
        col("id", "uuid", { pk: true }),
        col("email", "varchar"),
        col("first_name", "varchar", { nullable: true }),
        col("last_name", "varchar", { nullable: true }),
        col("phone", "varchar", { nullable: true }),
        col("created_at", "timestamptz"),
        col("updated_at", "timestamptz", { nullable: true }),
      ],
      []
    ),
    table(
      "addresses",
      [
        col("id", "uuid", { pk: true }),
        col("customer_id", "uuid"),
        col("label", "varchar", { nullable: true }),
        col("line1", "varchar"),
        col("line2", "varchar", { nullable: true }),
        col("city", "varchar"),
        col("state", "varchar", { nullable: true }),
        col("postal_code", "varchar"),
        col("country", "varchar(2)"),
        col("is_default", "bool", { default: "false" }),
      ],
      [{ column: "customer_id", referencesTable: "customers", referencesColumn: "id" }]
    ),
    table(
      "categories",
      [
        col("id", "uuid", { pk: true }),
        col("name", "varchar"),
        col("slug", "varchar"),
        col("parent_id", "uuid", { nullable: true }),
        col("description", "text", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      [{ column: "parent_id", referencesTable: "categories", referencesColumn: "id" }]
    ),
    table(
      "products",
      [
        col("id", "uuid", { pk: true }),
        col("title", "varchar"),
        col("slug", "varchar"),
        col("description", "text", { nullable: true }),
        col("category_id", "uuid", { nullable: true }),
        col("price_cents", "integer"),
        col("currency", "varchar(3)", { default: "'USD'" }),
        col("inventory_count", "integer", { default: "0" }),
        col("is_active", "bool", { default: "true" }),
        col("created_at", "timestamptz"),
        col("updated_at", "timestamptz", { nullable: true }),
      ],
      [{ column: "category_id", referencesTable: "categories", referencesColumn: "id" }]
    ),
    table(
      "product_images",
      [
        col("id", "uuid", { pk: true }),
        col("product_id", "uuid"),
        col("url", "text"),
        col("alt_text", "varchar", { nullable: true }),
        col("position", "integer", { default: "0" }),
        col("created_at", "timestamptz"),
      ],
      [{ column: "product_id", referencesTable: "products", referencesColumn: "id" }]
    ),
    table(
      "carts",
      [
        col("id", "uuid", { pk: true }),
        col("customer_id", "uuid", { nullable: true }),
        col("status", "varchar", { default: "'active'" }),
        col("created_at", "timestamptz"),
        col("updated_at", "timestamptz", { nullable: true }),
        col("expires_at", "timestamptz", { nullable: true }),
      ],
      [{ column: "customer_id", referencesTable: "customers", referencesColumn: "id" }]
    ),
    table(
      "cart_items",
      [
        col("id", "uuid", { pk: true }),
        col("cart_id", "uuid"),
        col("product_id", "uuid"),
        col("quantity", "integer", { default: "1" }),
        col("unit_price_cents", "integer"),
        col("added_at", "timestamptz"),
      ],
      [
        { column: "cart_id", referencesTable: "carts", referencesColumn: "id" },
        { column: "product_id", referencesTable: "products", referencesColumn: "id" },
      ]
    ),
    table(
      "orders",
      [
        col("id", "uuid", { pk: true }),
        col("customer_id", "uuid"),
        col("status", "varchar", { default: "'pending'" }),
        col("total_cents", "integer"),
        col("currency", "varchar(3)", { default: "'USD'" }),
        col("shipping_address_id", "uuid", { nullable: true }),
        col("billing_address_id", "uuid", { nullable: true }),
        col("placed_at", "timestamptz"),
        col("paid_at", "timestamptz", { nullable: true }),
        col("shipped_at", "timestamptz", { nullable: true }),
      ],
      [
        { column: "customer_id", referencesTable: "customers", referencesColumn: "id" },
        { column: "shipping_address_id", referencesTable: "addresses", referencesColumn: "id" },
        { column: "billing_address_id", referencesTable: "addresses", referencesColumn: "id" },
      ]
    ),
    table(
      "order_items",
      [
        col("id", "uuid", { pk: true }),
        col("order_id", "uuid"),
        col("product_id", "uuid"),
        col("quantity", "integer"),
        col("unit_price_cents", "integer"),
        col("total_cents", "integer"),
        col("created_at", "timestamptz"),
      ],
      [
        { column: "order_id", referencesTable: "orders", referencesColumn: "id" },
        { column: "product_id", referencesTable: "products", referencesColumn: "id" },
      ]
    ),
    table(
      "payments",
      [
        col("id", "uuid", { pk: true }),
        col("order_id", "uuid"),
        col("provider", "varchar", { default: "'stripe'" }),
        col("provider_payment_id", "text", { nullable: true }),
        col("amount_cents", "integer"),
        col("currency", "varchar(3)"),
        col("status", "varchar"),
        col("created_at", "timestamptz"),
      ],
      [{ column: "order_id", referencesTable: "orders", referencesColumn: "id" }]
    ),
    table(
      "reviews",
      [
        col("id", "uuid", { pk: true }),
        col("product_id", "uuid"),
        col("customer_id", "uuid"),
        col("rating", "smallint"),
        col("title", "varchar", { nullable: true }),
        col("body", "text", { nullable: true }),
        col("created_at", "timestamptz"),
      ],
      [
        { column: "product_id", referencesTable: "products", referencesColumn: "id" },
        { column: "customer_id", referencesTable: "customers", referencesColumn: "id" },
      ]
    ),
  ],
};
