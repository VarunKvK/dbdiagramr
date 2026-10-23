import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";
import { getAllSchemaEntries, type SchemaEntry } from "../data/schemas/registry";
import { schemaToSql } from "../lib/schemaExport";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixtureDir = join(root, "fixtures", "schema-queries");

const adminUrl =
  process.env.VERIFY_DATABASE_URL ??
  "postgres://postgres:verify@127.0.0.1:55432/postgres";

function databaseName(slug: string): string {
  return `schema_verify_${slug.replace(/[^a-z0-9]+/g, "_")}`;
}

function quoteIdent(value: string): string {
  return `"${value.replace(/"/g, '""')}"`;
}

function searchPath(entry: SchemaEntry): string {
  const schemas = new Set<string>();
  for (const table of entry.schema.tables) {
    const parts = table.name.split(".").map((part) => part.trim());
    if (parts.length > 1) schemas.add(parts.slice(0, -1).join("."));
  }
  if (schemas.size === 0) return "public";
  return Array.from(schemas).concat("public").map(quoteIdent).join(", ");
}

async function withDatabase<T>(
  url: string,
  database: string,
  run: (client: Client) => Promise<T>
): Promise<T> {
  const connection = new URL(url);
  connection.pathname = `/${encodeURIComponent(database)}`;
  const client = new Client({
    connectionString: connection.toString(),
    connectionTimeoutMillis: 10_000,
  });
  await client.connect();
  try {
    return await run(client);
  } finally {
    await client.end();
  }
}

async function main(): Promise<void> {
  const entries = getAllSchemaEntries();
  const admin = new Client({ connectionString: adminUrl });
  await admin.connect();

  const report: {
    slug: string;
    queries: { title: string; rows: number }[];
  }[] = [];
  let failures = 0;

  try {
    for (const entry of entries) {
      const db = databaseName(entry.slug);
      const fixturePath = join(fixtureDir, `${entry.slug}.sql`);
      const fixture = await readFile(fixturePath, "utf8");
      const ddl = schemaToSql(entry.schema);

      await admin.query(`drop database if exists ${quoteIdent(db)} with (force)`);
      await admin.query(`create database ${quoteIdent(db)}`);

      const counts = await withDatabase(adminUrl, db, async (client) => {
        await client.query(ddl);
        await client.query(`set search_path to ${searchPath(entry)}`);
        await client.query(fixture);

        const result: { title: string; rows: number }[] = [];
        for (const query of entry.queries ?? []) {
          const run = async (): Promise<number> => {
            await client.query("begin read only");
            try {
              const rows = await client.query(query.sql);
              return rows.rows.length;
            } finally {
              await client.query("rollback");
            }
          };

          const first = await run();
          const second = await run();
          if (first === 0) {
            throw new Error(`"${query.title}" returned 0 rows`);
          }
          if (first !== second) {
            throw new Error(
              `"${query.title}" was not deterministic: ${first} then ${second} rows`
            );
          }
          result.push({ title: query.title, rows: first });
        }
        return result;
      });

      report.push({ slug: entry.slug, queries: counts });
      const countsText = counts.map((q) => `${q.rows}`).join(", ");
      console.log(`OK ${entry.slug} (${countsText})`);
    }
  } catch (error) {
    failures += 1;
    console.error(error instanceof Error ? error.stack : error);
  } finally {
    await admin.end();
  }

  console.log("\nQuery counts");
  for (const item of report) {
    console.log(`${item.slug}: ${item.queries.map((q) => `${q.title}=${q.rows}`).join("; ")}`);
  }
  console.log(`\n${report.length}/${entries.length} schemas verified`);

  if (failures > 0 || report.length !== entries.length) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
