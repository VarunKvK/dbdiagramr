import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";

export async function POST(request: NextRequest) {
  let body: { connectionString?: string; ssl?: boolean };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid connection string" },
      { status: 400 }
    );
  }

  const { connectionString, ssl } = body;

  if (!connectionString || typeof connectionString !== "string") {
    return NextResponse.json(
      { error: "Invalid connection string" },
      { status: 400 }
    );
  }

  const dbIsLocal =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1") ||
    connectionString.includes("::1");

  const host = request.headers.get("host") || "";
  const requestIsLocal =
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1") ||
    host.startsWith("[::1]");

  if (
    connectionString.startsWith("http://") ||
    connectionString.startsWith("https://")
  ) {
    return NextResponse.json(
      {
        error: "Invalid connection string",
        details:
          "That looks like a web URL. You need your database connection string — it starts with postgresql://. In Supabase, find it at Project Settings \u2192 Database \u2192 Connection string \u2192 URI.",
      },
      { status: 400 }
    );
  }

  if (dbIsLocal && !requestIsLocal) {
    return NextResponse.json(
      {
        error: "Cannot connect to localhost",
        localhost: true,
        details:
          "This app is running on a remote server, so localhost refers to the server itself, not your machine.\n\nTo visualize your local database:\n  1. Deploy this app locally: git clone + npm run dev\n  2. Use a cloud database (Supabase, Neon, etc.) and paste its public connection string\n  3. Expose your local database with a tool like ngrok or Cloudflare Tunnel",
      },
      { status: 400 }
    );
  }

const useSSL = ssl !== false && !dbIsLocal;
  const client = new Client({
    connectionString,
    ...(useSSL ? { ssl: { rejectUnauthorized: false } } : {}),
    family: 4,
  } as import("pg").ClientConfig & { family: number }); 

  try {
    await client.connect();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Could not connect to database", details: message },
      { status: 500 }
    );
  }

  try {
    const tablesResult = await client.query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );

    const tables = [];

    for (const row of tablesResult.rows) {
      const tableName = row.table_name as string;

      const [columnsResult, pkResult, fkResult] = await Promise.all([
        client.query(
          `SELECT column_name, data_type, is_nullable, column_default
           FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = $1
           ORDER BY ordinal_position`,
          [tableName]
        ),
        client.query(
          `SELECT kcu.column_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name
           WHERE tc.constraint_type = 'PRIMARY KEY'
             AND tc.table_schema = 'public'
             AND tc.table_name = $1`,
          [tableName]
        ),
        client.query(
          `SELECT kcu.column_name,
                  ccu.table_name AS foreign_table_name,
                  ccu.column_name AS foreign_column_name
           FROM information_schema.table_constraints tc
           JOIN information_schema.key_column_usage kcu
             ON tc.constraint_name = kcu.constraint_name
           JOIN information_schema.constraint_column_usage ccu
             ON ccu.constraint_name = tc.constraint_name
           WHERE tc.constraint_type = 'FOREIGN KEY'
             AND tc.table_schema = 'public'
             AND tc.table_name = $1`,
          [tableName]
        ),
      ]);

      const pkColumns = new Set(
        pkResult.rows.map((r) => r.column_name as string)
      );

      const columns = columnsResult.rows.map((col) => ({
        name: col.column_name as string,
        type: col.data_type as string,
        nullable: col.is_nullable as string,
        default: col.column_default ?? null,
        isPrimaryKey: pkColumns.has(col.column_name as string),
      }));

      const foreignKeys = fkResult.rows.map((fk) => ({
        column: fk.column_name as string,
        referencesTable: fk.foreign_table_name as string,
        referencesColumn: fk.foreign_column_name as string,
      }));

      tables.push({ name: tableName, columns, foreignKeys });
    }

    return NextResponse.json({ tables }, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: "Failed to introspect schema", details: message },
      { status: 500 }
    );
  } finally {
    await client.end().catch(() => {});
  }
}
