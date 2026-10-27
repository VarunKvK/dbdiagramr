export type ParsedConnectionString = {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
  params: [string, string][];
};

export type ConnectionEndpoint =
  | "supabase-direct"
  | "supabase-shared-session"
  | "supabase-shared-transaction"
  | "supabase-dedicated"
  | "neon-pooled"
  | "neon-direct"
  | "other";

export type ConnectionFlagCode =
  | "password-encoding"
  | "supabase-port"
  | "supabase-username"
  | "sslmode-missing"
  | "sslmode-unsafe"
  | "sslmode-prefer"
  | "prisma-pgbouncer";

export type ConnectionFlag = {
  code: ConnectionFlagCode;
  severity: "error" | "warning";
  message: string;
  fix: string;
  href: string;
};

export type ConnectionAnalysis = {
  parsed: ParsedConnectionString | null;
  error: string | null;
  endpoint: ConnectionEndpoint | null;
  flags: ConnectionFlag[];
};

export const ENDPOINT_LABELS: Record<ConnectionEndpoint, string> = {
  "supabase-direct": "Supabase direct",
  "supabase-shared-session": "Supabase shared pooler, session mode",
  "supabase-shared-transaction": "Supabase shared pooler, transaction mode",
  "supabase-dedicated": "Supabase dedicated pooler, transaction mode",
  "neon-pooled": "Neon pooled endpoint",
  "neon-direct": "Neon direct endpoint",
  other: "Other PostgreSQL host",
};

const SUPABASE_PORT_HREF = "/supabase-connection-string#modes";
const SUPABASE_TENANT_HREF = "/blog/supabase-tenant-or-user-not-found";
const PASSWORD_HREF = "/supabase-connection-string#password";
const SSL_HREF = "/supabase-connection-string#ssl";
const SUPABASE_SSL_HREF =
  "/blog/supabase-self-signed-certificate-in-certificate-chain";
const PRISMA_PREPARED_HREF = "/blog/prisma-prepared-statement-already-exists-supabase";

function decodePart(value: string, label: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    throw new Error(`Malformed percent-encoding in the ${label}.`);
  }
}

function splitHostPort(hostport: string): { host: string; port: string } {
  let host = hostport;
  let port = "";

  if (hostport.startsWith("[")) {
    const close = hostport.indexOf("]");
    if (close === -1) {
      throw new Error("The IPv6 host is missing its closing bracket.");
    }
    host = hostport.slice(1, close);
    const after = hostport.slice(close + 1);
    if (after && !after.startsWith(":")) {
      throw new Error("Could not parse the host and port.");
    }
    port = after.slice(1);
  } else {
    const colon = hostport.lastIndexOf(":");
    if (colon !== -1 && !hostport.slice(0, colon).includes(":")) {
      const candidate = hostport.slice(colon + 1);
      if (/^\d*$/.test(candidate)) {
        host = hostport.slice(0, colon);
        port = candidate;
      }
    }
  }

  if (!host) {
    throw new Error("The connection string is missing a host.");
  }

  const resolvedPort = port || "5432";
  if (!/^\d{1,5}$/.test(resolvedPort)) {
    throw new Error("The port must be a number.");
  }

  return { host, port: resolvedPort };
}

