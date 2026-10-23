import type { Schema } from "@/lib/diagram";
import { col, table } from "./helpers";

// Spring Batch metadata tables — generated from the official
// schema-postgresql.sql (spring-projects/spring-batch) via parsePostgres, then hand-verified.
export const springbatchSchema: Schema = {
  tables: [
    table(
      "batch_job_instance",
      [
        col("job_instance_id", "BIGINT", { pk: true }),
        col("version", "BIGINT", { nullable: true }),
        col("job_name", "VARCHAR(100)"),
        col("job_key", "VARCHAR(32)"),
      ],
      []
    ),
    table(
      "batch_job_execution",
      [
        col("job_execution_id", "BIGINT", { pk: true }),
        col("version", "BIGINT", { nullable: true }),
        col("job_instance_id", "BIGINT"),
        col("create_time", "TIMESTAMP"),
        col("start_time", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("end_time", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("status", "VARCHAR(10)", { nullable: true }),
        col("exit_code", "VARCHAR(2500)", { nullable: true }),
        col("exit_message", "VARCHAR(2500)", { nullable: true }),
        col("last_updated", "TIMESTAMP", { nullable: true }),
      ],
      [
        { column: "job_instance_id", referencesTable: "batch_job_instance", referencesColumn: "job_instance_id" },
      ]
    ),
    table(
      "batch_job_execution_params",
      [
        col("job_execution_id", "BIGINT"),
        col("parameter_name", "VARCHAR(100)"),
        col("parameter_type", "VARCHAR(100)"),
        col("parameter_value", "VARCHAR(2500)", { nullable: true }),
        col("identifying", "CHAR(1)"),
      ],
      [
        { column: "job_execution_id", referencesTable: "batch_job_execution", referencesColumn: "job_execution_id" },
      ]
    ),
    table(
      "batch_step_execution",
      [
        col("step_execution_id", "BIGINT", { pk: true }),
        col("version", "BIGINT"),
        col("step_name", "VARCHAR(100)"),
        col("job_execution_id", "BIGINT"),
        col("create_time", "TIMESTAMP"),
        col("start_time", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("end_time", "TIMESTAMP", { nullable: true, default: "NULL" }),
        col("status", "VARCHAR(10)", { nullable: true }),
        col("commit_count", "BIGINT", { nullable: true }),
        col("read_count", "BIGINT", { nullable: true }),
        col("filter_count", "BIGINT", { nullable: true }),
        col("write_count", "BIGINT", { nullable: true }),
        col("read_skip_count", "BIGINT", { nullable: true }),
        col("write_skip_count", "BIGINT", { nullable: true }),
        col("process_skip_count", "BIGINT", { nullable: true }),
        col("rollback_count", "BIGINT", { nullable: true }),
        col("exit_code", "VARCHAR(2500)", { nullable: true }),
        col("exit_message", "VARCHAR(2500)", { nullable: true }),
        col("last_updated", "TIMESTAMP", { nullable: true }),
      ],
      [
        { column: "job_execution_id", referencesTable: "batch_job_execution", referencesColumn: "job_execution_id" },
      ]
    ),
    table(
      "batch_step_execution_context",
      [
        col("step_execution_id", "BIGINT", { pk: true }),
        col("short_context", "VARCHAR(2500)"),
        col("serialized_context", "TEXT", { nullable: true }),
      ],
      [
        { column: "step_execution_id", referencesTable: "batch_step_execution", referencesColumn: "step_execution_id" },
      ]
    ),
    table(
      "batch_job_execution_context",
      [
        col("job_execution_id", "BIGINT", { pk: true }),
        col("short_context", "VARCHAR(2500)"),
        col("serialized_context", "TEXT", { nullable: true }),
      ],
      [
        { column: "job_execution_id", referencesTable: "batch_job_execution", referencesColumn: "job_execution_id" },
      ]
    ),
  ],
};

