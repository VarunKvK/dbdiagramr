import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

export type ConnectionConfig = {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
  isLocal: boolean;
};

export type ValidateResult =
  | { ok: true; config: ConnectionConfig }
  | {
      ok: false;
      status: number;
      body: {
        error: string;
        details?: string;
        localhost?: boolean;
        dnsError?: boolean;
        hint?: string;
      };
    };

const MAX_LENGTH = 2048;

function ipv4ToNumber(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = value * 256 + octet;
  }
  return value;
}

const BLOCKED_IPV4: Array<[string, number]> = [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["100.64.0.0", 10],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.0.0.0", 24],
  ["192.0.2.0", 24],
  ["192.168.0.0", 16],
  ["198.18.0.0", 15],
  ["198.51.100.0", 24],
  ["203.0.113.0", 24],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
];

function isBlockedIpv4(ip: string): boolean {
  const value = ipv4ToNumber(ip);
  if (value === null) return true;
  return BLOCKED_IPV4.some(([base, bits]) => {
    const baseValue = ipv4ToNumber(base);
    if (baseValue === null) return false;
    const mask = bits === 0 ? 0 : (0xffffffff << (32 - bits)) >>> 0;
    return ((value & mask) >>> 0) === ((baseValue & mask) >>> 0);
  });
}

function expandIpv6(ip: string): number[] | null {
  const withoutZone = ip.split("%")[0];
  const halves = withoutZone.split("::");
  if (halves.length > 2) return null;

  const toGroups = (part: string): number[] | null => {
    if (!part) return [];
    const groups: number[] = [];
    for (const group of part.split(":")) {
      if (group.includes(".")) {
        const v4 = ipv4ToNumber(group);
        if (v4 === null) return null;
        groups.push(Math.floor(v4 / 65536), v4 % 65536);
      } else {
        if (!/^[0-9a-fA-F]{1,4}$/.test(group)) return null;
        groups.push(parseInt(group, 16));
      }
    }
    return groups;
  };

  const head = toGroups(halves[0]);
  if (!head) return null;

  if (halves.length === 1) {
    return head.length === 8 ? head : null;
  }

  const tail = toGroups(halves[1]);
  if (!tail) return null;

  const missing = 8 - head.length - tail.length;
  if (missing < 0) return null;
  return [...head, ...new Array(missing).fill(0), ...tail];
}

function isBlockedIpv6(ip: string): boolean {
  const groups = expandIpv6(ip);
  if (!groups) return true;

  const zeroPrefix = (count: number) => groups.slice(0, count).every((g) => g === 0);

  if (zeroPrefix(8)) return true;
  if (zeroPrefix(7) && groups[7] === 1) return true;
  if ((groups[0] & 0xfe00) === 0xfc00) return true;
  if ((groups[0] & 0xffc0) === 0xfe80) return true;

  if (zeroPrefix(5) && groups[5] === 0xffff) {
    const v4 = `${groups[6] >> 8}.${groups[6] & 0xff}.${groups[7] >> 8}.${groups[7] & 0xff}`;
    return isBlockedIpv4(v4);
  }

  if (zeroPrefix(6)) {
    const v4 = `${groups[6] >> 8}.${groups[6] & 0xff}.${groups[7] >> 8}.${groups[7] & 0xff}`;
    return isBlockedIpv4(v4);
  }

  return false;
}

function isLoopback(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) {
    return ip.split(".")[0] === "127";
  }
  if (version === 6) {
    const groups = expandIpv6(ip);
    if (!groups) return false;
    if (groups.slice(0, 7).every((g) => g === 0) && groups[7] === 1) return true;
    if (groups.slice(0, 5).every((g) => g === 0) && groups[5] === 0xffff) {
      return groups[6] >> 8 === 127;
    }
  }
  return false;
}

export function isBlockedAddress(ip: string): boolean {
  const version = isIP(ip);
  if (version === 4) return isBlockedIpv4(ip);
  if (version === 6) return isBlockedIpv6(ip);
  return true;
}

