"use client";

import { useMemo, useState } from "react";
import { goVisualizeWithConn } from "@/lib/preload";

type Preset = "custom" | "supabase-pooler" | "supabase-direct" | "neon" | "railway" | "local";

const PRESETS: { id: Preset; label: string; hint: string }[] = [
  { id: "custom", label: "Custom", hint: "Fill every field yourself" },
  { id: "supabase-pooler", label: "Supabase (pooler)", hint: "Session pooler, port 5432, works everywhere" },
  { id: "supabase-direct", label: "Supabase (direct)", hint: "Port 5432 direct, IPv6 only" },
  { id: "neon", label: "Neon", hint: "Pooled host, sslmode=require" },
  { id: "railway", label: "Railway", hint: "Standard public URL" },
  { id: "local", label: "Localhost", hint: "postgres://postgres:postgres@localhost:5432/mydb" },
];

const PRESET_DEFAULTS: Record<Exclude<Preset, "custom">, { host: string; port: string; database: string; user: string; sslmode: string }> = {
  "supabase-pooler": { host: "aws-0-eu-central-1.pooler.supabase.com", port: "5432", database: "postgres", user: "postgres.PROJECT_REF", sslmode: "require" },
  "supabase-direct": { host: "db.PROJECT_REF.supabase.co", port: "5432", database: "postgres", user: "postgres", sslmode: "require" },
  neon: { host: "ep-cool-darkness-123456-pooler.us-east-2.aws.neon.tech", port: "5432", database: "neondb", user: "neondb_owner", sslmode: "require" },
  railway: { host: "containers-us-west-123.railway.app", port: "5432", database: "railway", user: "postgres", sslmode: "require" },
  local: { host: "localhost", port: "5432", database: "mydb", user: "postgres", sslmode: "prefer" },
};

type Parsed = {
  user: string;
  password: string;
  host: string;
  port: string;
  database: string;
  params: [string, string][];
};