export function parseConnectionString(raw: string): ParsedConnectionString {
  const s = raw.trim();
  const scheme = /^postgres(ql)?:\/\//i.exec(s);
  if (!scheme) {
    throw new Error(
      "Must start with postgresql:// (for example postgresql://user:pass@host:5432/dbname)."
    );
  }

  const rest = s.slice(scheme[0].length);
  const authorityEnd = rest.search(/[/?#]/);
  const authority = authorityEnd === -1 ? rest : rest.slice(0, authorityEnd);
  const remainder = authorityEnd === -1 ? "" : rest.slice(authorityEnd);
  const at = authority.lastIndexOf("@");

  if (at <= 0) {
    throw new Error(
      "The connection string must include user:password@host. Percent-encode @ as %40, # as %23, ? as %3F, / as %2F, and spaces as %20."
    );
  }

  const userinfo = authority.slice(0, at);
  const hostport = authority.slice(at + 1);
  const separator = userinfo.indexOf(":");
  const rawUser = separator === -1 ? userinfo : userinfo.slice(0, separator);
  const rawPassword = separator === -1 ? "" : userinfo.slice(separator + 1);

  if (!rawUser) {
    throw new Error("The connection string is missing a username.");
  }

  const user = decodePart(rawUser, "username");
  const password = decodePart(rawPassword, "password");
  const { host, port } = splitHostPort(hostport);

  let rawPath = "";
  let rawQuery = "";

  if (remainder.startsWith("/")) {
    const pathAndQuery = remainder.slice(1);
    const queryStart = pathAndQuery.indexOf("?");
    rawPath = queryStart === -1 ? pathAndQuery : pathAndQuery.slice(0, queryStart);
    rawQuery = queryStart === -1 ? "" : pathAndQuery.slice(queryStart + 1);
  } else if (remainder.startsWith("?")) {
    rawQuery = remainder.slice(1);
  }

  const fragmentStart = rawQuery.indexOf("#");
  const query = fragmentStart === -1 ? rawQuery : rawQuery.slice(0, fragmentStart);

  return {
    user,
    password,
    host,
    port,
    database: decodePart(rawPath, "database name"),
    params: Array.from(new URLSearchParams(query).entries()),
  };
}

export function classifyEndpoint(host: string, port: string): ConnectionEndpoint {
  const h = host.toLowerCase().replace(/\.$/, "");

  if (/^db\.[a-z0-9-]+\.supabase\.co$/.test(h)) {
    return port === "6543" ? "supabase-dedicated" : "supabase-direct";
  }

  if (/\.pooler\.supabase\.com$/.test(h)) {
    return port === "6543" ? "supabase-shared-transaction" : "supabase-shared-session";
  }

  if (/(^|\.)neon\.tech$/.test(h)) {
    return h.includes("-pooler.") ? "neon-pooled" : "neon-direct";
  }

  return "other";
}

function rawPasswordNeedsEncoding(raw: string): boolean {
  const s = raw.trim();
  const scheme = /^postgres(ql)?:\/\//i.exec(s);
  if (!scheme) return false;

  const rest = s.slice(scheme[0].length);
  const authority = rest.split(/[/?#]/, 1)[0] ?? "";
  const at = authority.lastIndexOf("@");
  if (at === -1) return false;

  const userinfo = authority.slice(0, at);
  const separator = userinfo.indexOf(":");
  if (separator === -1) return false;

  const password = userinfo.slice(separator + 1);
  if (/[ @]/.test(password)) return true;
  if (/%(?![0-9A-Fa-f]{2})/.test(password)) return true;
  return false;
}

function sslMode(params: [string, string][]): string | null {
  const entry = params.find(([key]) => key.toLowerCase() === "sslmode");
  return entry ? entry[1].toLowerCase() : null;
}

function hasPgbouncer(params: [string, string][]): boolean {
  return params.some(
    ([key, value]) => key.toLowerCase() === "pgbouncer" && value.toLowerCase() === "true"
  );
}

export function analyzeConnectionString(
  raw: string,
  options: { prisma?: boolean } = {}
): ConnectionAnalysis {
  if (!raw.trim()) {
    return { parsed: null, error: null, endpoint: null, flags: [] };
  }

  let parsed: ParsedConnectionString;
  try {
    parsed = parseConnectionString(raw);
  } catch (err: unknown) {
    return {
      parsed: null,
      error: err instanceof Error ? err.message : "Could not parse this connection string.",
      endpoint: null,
      flags: [],
    };
  }

  const endpoint = classifyEndpoint(parsed.host, parsed.port);
  const flags: ConnectionFlag[] = [];
  const host = parsed.host.toLowerCase();

  if (rawPasswordNeedsEncoding(raw)) {
    flags.push({
      code: "password-encoding",
      severity: "error",
      message: "The password contains characters that must be percent-encoded.",
      fix: "Encode @ as %40, # as %23, ? as %3F, / as %2F, and spaces as %20.",
      href: PASSWORD_HREF,
    });
  }

  const isSupabaseDirectHost = /^db\.[a-z0-9-]+\.supabase\.co$/.test(host);
  const isSupabaseSharedHost = /\.pooler\.supabase\.com$/.test(host);

  if (isSupabaseDirectHost && parsed.port !== "5432" && parsed.port !== "6543") {
    flags.push({
      code: "supabase-port",
      severity: "error",
      message: "This Supabase host uses port 5432 for direct or 6543 for the dedicated pooler.",
      fix: "Change the port, or copy the full string from Dashboard -> Connect.",
      href: SUPABASE_PORT_HREF,
    });
  }

  if (isSupabaseSharedHost && parsed.port !== "5432" && parsed.port !== "6543") {
    flags.push({
      code: "supabase-port",
      severity: "error",
      message: "Shared Supabase pooling uses port 5432 for session mode or 6543 for transaction mode.",
      fix: "Change the port, or copy the full string from Dashboard -> Connect.",
      href: SUPABASE_PORT_HREF,
    });
  }

  if (isSupabaseSharedHost && (parsed.user === "postgres" || !parsed.user.includes("."))) {
    flags.push({
      code: "supabase-username",
      severity: "error",
      message: "A shared Supabase pooler username includes the project ref.",
      fix: "Use postgres.<PROJECT-REF>, copied from Dashboard -> Connect.",
      href: SUPABASE_TENANT_HREF,
    });
  }

  if (isSupabaseDirectHost && parsed.user.startsWith("postgres.")) {
    flags.push({
      code: "supabase-username",
      severity: "error",
      message: "Direct and dedicated Supabase connections use the plain postgres user.",
      fix: "Use postgres without the project ref, or switch to a shared pooler string.",
      href: SUPABASE_TENANT_HREF,
    });
  }

  if (endpoint !== "other") {
    const mode = sslMode(parsed.params);
    const isSupabase = endpoint.startsWith("supabase");
    const provider = isSupabase ? "Supabase" : "Neon";
    const sslHref = isSupabase ? SUPABASE_SSL_HREF : SSL_HREF;

    if (!mode) {
      flags.push({
        code: "sslmode-missing",
        severity: "warning",
        message: `${provider} connections should set sslmode explicitly.`,
        fix: isSupabase
          ? "Add ?sslmode=require and supply Supabase's CA: node-postgres treats require as verify-full."
          : "Add ?sslmode=require; node-postgres also verifies the provider certificate.",
        href: sslHref,
      });
    } else if (mode === "disable" || mode === "allow") {
      flags.push({
        code: "sslmode-unsafe",
        severity: "error",
        message: `sslmode=${mode} turns off or permits unencrypted connections.`,
        fix: "Use sslmode=require, or verify-full with the provider CA.",
        href: SSL_HREF,
      });
    } else if (mode === "prefer") {
      flags.push({
        code: "sslmode-prefer",
        severity: "warning",
        message: "sslmode=prefer lets many drivers fall back to an unencrypted connection.",
        fix: isSupabase
          ? "Use sslmode=require with Supabase's CA; node-postgres treats require as verify-full."
          : "Use sslmode=require, or verify-full with the provider CA.",
        href: sslHref,
      });
    }
  }

  if (
    options.prisma &&
    (endpoint === "supabase-shared-transaction" || endpoint === "supabase-dedicated") &&
    !hasPgbouncer(parsed.params)
  ) {
    const dedicated = endpoint === "supabase-dedicated";
    flags.push({
      code: "prisma-pgbouncer",
      severity: dedicated ? "warning" : "error",
      message: dedicated
        ? "This is a transaction pooler. Prisma needs prepared statements disabled unless the pooler supports them."
        : "Prisma on the shared transaction pooler needs prepared statements disabled.",
      fix: "Append pgbouncer=true to the query string for Prisma.",
      href: PRISMA_PREPARED_HREF,
    });
  }

  return { parsed, error: null, endpoint, flags };
}
