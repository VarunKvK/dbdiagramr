import { NextRequest, NextResponse } from "next/server";
import { Client } from "pg";
import { validateConnectionString } from "@/lib/security/validateHost";
import { trustedCaForHost } from "@/lib/security/supabaseCa";
import type { Schema, Table } from "@/lib/diagram";

export const runtime = "nodejs";

const MAX_TABLES = 500;
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function rateLimit(ip: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = buckets.get(ip);

  if (!entry || entry.resetAt <= now) {
    if (buckets.size > 5000) {
      Array.from(buckets.entries()).forEach(([key, value]) => {
        if (value.resetAt <= now) buckets.delete(key);
      });
    }
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfter: Math.ceil((entry.resetAt - now) / 1000),
    };
  }

  entry.count += 1;
  return { allowed: true, retryAfter: 0 };
}

function fail(
  status: number,
  body: Record<string, unknown>,
  headers?: Record<string, string>
) {
  return NextResponse.json(body, { status, headers });
}

function errorCode(err: unknown): string {
  if (typeof err === "object" && err !== null && "code" in err) {
    const code = (err as { code?: unknown }).code;
    if (typeof code === "string") return code;
  }
  return "";
}

function describeConnectError(
  err: unknown,
  port: number,
  host: string
): { status: number; body: Record<string, unknown> } {
  const code = errorCode(err);
  const poolerHint = port === 5432 ? { hint: "pooler" } : {};
  const supabaseDirect = host.endsWith(".supabase.co") && port === 5432;
  const unreachableDetails = supabaseDirect
    ? "Supabase direct connections are IPv6-only. Use the Session pooler (port 5432) or Transaction pooler (port 6543) host from Dashboard -> Connect."
    : "We could not resolve that hostname. Check for typos, unpause your database, or use the connection pooler (port 6543).";

  if (code === "ENOTFOUND" || code === "EAI_AGAIN") {
    return {
      status: 500,
      body: {
        error: "Database host not found",
        details: unreachableDetails,
        dnsError: true,
        ...poolerHint,
      },
    };
  }

  if (code === "ECONNREFUSED") {
    return {
      status: 500,
      body: {
        error: "Connection refused",
        details:
          "The database refused the connection. Check the port and your provider's IP allowlist.",
      },
    };
  }

  if (code === "ETIMEDOUT" || code === "EHOSTUNREACH" || code === "ENETUNREACH") {
    return {
      status: 500,
      body: {
        error: "Connection timed out",
        details: supabaseDirect
          ? unreachableDetails
          : "The database did not respond in time. Check your provider's firewall, or switch to the transaction pooler (port 6543).",
        ...poolerHint,
      },
    };
  }

  if (
    code === "SELF_SIGNED_CERT_IN_CHAIN" ||
    code === "DEPTH_ZERO_SELF_SIGNED_CERT" ||
    code === "UNABLE_TO_VERIFY_LEAF_SIGNATURE" ||
    code === "ERR_TLS_CERT_ALTNAME_INVALID" ||
    code === "CERT_HAS_EXPIRED"
  ) {
    return {
      status: 500,
      body: {
        error: "Certificate not trusted",
        details:
          "This database uses a TLS certificate we cannot verify. Use a provider with a publicly trusted certificate, or run dbdiagramr locally.",
      },
    };
  }

  if (code === "28P01" || code === "28000") {
    return {
      status: 500,
      body: {
        error: "Authentication failed",
        details:
          "The username or password was rejected. Copy the connection string again from your provider's dashboard.",
      },
    };
  }

  if (code === "3D000") {
    return {
      status: 500,
      body: {
        error: "Database not found",
        details:
          "The connection string names a database that does not exist on that server.",
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "Could not connect to database",
      details:
        "Check the host, port, username, password and database name. If this worked before, your database may be paused.",
    },
  };
}

function describeQueryError(err: unknown): {
  status: number;
  body: Record<string, unknown>;
} {
  const code = errorCode(err);

  if (code === "42501") {
    return {
      status: 500,
      body: {
        error: "Permission denied",
        details:
          "The database user cannot read schema metadata. Grant CONNECT on the database and USAGE on the schema.",
      },
    };
  }

  if (code === "57014") {
    return {
      status: 500,
      body: {
        error: "Schema read timed out",
        details:
          "Reading the schema took too long. Try again, or use paste-SQL mode for a large database.",
      },
    };
  }

  return {
    status: 500,
    body: {
      error: "Failed to read schema",
      details:
        "The connection worked, but the schema could not be read. Try again, or use paste-SQL mode.",
    },
  };
}

export async function POST(request: NextRequest) {
  const limit = rateLimit(clientIp(request));
  if (!limit.allowed) {
    return fail(
      429,
      {
        error: "Too many requests",
        details:
          "Live connections are limited to 10 attempts every 10 minutes. Try again shortly, or use paste-SQL mode.",
      },
      { "Retry-After": String(limit.retryAfter) }
    );
  }

  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 4096) {
    return fail(413, { error: "Request too large" });
  }

  let body: { connectionString?: unknown };
  try {
    body = await request.json();
  } catch {
    return fail(400, { error: "Invalid connection string" });
  }

  if (!body.connectionString || typeof body.connectionString !== "string") {
    return fail(400, { error: "Invalid connection string" });
  }

  const validated = await validateConnectionString(body.connectionString);
  if (!validated.ok) {
    return fail(validated.status, validated.body);
  }

  const { host, port, user, password, database, isLocal } = validated.config;

  const requestHost = request.headers.get("host") ?? "";
  const requestIsLocal =
    requestHost.startsWith("localhost") ||
    requestHost.startsWith("127.0.0.1") ||
    requestHost.startsWith("[::1]");

  if (isLocal && !requestIsLocal) {
    return fail(400, {
      error: "Cannot connect to localhost",
      localhost: true,
      details:
        "This app is running on a remote server, so localhost refers to the server itself, not your machine.\n\nTo visualize your local database:\n  1. Run this app locally: git clone + npm run dev\n  2. Use a cloud database (Supabase, Neon, etc.) with its public connection string\n  3. Expose your local database with a tool like ngrok or Cloudflare Tunnel",
    });
  }

  const ca = trustedCaForHost(host);
  const client = new Client({
    host,
    port,
    user,
    password,
    database,
    ssl: isLocal ? false : { rejectUnauthorized: true, ...(ca ? { ca } : {}) },
    application_name: "dbdiagramr",
    connectionTimeoutMillis: 8000,
    query_timeout: 8000,
    statement_timeout: 10000,
  });

  try {
    await client.connect();
  } catch (err) {
    const described = describeConnectError(err, port, host);
    return fail(described.status, described.body);
  }

  try {
    const tablesResult = await client.query<{
      table_name: string;
      rls_enabled: boolean;
      rls_forced: boolean;
      policy_count: number;
    }>(
      `SELECT c.relname AS table_name,
              c.relrowsecurity AS rls_enabled,
              c.relforcerowsecurity AS rls_forced,
              (SELECT count(*)::int
                 FROM pg_catalog.pg_policy p
                WHERE p.polrelid = c.oid) AS policy_count
       FROM pg_catalog.pg_class c
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public'
         AND c.relkind IN ('r', 'p')
       ORDER BY c.relname
       LIMIT ${MAX_TABLES + 1}`
    );

    if (tablesResult.rows.length > MAX_TABLES) {
      return fail(422, {
        error: "Too many tables",
        details: `This database has more than ${MAX_TABLES} tables in the public schema. Use paste-SQL mode, or connect to a schema with fewer tables.`,
      });
    }

    const tableMap = new Map<string, Table>();
    for (const row of tablesResult.rows) {
      tableMap.set(row.table_name, {
        name: row.table_name,
        columns: [],
        foreignKeys: [],
        rls: {
          enabled: row.rls_enabled,
          forced: row.rls_forced,
          policyCount: row.policy_count,
        },
      });
    }

    const columnsResult = await client.query<{
      table_name: string;
      column_name: string;
      data_type: string;
      not_null: boolean;
      column_default: string | null;
    }>(
      `SELECT c.relname AS table_name,
              a.attname AS column_name,
              pg_catalog.format_type(a.atttypid, a.atttypmod) AS data_type,
              a.attnotnull AS not_null,
              pg_catalog.pg_get_expr(d.adbin, d.adrelid) AS column_default
       FROM pg_catalog.pg_class c
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       JOIN pg_catalog.pg_attribute a ON a.attrelid = c.oid
       LEFT JOIN pg_catalog.pg_attrdef d
         ON d.adrelid = c.oid AND d.adnum = a.attnum
       WHERE n.nspname = 'public'
         AND c.relkind IN ('r', 'p')
         AND a.attnum > 0
         AND NOT a.attisdropped
       ORDER BY c.relname, a.attnum`
    );

    const primaryKeys = new Map<string, Set<string>>();

    for (const row of columnsResult.rows) {
      const table = tableMap.get(row.table_name);
      if (!table) continue;

      table.columns.push({
        name: row.column_name,
        type: row.data_type,
        nullable: row.not_null ? "NO" : "YES",
        default: row.column_default,
        isPrimaryKey: false,
      });
    }

    const constraintsResult = await client.query<{
      table_name: string;
      constraint_type: string;
      column_name: string;
      foreign_table_name: string | null;
      foreign_column_name: string | null;
    }>(
      `SELECT c.relname AS table_name,
              con.contype AS constraint_type,
              a.attname AS column_name,
              fc.relname AS foreign_table_name,
              fa.attname AS foreign_column_name
       FROM pg_catalog.pg_constraint con
       JOIN pg_catalog.pg_class c ON c.oid = con.conrelid
       JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
       JOIN LATERAL unnest(con.conkey) WITH ORDINALITY AS k(attnum, ord)
         ON true
       JOIN pg_catalog.pg_attribute a
         ON a.attrelid = con.conrelid AND a.attnum = k.attnum
       LEFT JOIN LATERAL unnest(con.confkey) WITH ORDINALITY AS fk(attnum, ord)
         ON con.contype = 'f' AND fk.ord = k.ord
       LEFT JOIN pg_catalog.pg_class fc ON fc.oid = con.confrelid
       LEFT JOIN pg_catalog.pg_attribute fa
         ON fa.attrelid = con.confrelid AND fa.attnum = fk.attnum
       WHERE n.nspname = 'public'
         AND con.contype IN ('p', 'f')
       ORDER BY c.relname, con.conname, k.ord`
    );

    for (const row of constraintsResult.rows) {
      if (row.constraint_type === "p") {
        const keys = primaryKeys.get(row.table_name) ?? new Set<string>();
        keys.add(row.column_name);
        primaryKeys.set(row.table_name, keys);
        continue;
      }

      if (
        row.constraint_type === "f" &&
        row.foreign_table_name &&
        row.foreign_column_name &&
        tableMap.has(row.foreign_table_name)
      ) {
        tableMap.get(row.table_name)?.foreignKeys.push({
          column: row.column_name,
          referencesTable: row.foreign_table_name,
          referencesColumn: row.foreign_column_name,
        });
      }
    }

    primaryKeys.forEach((keys, tableName) => {
      const table = tableMap.get(tableName);
      if (!table) return;
      for (const column of table.columns) {
        if (keys.has(column.name)) column.isPrimaryKey = true;
      }
    });

    const schema: Schema = { tables: Array.from(tableMap.values()) };
    return NextResponse.json(schema, { status: 200 });
  } catch (err) {
    const described = describeQueryError(err);
    return fail(described.status, described.body);
  } finally {
    await client.end().catch(() => {});
  }
}
