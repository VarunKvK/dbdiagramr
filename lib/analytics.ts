type EventParams = Record<string, string | number | boolean>;

export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-MK1QVPVPSJ";

export const NOTRACK_STORAGE_KEY = "dbd_notrack";

export type GenerateMethod =
  | "sql"
  | "dbml"
  | "prisma"
  | "connection_string"
  | "file"
  | "tool_handoff";

export type TableCountBucket = "1-5" | "6-20" | "21-50" | "50+";

export function tableCountBucket(count: number): TableCountBucket {
  if (count <= 5) return "1-5";
  if (count <= 20) return "6-20";
  if (count <= 50) return "21-50";
  return "50+";
}

export function analyticsDisabled(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (window.localStorage.getItem(NOTRACK_STORAGE_KEY) === "1") return true;
  } catch {
    /* storage unavailable */
  }
  return (
    (window as unknown as Record<string, unknown>)[
      `ga-disable-${GA_MEASUREMENT_ID}`
    ] === true
  );
}

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  if (analyticsDisabled()) return;
  try {
    const w = window as unknown as {
      gtag?: (...args: unknown[]) => void;
      dataLayer?: unknown[];
    };
    if (w.gtag) {
      w.gtag("event", event, params);
      return;
    }
    // gtag.js loads after window load; queue in the same shape it consumes so
    // early events are not lost.
    w.dataLayer = w.dataLayer || [];
    w.dataLayer.push(["event", event, params]);
  } catch {
    /* analytics must never break the app */
  }
}
