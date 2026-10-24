import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeConnectionString,
  classifyEndpoint,
  parseConnectionString,
  type ConnectionFlagCode,
} from "./connectionString";

function codes(input: string, prisma = false): ConnectionFlagCode[] {
  return analyzeConnectionString(input, { prisma }).flags.map((flag) => flag.code);
}

test("parses encoded credentials, defaults, and query parameters", () => {
  const parsed = parseConnectionString(
    "postgresql://postgres.abcdefgh:p%40ss%20word@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require&application_name=dbdiagramr"
  );

  assert.deepEqual(parsed, {
    user: "postgres.abcdefgh",
    password: "p@ss word",
    host: "aws-1-us-east-2.pooler.supabase.com",
    port: "6543",
    database: "postgres",
    params: [
      ["sslmode", "require"],
      ["application_name", "dbdiagramr"],
    ],
  });

  assert.equal(
    parseConnectionString("postgres://user:pass@localhost/mydb").port,
    "5432"
  );
});

test("parses bracketed IPv6 hosts", () => {
  const parsed = parseConnectionString("postgresql://user:pass@[::1]:5433/mydb");
  assert.equal(parsed.host, "::1");
  assert.equal(parsed.port, "5433");
});

test("rejects non-Postgres and malformed strings", () => {
  assert.throws(() => parseConnectionString("mysql://user:pass@host/db"), /postgresql/);
  assert.throws(
    () => parseConnectionString("postgresql://postgres:p#ss@db.abcdefgh.supabase.co:5432/postgres"),
    /Percent-encode/
  );
  assert.throws(() => parseConnectionString("postgresql://postgres@/postgres"), /host/);
});

test("classifies Supabase, Neon, and other endpoints", () => {
  assert.equal(classifyEndpoint("db.abcdefgh.supabase.co", "5432"), "supabase-direct");
  assert.equal(classifyEndpoint("db.abcdefgh.supabase.co", "6543"), "supabase-dedicated");
  assert.equal(
    classifyEndpoint("aws-1-us-east-2.pooler.supabase.com", "5432"),
    "supabase-shared-session"
  );
  assert.equal(
    classifyEndpoint("aws-1-us-east-2.pooler.supabase.com", "6543"),
    "supabase-shared-transaction"
  );
  assert.equal(
    classifyEndpoint("ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech", "5432"),
    "neon-pooled"
  );
  assert.equal(
    classifyEndpoint("ep-cool-darkness-123456.us-east-2.aws.neon.tech", "5432"),
    "neon-direct"
  );
  assert.equal(classifyEndpoint("localhost", "5432"), "other");
});

test("flags characters that need password encoding without echoing the password", () => {
  const analysis = analyzeConnectionString(
    "postgresql://postgres:p@ss@db.abcdefgh.supabase.co:5432/postgres?sslmode=require"
  );
  assert.deepEqual(
    analysis.flags.map((flag) => flag.code),
    ["password-encoding"]
  );
  assert.doesNotMatch(JSON.stringify(analysis.flags), /p@ss/);
});

test("flags invalid Supabase ports", () => {
  assert.deepEqual(
    codes("postgresql://postgres:pw@db.abcdefgh.supabase.co:5433/postgres?sslmode=require"),
    ["supabase-port"]
  );
  assert.deepEqual(
    codes("postgresql://postgres.abcdefgh:pw@aws-1-us-east-2.pooler.supabase.com:5433/postgres?sslmode=require"),
    ["supabase-port"]
  );
});

test("checks shared and direct Supabase usernames", () => {
  assert.deepEqual(
    codes("postgresql://postgres:pw@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require"),
    ["supabase-username"]
  );
  assert.deepEqual(
    codes("postgresql://postgres.abcdefgh:pw@db.abcdefgh.supabase.co:5432/postgres?sslmode=require"),
    ["supabase-username"]
  );
  assert.deepEqual(
    codes("postgresql://postgres:pw@db.abcdefgh.supabase.co:6543/postgres?sslmode=require"),
    []
  );
});

test("warns on missing SSL and errors on unsafe SSL", () => {
  assert.deepEqual(codes("postgresql://postgres:pw@db.abcdefgh.supabase.co:5432/postgres"), [
    "sslmode-missing",
  ]);
  assert.deepEqual(
    codes("postgresql://postgres:pw@db.abcdefgh.supabase.co:5432/postgres?sslmode=disable"),
    ["sslmode-unsafe"]
  );
  assert.deepEqual(
    codes("postgresql://postgres:pw@db.abcdefgh.supabase.co:5432/postgres?sslmode=prefer"),
    ["sslmode-prefer"]
  );
  assert.deepEqual(
    codes("postgresql://user:pw@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb"),
    ["sslmode-missing"]
  );
});

test("flags Prisma on transaction pooling unless pgbouncer=true", () => {
  const shared =
    "postgresql://postgres.abcdefgh:pw@aws-1-us-east-2.pooler.supabase.com:6543/postgres?sslmode=require";
  const dedicated =
    "postgresql://postgres:pw@db.abcdefgh.supabase.co:6543/postgres?sslmode=require";

  assert.deepEqual(codes(shared, true), ["prisma-pgbouncer"]);
  assert.equal(
    analyzeConnectionString(shared, { prisma: true }).flags[0]?.severity,
    "error"
  );
  assert.deepEqual(codes(`${shared}&pgbouncer=true`, true), []);
  assert.equal(
    analyzeConnectionString(dedicated, { prisma: true }).flags[0]?.severity,
    "warning"
  );
  assert.deepEqual(codes(`${dedicated}&pgbouncer=true`, true), []);
});

test("returns no flags for a valid shared session string", () => {
  const analysis = analyzeConnectionString(
    "postgresql://postgres.abcdefgh:pw@aws-1-us-east-2.pooler.supabase.com:5432/postgres?sslmode=require",
    { prisma: true }
  );
  assert.equal(analysis.error, null);
  assert.equal(analysis.endpoint, "supabase-shared-session");
  assert.deepEqual(analysis.flags, []);
});