function parseConnString(raw: string): Parsed {
  const s = raw.trim();
  if (!/^postgres(ql)?:\/\//i.test(s)) {
    throw new Error('Must start with postgresql:// (e.g. postgresql://user:pass@host:5432/dbname)');
  }
  let u: URL;
  try {
    u = new URL(s.replace(/^postgres(ql)?:\/\//i, "http://"));
  } catch {
    throw new Error("Could not parse this connection string. Check for unescaped @ : / # characters (percent-encode special chars in the password).");
  }
  return {
    user: decodeURIComponent(u.username),
    password: decodeURIComponent(u.password),
    host: u.hostname,
    port: u.port || "5432",
    database: decodeURIComponent(u.pathname.replace(/^\//, "")),
    params: Array.from(u.searchParams.entries()),
  };
}

function buildConnString(f: { user: string; password: string; host: string; port: string; database: string; sslmode: string }): string {
  const auth = f.password
    ? `${encodeURIComponent(f.user)}:${encodeURIComponent(f.password)}`
    : encodeURIComponent(f.user);
  const port = f.port.trim() && f.port.trim() !== "5432" ? `:${f.port.trim()}` : `:${(f.port.trim() || "5432")}`;
  const ssl = f.sslmode && f.sslmode !== "prefer" ? `?sslmode=${f.sslmode}` : "";
  return `postgresql://${auth}@${f.host.trim()}${port}/${f.database.trim()}${ssl}`;
}

const inputCls =
  "w-full rounded-[10px] border border-border bg-white px-3 py-2.5 font-mono text-base text-ink outline-none focus:border-accent md:text-sm";

export default function ConnStringBuilder() {
  const [preset, setPreset] = useState<Preset>("supabase-pooler");
  const [user, setUser] = useState(PRESET_DEFAULTS["supabase-pooler"].user);
  const [password, setPassword] = useState("");
  const [host, setHost] = useState(PRESET_DEFAULTS["supabase-pooler"].host);
  const [port, setPort] = useState("5432");
  const [database, setDatabase] = useState("postgres");
  const [sslmode, setSslmode] = useState("require");
  const [paste, setPaste] = useState("");
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  function applyPreset(p: Preset) {
    setPreset(p);
    if (p === "custom") return;
    const d = PRESET_DEFAULTS[p];
    setHost(d.host);
    setPort(d.port);
    setDatabase(d.database);
    setUser(d.user);
    setSslmode(d.sslmode);
  }

  const built = useMemo(() => {
    if (!host.trim() || !user.trim() || !database.trim()) return "";
    try {
      return buildConnString({ user, password, host, port, database, sslmode });
    } catch {
      return "";
    }
  }, [user, password, host, port, database, sslmode]);

  const parsed = useMemo(() => {
    if (!paste.trim()) return { value: null as Parsed | null, error: null as string | null };
    try {
      return { value: parseConnString(paste), error: null as string | null };
    } catch (err: unknown) {
      return {
        value: null,
        error: err instanceof Error ? err.message : "Could not parse this connection string",
      };
    }
  }, [paste]);

  async function copyBuilt() {
    if (!built) return;
    await navigator.clipboard.writeText(built);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function loadParsedIntoBuilder() {
    if (!parsed.value) return;
    setPreset("custom");
    setUser(parsed.value.user);
    setPassword(parsed.value.password);
    setHost(parsed.value.host);
    setPort(parsed.value.port);
    setDatabase(parsed.value.database);
    const ssl = parsed.value.params.find(([k]) => k === "sslmode");
    if (ssl) setSslmode(ssl[1]);
    setParseError(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 py-2.5">
          <span className="font-mono text-xs font-medium text-muted">Build a connection string</span>
        </div>
        <div className="space-y-3 p-4">
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p.id)}
                aria-pressed={preset === p.id}
                title={p.hint}
                className={`min-h-[44px] rounded-[20px] px-3 py-1.5 font-mono text-xs font-medium transition-colors ${preset === p.id ? "bg-ink text-white" : "bg-cream text-muted hover:text-ink"}`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">User</span>
              <input value={user} onChange={(e) => setUser(e.target.value)} spellCheck={false} className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Password</span>
              <input value={password} onChange={(e) => setPassword(e.target.value)} spellCheck={false} type="password" placeholder="(stored nowhere)" className={inputCls} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">Host</span>
            <input value={host} onChange={(e) => setHost(e.target.value)} spellCheck={false} className={inputCls} />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Port</span>
              <input value={port} onChange={(e) => setPort(e.target.value)} spellCheck={false} inputMode="numeric" className={inputCls} />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium text-muted">Database</span>
              <input value={database} onChange={(e) => setDatabase(e.target.value)} spellCheck={false} className={inputCls} />
            </label>
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-muted">SSL mode</span>
            <select value={sslmode} onChange={(e) => setSslmode(e.target.value)} className={inputCls}>
              <option value="prefer">prefer</option>
              <option value="require">require</option>
              <option value="disable">disable</option>
              <option value="verify-full">verify-full</option>
            </select>
          </label>
          {built ? (
            <div className="rounded-[10px] bg-ink p-3">
              <pre className="overflow-x-auto font-mono text-xs leading-relaxed text-white/85">{built}</pre>
            </div>
          ) : (
            <p className="text-sm text-muted">Fill host, user, and database to build the URI.</p>
          )}
          <div className="sticky bottom-0 -mx-1 flex flex-wrap gap-2 bg-white/95 py-2 backdrop-blur-sm md:static md:bg-transparent md:p-0">
            <button
              type="button"
              onClick={copyBuilt}
              disabled={!built}
              className="min-h-[44px] flex-1 rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft disabled:opacity-40 md:flex-none"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <button
              type="button"
              onClick={() => built && goVisualizeWithConn(built)}
              disabled={!built}
              className="min-h-[44px] flex-1 rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-40 md:flex-none"
            >
              Open in dbdiagramr →
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[20px] border border-border bg-white shadow-sm">
        <div className="border-b border-border px-4 py-2.5">
          <span className="font-mono text-xs font-medium text-muted">Decode a connection string</span>
        </div>
        <div className="space-y-3 p-4">
          <textarea
            value={paste}
            onChange={(e) => {
              setPaste(e.target.value);
              setParseError(null);
            }}
            placeholder="postgresql://user:pass@host:5432/dbname?sslmode=require"
            spellCheck={false}
            className="h-28 w-full resize-none rounded-[10px] border border-border bg-white p-3 font-mono text-base text-ink outline-none placeholder:text-muted/60 focus:border-accent md:text-sm"
          />
          {parsed.error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="font-mono text-sm font-medium text-red-600">
                Could not decode this URI
              </p>
              <p className="mt-1 whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-red-600/80">
                {parsed.error}
              </p>
            </div>
          ) : parsed.value ? (
            <div>
              <table className="w-full text-sm">
                <tbody>
                  {(
                    [
                      ["User", parsed.value.user],
                      ["Password", parsed.value.password ? "•••••••• (present)" : "(empty)"],
                      ["Host", parsed.value.host],
                      ["Port", parsed.value.port],
                      ["Database", parsed.value.database],
                      ...parsed.value.params.map(([k, v]) => [`param: ${k}`, v]),
                    ] as [string, string][]
                  ).map(([k, v]) => (
                    <tr key={k} className="border-b border-border last:border-b-0">
                      <td className="py-2 pr-3 font-medium text-muted">{k}</td>
                      <td className="break-all py-2 font-mono text-ink">{v || "(empty)"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                type="button"
                onClick={loadParsedIntoBuilder}
                className="mt-3 min-h-[44px] w-full rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink shadow-sm transition-colors hover:bg-accent-soft"
              >
                Load into builder ↑
              </button>
            </div>
          ) : (
            <p className="text-sm text-muted">
              Paste a URI to see every part decoded, user, host, port, database, and parameters.
            </p>
          )}
          {parseError && <p className="text-sm text-red-500">{parseError}</p>}
        </div>
      </div>
    </div>
  );
}
