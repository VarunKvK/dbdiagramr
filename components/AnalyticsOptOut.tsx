"use client";

import { useEffect } from "react";
import { GA_MEASUREMENT_ID, NOTRACK_STORAGE_KEY } from "@/lib/analytics";

declare global {
  interface Window {
    __dbd_notrack_logged?: number;
  }
}

function logDisabledOnce(): void {
  if (window.__dbd_notrack_logged) return;
  window.__dbd_notrack_logged = 1;
  console.log("dbdiagramr: analytics disabled in this browser");
}

/** Mirrors the inline script on client-side navigations (?notrack=0/1 links). */
function apply(): void {
  try {
    const param = new URLSearchParams(window.location.search).get("notrack");
    if (param === "1") window.localStorage.setItem(NOTRACK_STORAGE_KEY, "1");
    else if (param === "0") window.localStorage.removeItem(NOTRACK_STORAGE_KEY);

    const flag = `ga-disable-${GA_MEASUREMENT_ID}`;
    const store = window as unknown as Record<string, unknown>;
    if (window.localStorage.getItem(NOTRACK_STORAGE_KEY) === "1") {
      store[flag] = true;
      logDisabledOnce();
    } else {
      delete store[flag];
    }
  } catch {
    /* storage unavailable */
  }
}

export default function AnalyticsOptOut() {
  useEffect(() => {
    apply();

    const originalPush = window.history.pushState;
    const originalReplace = window.history.replaceState;
    window.history.pushState = function (...args: Parameters<History["pushState"]>) {
      const result = originalPush.apply(this, args);
      apply();
      return result;
    };
    window.history.replaceState = function (
      ...args: Parameters<History["replaceState"]>
    ) {
      const result = originalReplace.apply(this, args);
      apply();
      return result;
    };
    window.addEventListener("popstate", apply);

    return () => {
      window.history.pushState = originalPush;
      window.history.replaceState = originalReplace;
      window.removeEventListener("popstate", apply);
    };
  }, []);

  return null;
}
