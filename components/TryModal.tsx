"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import type { Schema } from "@/lib/diagram";
import { parseSqlToSchema } from "@/lib/sql/parsePostgres";
import { ECOMMERCE_SQL, SUPABASE_SQL, NEXTAUTH_SQL, SIMPLE_SQL } from "@/lib/sql/pgDumpSamples";
import { ShinyButton } from "@/components/ui/shiny-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";

type Phase = "form" | "loading" | "result" | "error";
type Mode = "connection" | "sql";

interface TryModalProps {
  onSchemaGenerated: (schema: Schema) => void;
  onSchemaCleared: () => void;
}

export default function TryModal({ onSchemaGenerated, onSchemaCleared }: TryModalProps) {
  const [mode, setMode] = useState<Mode>("sql");
  const [connectionString, setConnectionString] = useState("");
  const [sqlText, setSqlText] = useState("");
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [errorHint, setErrorHint] = useState<string | null>(null);
  const [tableCount, setTableCount] = useState(0);
  const [relCount, setRelCount] = useState(0);
  const [isLiveSite, setIsLiveSite] = useState(false);
  const [editorTheme, setEditorTheme] = useState<"light" | "dark">("light");
  const [isDragging, setIsDragging] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsLiveSite(
      typeof window !== "undefined" &&
        window.location.hostname !== "localhost" &&
        window.location.hostname !== "127.0.0.1"
    );
    const saved = typeof window !== "undefined" ? (localStorage.getItem("dbdiagramr-editor-theme") as "light" | "dark" | null) : null;
    if (saved === "dark" || saved === "light") setEditorTheme(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("dbdiagramr-editor-theme", editorTheme);
  }, [editorTheme]);

  const isLocalhostInput =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");
  const showLocalhostWarning = isLiveSite && isLocalhostInput;

  const handleSqlLive = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        setSqlError(null);
        setTableCount(0);
        setRelCount(0);
        onSchemaCleared();
        return;
      }
      try {
        const { schema } = parseSqlToSchema(trimmed);
        setSqlError(null);
        setTableCount(schema.tables.length);
        setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
        onSchemaGenerated(schema);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to parse SQL";
        setSqlError(msg);
      }
    },
    [onSchemaGenerated, onSchemaCleared]
  );

  useEffect(() => {
    if (mode !== "sql") return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const delay = sqlText.length > 8000 ? 500 : 250;
    debounceRef.current = setTimeout(() => handleSqlLive(sqlText), delay);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [sqlText, mode, handleSqlLive]);

  function loadSample(kind: "ecommerce" | "supabase" | "nextauth" | "simple") {
    let sample = "";
    if (kind === "ecommerce") sample = ECOMMERCE_SQL;
    else if (kind === "supabase") sample = SUPABASE_SQL;
    else if (kind === "nextauth") sample = NEXTAUTH_SQL;
    else sample = SIMPLE_SQL;
    setSqlText(sample);
    try {
      const { schema } = parseSqlToSchema(sample);
      setSqlError(null);
      setTableCount(schema.tables.length);
      setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
      onSchemaGenerated(schema);
      toast.success("Example loaded", {
        description: `${schema.tables.length} tables, ${schema.tables.reduce((a, t) => a + t.foreignKeys.length, 0)} relations`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to parse sample";
      setSqlError(msg);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large", { description: "Limit is 2MB." });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setSqlText(String(reader.result || ""));
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      setSqlText(text);
      return;
    }
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setSqlText(String(reader.result || ""));
      reader.readAsText(file);
    }
  }

  async function handleGenerateConnection() {
    if (!connectionString.trim() || showLocalhostWarning) return;
    setPhase("loading");
    setErrorMsg("");
    setErrorHint(null);
    const cs = connectionString.trim();
    const isLocal = cs.includes("localhost") || cs.includes("127.0.0.1");
    try {
      const res = await fetch("/api/schema", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          connectionString: cs,
          ...(isLocal ? { ssl: false } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.localhost) {
          toast.error("Localhost detected", {
            description: "Run dbdiagramr locally or use a cloud database (Supabase, Neon, Railway).",
          });
        }
        if (data.dnsError) {
          toast.error("Database not found", {
            description:
              data.hint === "pooler"
                ? "Switch to the Transaction pooler (port 6543), see guide."
                : "Check for typos, unpause your database, or use the connection pooler (port 6543).",
          });
        }
        if (data.hint === "pooler") setErrorHint("pooler");
        throw new Error(data.details || data.error || "API error");
      }
      const schema = data as Schema;
      setTableCount(schema.tables.length);
      setRelCount(schema.tables.reduce((acc, t) => acc + t.foreignKeys.length, 0));
      setPhase("result");
      onSchemaGenerated(schema);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setErrorMsg(msg);
      setPhase("error");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && phase === "form" && mode === "connection") handleGenerateConnection();
  }

  function handleNewConnection() {
    setPhase("form");
    setErrorHint(null);
    onSchemaCleared();
  }

  function handleClearSql() {
    setSqlText("");
    setSqlError(null);
    setTableCount(0);
    setRelCount(0);
    onSchemaCleared();
    textareaRef.current?.focus();
  }

  const hasError = !!sqlError;
  const hasSql = !!sqlText.trim();

  return (
    <div className="flex w-full flex-col overflow-hidden rounded-2xl border border-black/5 bg-white shadow-sm">
      <div className="flex border-b border-black/5">
        <button
          onClick={() => setMode("sql")}
          aria-pressed={mode === "sql"}
          className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${mode === "sql" ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
        >
          Paste SQL
        </button>
        <button
          onClick={() => setMode("connection")}
          aria-pressed={mode === "connection"}
          className={`flex-1 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${mode === "connection" ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"}`}
        >
          Connect
        </button>
      </div>

      {(phase === "form" || mode === "sql") && mode === "sql" && (
        <div className="flex flex-col p-6">
          <h3 className="text-sm font-medium text-ink">Paste SQL</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">
            Paste your CREATE TABLE statements. Diagram updates as you type.
          </p>

          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative mt-5 overflow-hidden rounded-xl border ${editorTheme === "dark" ? "border-white/10 bg-[#0f0f0f]" : "border-black/10 bg-cream"} ${isDragging ? "ring-2 ring-indigo-500/20 border-indigo-500/30" : ""}`}
          >
            <div className={`flex items-center justify-between border-b px-3 py-2 ${editorTheme === "dark" ? "border-white/5 bg-[#141414]" : "border-black/5 bg-white"}`}>
              <span className={`font-mono text-xs ${editorTheme === "dark" ? "text-[#666]" : "text-muted"}`}>schema.sql</span>
              <div className="flex items-center gap-2">
                {hasSql && (
                  <button onClick={handleClearSql} className={`font-mono text-xs hover:underline ${editorTheme === "dark" ? "text-[#888] hover:text-white" : "text-muted hover:text-ink"}`}>
                    Clear
                  </button>
                )}
                <ThemeToggle theme={editorTheme} onToggle={() => setEditorTheme((t) => (t === "light" ? "dark" : "light"))} />
              </div>
            </div>
            <textarea
              ref={textareaRef}
              value={sqlText}
              onChange={(e) => setSqlText(e.target.value)}
              placeholder={`CREATE TABLE users (
  id uuid PRIMARY KEY,
  email varchar(255) NOT NULL
);

CREATE TABLE posts (
  id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES users(id),
  title text NOT NULL
);`}
              rows={10}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              aria-label="SQL editor"
              aria-describedby={hasError ? "sql-error" : undefined}
              aria-invalid={hasError}
              className={`min-h-[200px] w-full resize-none bg-transparent p-4 font-mono text-sm leading-6 outline-none placeholder:text-muted/60 ${editorTheme === "dark" ? "text-white placeholder:text-[#555]" : "text-ink"}`}
            />
            {isDragging && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                <span className="rounded-full bg-ink px-4 py-2 font-mono text-xs font-medium text-white">Drop .sql file to load</span>
              </div>
            )}
          </div>

          <div className="mt-3 flex min-h-[20px] items-center justify-between">
            <div className="font-mono text-xs text-muted">
              {hasError ? (
                <span id="sql-error" role="alert" className="text-red-600">
                  {sqlError}
                </span>
              ) : hasSql ? (
                <span className="text-emerald-700">
                  {tableCount} tables, {relCount} relations, live
                </span>
              ) : (
                <span>Drop a .sql file or paste above. Try an example to start.</span>
              )}
            </div>
            {!hasSql && !hasError && (
              <button onClick={() => fileInputRef.current?.click()} className="font-mono text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
                Upload .sql
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept=".sql,.txt" onChange={handleFileUpload} className="hidden" aria-hidden />

          {!hasSql && !hasError ? (
            <div className="mt-6 flex justify-center">
              <ShinyButton onClick={() => loadSample("ecommerce")}>Load E-commerce example</ShinyButton>
            </div>
          ) : hasError ? (
            <div className="mt-4 flex justify-center">
              <button onClick={() => loadSample("ecommerce")} className="font-mono text-xs text-muted underline-offset-4 hover:text-ink hover:underline">
                Load a working example instead
              </button>
            </div>
          ) : null}
        </div>
      )}

      {(phase === "form" || mode === "sql") && mode === "connection" && (
        <div className="p-6">
          <h3 className="text-sm font-medium text-ink">Connect to your database</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted">Paste your connection string to visualize your live schema.</p>
          <div className="mt-5">
            <label htmlFor="connection-string" className="sr-only">Connection string</label>
            <input
              id="connection-string"
              type="text"
              value={connectionString}
              onChange={(e) => setConnectionString(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="postgresql://user:pass@host:5432/dbname"
              autoComplete="off"
              spellCheck={false}
              aria-invalid={showLocalhostWarning}
              aria-describedby={showLocalhostWarning ? "localhost-warning" : undefined}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-sm text-ink placeholder:text-muted/60 outline-none ring-ink/10 focus:border-ink focus:ring-2"
            />
          </div>

          {showLocalhostWarning && (
            <div id="localhost-warning" className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-3">
              <p className="font-mono text-xs font-medium text-amber-800">Local database detected</p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-amber-700">Local databases only work when running locally. For the hosted version, use Supabase, Neon, or Railway.</p>
            </div>
          )}

          {isLiveSite && !showLocalhostWarning && (
            <p className="mt-3 rounded-xl bg-cream px-3 py-2 font-mono text-xs leading-relaxed text-muted">
              Tip: On Vercel or Netlify use your database Transaction pooler (port 6543), not direct 5432.
            </p>
          )}

          <div className="mt-6 flex justify-center">
            <ShinyButton onClick={handleGenerateConnection} aria-disabled={!connectionString.trim() || showLocalhostWarning} className={!connectionString.trim() || showLocalhostWarning ? "opacity-40 pointer-events-none" : ""}>
              Generate diagram
            </ShinyButton>
          </div>
        </div>
      )}

      {phase === "loading" && mode === "connection" && (
        <div className="flex items-center justify-center gap-3 p-8">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-black/10 border-t-ink" />
          <span className="font-mono text-sm text-muted">Analyzing schema...</span>
        </div>
      )}

      {phase === "error" && mode === "connection" && (
        <div className="p-6">
          <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-red-600">{errorMsg}</p>
          {errorHint === "pooler" && (
            <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3">
              <p className="font-mono text-xs font-medium text-amber-800">Try the Transaction pooler (port 6543)</p>
              <p className="mt-1 font-mono text-xs leading-relaxed text-amber-700">Direct connections often fail from serverless. In your dashboard go to Connect, Transaction pooler, copy the 6543 string.</p>
            </div>
          )}
          <div className="mt-6 flex justify-center">
            <ShinyButton onClick={handleNewConnection}>Try again</ShinyButton>
          </div>
        </div>
      )}

      {phase === "result" && mode === "connection" && (
        <div className="p-6 text-center">
          <p className="font-mono text-sm text-ink">
            Connected, {tableCount} tables, {relCount} relations, live
          </p>
          <div className="mt-6 flex justify-center">
            <button onClick={handleNewConnection} className="font-mono text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
              New connection
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
