import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Spring Batch metadata tables — generated from the official
// schema-postgresql.sql (spring-projects/spring-batch) via parsePostgres, then hand-verified.
export const springbatchSchema: Schema = {
  tables: [
    table(
      "BATCH_JOB_INSTANCE",
      [
        col("JOB_INSTANCE_ID", "BIGINT", { pk: true }),
        col("VERSION", "BIGINT", { nullable: true }),
        col("JOB_NAME", "VARCHAR(100)"),
        col("JOB_KEY", "VARCHAR(32)"),
      ],
      []
    ),
    table(
      "BATCH_JOB_EXECUTION",
      [
        col("JOB_EXECUTION_ID", "BIGINT", { pk: true }),
        col("VERSION", "BIGINT", { nullable: true }),
        col("JOB_INSTANCE_ID", "BIGINT"),
        col("CREATE_TIME", "TIMESTAMP"),
        col("START_TIME", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("END_TIME", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("STATUS", "VARCHAR(10)", { nullable: true }),
        col("EXIT_CODE", "VARCHAR(2500)", { nullable: true }),
        col("EXIT_MESSAGE", "VARCHAR(2500)", { nullable: true }),
        col("LAST_UPDATED", "TIMESTAMP", { nullable: true }),
      ],
      [
        { column: "JOB_INSTANCE_ID", referencesTable: "BATCH_JOB_INSTANCE", referencesColumn: "JOB_INSTANCE_ID" },
      ]
    ),
    table(
      "BATCH_JOB_EXECUTION_PARAMS",
      [
        col("JOB_EXECUTION_ID", "BIGINT"),
        col("PARAMETER_NAME", "VARCHAR(100)"),
        col("PARAMETER_TYPE", "VARCHAR(100)"),
        col("PARAMETER_VALUE", "VARCHAR(2500)", { nullable: true }),
        col("IDENTIFYING", "CHAR(1)"),
      ],
      [
        { column: "JOB_EXECUTION_ID", referencesTable: "BATCH_JOB_EXECUTION", referencesColumn: "JOB_EXECUTION_ID" },
      ]
    ),
    table(
      "BATCH_STEP_EXECUTION",
      [
        col("STEP_EXECUTION_ID", "BIGINT", { pk: true }),
        col("VERSION", "BIGINT"),
        col("STEP_NAME", "VARCHAR(100)"),
        col("JOB_EXECUTION_ID", "BIGINT"),
        col("CREATE_TIME", "TIMESTAMP"),
        col("START_TIME", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("END_TIME", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("STATUS", "VARCHAR(10)", { nullable: true }),
        col("COMMIT_COUNT", "BIGINT", { nullable: true }),
        col("READ_COUNT", "BIGINT", { nullable: true }),
        col("FILTER_COUNT", "BIGINT", { nullable: true }),
        col("WRITE_COUNT", "BIGINT", { nullable: true }),
        col("READ_SKIP_COUNT", "BIGINT", { nullable: true }),
        col("WRITE_SKIP_COUNT", "BIGINT", { nullable: true }),
        col("PROCESS_SKIP_COUNT", "BIGINT", { nullable: true }),
        col("ROLLBACK_COUNT", "BIGINT", { nullable: true }),
        col("EXIT_CODE", "VARCHAR(2500)", { nullable: true }),
        col("EXIT_MESSAGE", "VARCHAR(2500)", { nullable: true }),
        col("LAST_UPDATED", "TIMESTAMP", { nullable: true }),
      ],
      [
        { column: "JOB_EXECUTION_ID", referencesTable: "BATCH_JOB_EXECUTION", referencesColumn: "JOB_EXECUTION_ID" },
      ]
    ),
    table(
      "BATCH_STEP_EXECUTION_CONTEXT",
      [
        col("STEP_EXECUTION_ID", "BIGINT", { pk: true }),
        col("SHORT_CONTEXT", "VARCHAR(2500)"),
        col("SERIALIZED_CONTEXT", "TEXT", { nullable: true }),
      ],
      [
        { column: "STEP_EXECUTION_ID", referencesTable: "BATCH_STEP_EXECUTION", referencesColumn: "STEP_EXECUTION_ID" },
      ]
    ),
    table(
      "BATCH_JOB_EXECUTION_CONTEXT",
      [
        col("JOB_EXECUTION_ID", "BIGINT", { pk: true }),
        col("SHORT_CONTEXT", "VARCHAR(2500)"),
        col("SERIALIZED_CONTEXT", "TEXT", { nullable: true }),
      ],
      [
        { column: "JOB_EXECUTION_ID", referencesTable: "BATCH_JOB_EXECUTION", referencesColumn: "JOB_EXECUTION_ID" },
      ]
    ),
  ],
};

