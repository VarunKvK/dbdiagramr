import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Stripe-inspired subscription billing schema — models Stripe API objects
// as PostgreSQL tables (customers, products, prices, subscriptions, invoices, etc.)
// Based on Stripe API docs: https://docs.stripe.com/api
export const stripeSchema: Schema = {
  tables: [
    table(
      "customers",
      [
        col("id", "text", { pk: true }),
        col("email", "varchar", { nullable: true }),
        col("name", "varchar", { nullable: true }),
        col("phone", "varchar", { nullable: true }),
        col("description", "text", { nullable: true }),
        col("default_currency", "varchar(3)", { nullable: true }),
        col("balance", "integer", { default: "0" }),
        col("metadata", "jsonb", { nullable: true }),
        col("created", "timestamptz"),
        col("deleted_at", "timestamptz", { nullable: true }),
      ],
      []
    ),
    table(
      "products",
      [
        col("id", "text", { pk: true }),
        col("name", "varchar"),
        col("description", "text", { nullable: true }),
        col("active", "bool", { default: "true" }),
        col("type", "varchar", { default: "'service'" }),
        col("metadata", "jsonb", { nullable: true }),
        col("created", "timestamptz"),
        col("updated", "timestamptz", { nullable: true }),
      ],
      []
    ),
    table(
      "prices",
      [
        col("id", "text", { pk: true }),
        col("product_id", "text"),
        col("unit_amount", "integer", { nullable: true }),
        col("currency", "varchar(3)"),
        col("billing_interval", "varchar", { nullable: true }),
        col("interval_count", "integer", { nullable: true }),
        col("active", "bool", { default: "true" }),
        col("type", "varchar", { default: "'recurring'" }),
        col("created", "timestamptz"),
      ],
      [{ column: "product_id", referencesTable: "products", referencesColumn: "id" }]
    ),
    table(
      "subscriptions",
      [
        col("id", "text", { pk: true }),
        col("customer_id", "text"),
        col("status", "varchar"),
        col("collection_method", "varchar", { default: "'charge_automatically'" }),
        col("current_period_start", "timestamptz"),
        col("current_period_end", "timestamptz"),
        col("cancel_at_period_end", "bool", { default: "false" }),
        col("canceled_at", "timestamptz", { nullable: true }),
        col("trial_start", "timestamptz", { nullable: true }),
        col("trial_end", "timestamptz", { nullable: true }),
        col("default_payment_method_id", "text", { nullable: true }),
        col("metadata", "jsonb", { nullable: true }),
        col("created", "timestamptz"),
      ],
      [
        { column: "customer_id", referencesTable: "customers", referencesColumn: "id" },
        { column: "default_payment_method_id", referencesTable: "payment_methods", referencesColumn: "id" },
      ]
    ),
    table(
      "subscription_items",
      [
        col("id", "text", { pk: true }),
        col("subscription_id", "text"),
        col("price_id", "text"),
        col("quantity", "integer", { default: "1" }),
        col("created", "timestamptz"),
      ],
      [
        { column: "subscription_id", referencesTable: "subscriptions", referencesColumn: "id" },
        { column: "price_id", referencesTable: "prices", referencesColumn: "id" },
      ]
    ),
    table(
      "invoices",
      [
        col("id", "text", { pk: true }),
        col("customer_id", "text"),
        col("subscription_id", "text", { nullable: true }),
        col("status", "varchar"),
        col("amount_due", "integer"),
        col("amount_paid", "integer", { default: "0" }),
        col("currency", "varchar(3)"),
        col("attempt_count", "integer", { default: "0" }),
        col("due_date", "timestamptz", { nullable: true }),
        col("paid_at", "timestamptz", { nullable: true }),
        col("hosted_invoice_url", "text", { nullable: true }),
        col("created", "timestamptz"),
      ],
      [
        { column: "customer_id", referencesTable: "customers", referencesColumn: "id" },
        { column: "subscription_id", referencesTable: "subscriptions", referencesColumn: "id" },
      ]
    ),
    table(
      "invoice_line_items",
      [
        col("id", "text", { pk: true }),
        col("invoice_id", "text"),
        col("price_id", "text", { nullable: true }),
        col("amount", "integer"),
        col("currency", "varchar(3)"),
        col("description", "text", { nullable: true }),
        col("quantity", "integer", { default: "1" }),
        col("period_start", "timestamptz", { nullable: true }),
        col("period_end", "timestamptz", { nullable: true }),
      ],
      [
        { column: "invoice_id", referencesTable: "invoices", referencesColumn: "id" },
        { column: "price_id", referencesTable: "prices", referencesColumn: "id" },
      ]
    ),
    table(
      "payment_methods",
      [
        col("id", "text", { pk: true }),
        col("customer_id", "text"),
        col("type", "varchar"),
        col("card_brand", "varchar", { nullable: true }),
        col("card_last4", "varchar(4)", { nullable: true }),
        col("card_exp_month", "smallint", { nullable: true }),
        col("card_exp_year", "smallint", { nullable: true }),
        col("billing_country", "varchar(2)", { nullable: true }),
        col("created", "timestamptz"),
      ],
      [{ column: "customer_id", referencesTable: "customers", referencesColumn: "id" }]
    ),
    table(
      "payment_intents",
      [
        col("id", "text", { pk: true }),
        col("customer_id", "text", { nullable: true }),
        col("invoice_id", "text", { nullable: true }),
        col("amount", "integer"),
        col("currency", "varchar(3)"),
        col("status", "varchar"),
        col("payment_method_id", "text", { nullable: true }),
        col("client_secret", "text", { nullable: true }),
        col("created", "timestamptz"),
      ],
      [
        { column: "customer_id", referencesTable: "customers", referencesColumn: "id" },
        { column: "invoice_id", referencesTable: "invoices", referencesColumn: "id" },
        { column: "payment_method_id", referencesTable: "payment_methods", referencesColumn: "id" },
      ]
    ),
  ],
};