function invalid(details: string): ValidateResult {
  return {
    ok: false,
    status: 400,
    body: { error: "Invalid connection string", details },
  };
}

export async function validateConnectionString(raw: string): Promise<ValidateResult> {
  const connectionString = raw.trim();

  if (!connectionString || connectionString.length > MAX_LENGTH) {
    return invalid(
      "Paste a PostgreSQL connection string that starts with postgresql://."
    );
  }

  let url: URL;
  try {
    url = new URL(connectionString);
  } catch {
    return invalid(
      "That does not look like a valid URL. It should look like postgresql://user:password@host:5432/database."
    );
  }

  if (url.protocol !== "postgres:" && url.protocol !== "postgresql:") {
    const webHost = url.hostname.toLowerCase().replace(/\.$/, "");
    if (webHost.endsWith(".supabase.co")) {
      return invalid(
        "That is your Supabase project URL, not the database connection string. Open Dashboard -> Connect -> Connection string -> URI (or Session pooler). It starts with postgresql://."
      );
    }
    return invalid(
      "That looks like a web URL. You need your database connection string - it starts with postgresql://."
    );
  }

  if (url.hostname.includes(",")) {
    return invalid("Multiple hosts in one connection string are not supported. Use a single host.");
  }

  let hostname = url.hostname.replace(/\.$/, "").toLowerCase();
  if (hostname.startsWith("[") && hostname.endsWith("]")) {
    hostname = hostname.slice(1, -1);
  }
  if (!hostname) {
    return invalid(
      "The connection string is missing a host. It should look like postgresql://user:password@host:5432/database."
    );
  }

  let user: string;
  let password: string;
  let database: string;
  try {
    user = decodeURIComponent(url.username);
    password = decodeURIComponent(url.password);
    database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  } catch {
    return invalid(
      "The username, password or database name contains an invalid escape sequence."
    );
  }

  const port = url.port ? Number(url.port) : 5432;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return invalid("The port in the connection string is not valid.");
  }

  const literalIp = isIP(hostname) ? hostname : null;
  const localHostname =
    hostname === "localhost" || hostname.endsWith(".localhost");
  const isLocal = localHostname || (literalIp !== null && isLoopback(literalIp));

  if (!isLocal) {
    const sslModes = url.searchParams.getAll("sslmode").map((m) => m.toLowerCase());
    const weak = sslModes.find((mode) =>
      ["disable", "allow", "prefer", "no-verify"].includes(mode)
    );
    if (weak) {
      return invalid(
        `sslmode=${weak} is not allowed because it turns off certificate verification. Remove it from the connection string; dbdiagramr always verifies TLS certificates.`
      );
    }
  }

  if (literalIp) {
    if (!isLocal && isBlockedAddress(literalIp)) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "Private addresses are not allowed",
          details:
            "That host points to a private or internal network address. Use the public hostname from your database provider.",
        },
      };
    }
  } else if (!isLocal) {
    let addresses: string[];
    try {
      const records = await lookup(hostname, { all: true, verbatim: true });
      addresses = records.map((record) => record.address);
    } catch {
      return {
        ok: false,
        status: 400,
        body: {
          error: "Database host not found",
          details:
            "We could not resolve that hostname. Check for typos and that your database is running.",
          dnsError: true,
          ...(port === 5432 ? { hint: "pooler" } : {}),
        },
      };
    }

    if (addresses.length === 0) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "Database host not found",
          details:
            "That hostname did not resolve to any address. Check for typos and that your database is running.",
          dnsError: true,
        },
      };
    }

    if (!isLocal && addresses.some((address) => isBlockedAddress(address))) {
      return {
        ok: false,
        status: 400,
        body: {
          error: "Private addresses are not allowed",
          details:
            "That hostname resolves to a private or internal network address. Use the public hostname from your database provider.",
        },
      };
    }
  }

  return {
    ok: true,
    config: {
      host: hostname,
      port,
      user,
      password,
      database: database || user,
      isLocal,
    },
  };
}
