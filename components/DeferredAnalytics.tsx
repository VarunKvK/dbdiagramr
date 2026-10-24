"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";

type IdleWindow = Window & {
  requestIdleCallback?: (
    callback: () => void,
    options?: { timeout: number }
  ) => number;
  cancelIdleCallback?: (id: number) => void;
};

export default function DeferredAnalytics() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let idleId: number | undefined;
    let timerId: number | undefined;
    let scheduled = false;

    const load = () => {
      if (!cancelled) setEnabled(true);
    };

    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      const idleWindow = window as IdleWindow;
      if (idleWindow.requestIdleCallback) {
        idleId = idleWindow.requestIdleCallback(load, { timeout: 2000 });
        return;
      }
      timerId = window.setTimeout(load, 2000);
    };

    if (document.readyState === "complete") {
      schedule();
    } else {
      window.addEventListener("load", schedule, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", schedule);
      if (timerId !== undefined) window.clearTimeout(timerId);
      if (idleId !== undefined) {
        (window as IdleWindow).cancelIdleCallback?.(idleId);
      }
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      <Script id="google-analytics" strategy="afterInteractive">
        {`(function () {
  window.dataLayer = window.dataLayer || [];
  var queued = window.dataLayer.slice();
  window.dataLayer.length = 0;
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', '${GA_MEASUREMENT_ID}');
  for (var i = 0; i < queued.length; i++) window.dataLayer.push(queued[i]);
})();`}
      </Script>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script
        src="https://analytics.ahrefs.com/analytics.js"
        data-key="fegBS/j8h5OGggFqrvUt8A"
        strategy="afterInteractive"
      />
    </>
  );
}
