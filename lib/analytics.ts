type EventParams = Record<string, string | number | boolean>;

export function track(event: string, params: EventParams = {}): void {
  if (typeof window === "undefined") return;
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void })
      .gtag;
    if (gtag) gtag("event", event, params);
  } catch {
    /* analytics must never break the app */
  }
}
