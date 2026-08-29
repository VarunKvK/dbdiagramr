export function formatType(raw: string): string {
  const t = raw.toLowerCase().trim();
  // Normalize common verbose types
  const map: Record<string, string> = {
    "character varying": "varchar",
    "character": "char",
    "timestamp without time zone": "timestamp",
    "timestamp with time zone": "timestamptz",
    "time without time zone": "time",
    "time with time zone": "timetz",
    "double precision": "float8",
    "integer": "int",
  };
  if (map[t]) return map[t];
  // For types with params like character varying(255) — not expected since data_type omits length, but handle
  for (const [k, v] of Object.entries(map)) {
    if (t.startsWith(k + "(")) return t.replace(k, v);
  }
  return raw;
}

export function shortType(raw: string): string {
  const f = formatType(raw);
  // Further shorten for display: e.g., keep as is but truncate long
  return f;
}
