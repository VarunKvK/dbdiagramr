"use client";

// Cross-page handoff: converter tools stage output here, /visualize consumes
// it on load. sessionStorage (never URL params) so connection strings and
// large schemas stay out of server logs.

const SQL_KEY = "dbdiagramr:preload-sql";
const CONN_KEY = "dbdiagramr:preload-conn";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.sessionStorage !== "undefined";
}

export function setPreloadSql(sql: string): void {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(SQL_KEY, sql);
}

export function consumePreloadSql(): string | null {
  if (!canUseStorage()) return null;
  const v = window.sessionStorage.getItem(SQL_KEY);
  if (v) window.sessionStorage.removeItem(SQL_KEY);
  return v;
}

export function setPreloadConn(conn: string): void {
  if (!canUseStorage()) return;
  window.sessionStorage.setItem(CONN_KEY, conn);
}

export function consumePreloadConn(): string | null {
  if (!canUseStorage()) return null;
  const v = window.sessionStorage.getItem(CONN_KEY);
  if (v) window.sessionStorage.removeItem(CONN_KEY);
  return v;
}

/** Stage SQL and navigate to /visualize, where it loads as a rendered diagram. */
export function goVisualizeWithSql(sql: string): void {
  setPreloadSql(sql);
  window.location.href = "/visualize";
}

/** Stage a connection string and navigate to /visualize in connect mode. */
export function goVisualizeWithConn(conn: string): void {
  setPreloadConn(conn);
  window.location.href = "/visualize";
}
