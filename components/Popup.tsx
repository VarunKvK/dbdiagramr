"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ArrowRight, Database } from "lucide-react";
import { usePathname } from "next/navigation";

interface PopupProps {
  id: string;
  title: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  declineLabel: string;
  enableRoutes?: string[];
  trigger?: "exit" | "scroll" | "time";
}

type StoredState = { dismissedAt?: number; seenAt?: number } | null;

const STORAGE_PREFIX = "dbdiagramr:popup:";

function readState(id: string): StoredState {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${id}`);
    return raw ? (JSON.parse(raw) as StoredState) : null;
  } catch {
    return null;
  }
}

function writeState(id: string, state: StoredState) {
  try {
    if (state) {
      window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, JSON.stringify(state));
    } else {
      window.localStorage.removeItem(`${STORAGE_PREFIX}${id}`);
    }
  } catch {
    /* storage unavailable */
  }
}

function gtagEvent(name: string, params: Record<string, string | number | boolean>) {
  try {
    const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag;
    if (gtag) gtag("event", name, params);
  } catch {
    /* analytics unavailable */
  }
}

const DEFAULT_ROUTES = ["/schema", "/alternatives", "/dbdiagram-io-vs-dbdiagramr", "/drawsql-vs-dbdiagramr"];

export default function Popup({
  id,
  title,
  body,
  ctaLabel,
  ctaHref,
  declineLabel,
  enableRoutes = DEFAULT_ROUTES,
  trigger = "exit",
}: PopupProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  const enabled = enableRoutes.some((route) => {
    if (route === "/schema") return pathname === "/schema" || pathname.startsWith("/schema/");
    return pathname === route;
  });

  useEffect(() => {
    if (!enabled) return;
    const state = readState(id);
    if (state?.dismissedAt && Date.now() - state.dismissedAt < 7 * 24 * 60 * 60 * 1000) return;
    if (state?.seenAt && Date.now() - state.seenAt < 15 * 60 * 1000) return;

    let timeout: ReturnType<typeof setTimeout> | null = null;
    let fired = false;

    const fire = () => {
      if (fired || !document.hasFocus()) return;
      fired = true;
      writeState(id, { ...readState(id), seenAt: Date.now() });
      setOpen(true);
      gtagEvent("popup_shown", { popup_id: id, trigger });
    };

    const onMouseOut = (e: MouseEvent) => {
      if (e.clientY > 5 || e.relatedTarget) return;
      fire();
    };

    const onScroll = () => {
      if (trigger !== "scroll") return;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      if (window.scrollY >= max * 0.5) fire();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && document.activeElement === document.body) fire();
    };

    if (trigger === "exit") {
      document.addEventListener("mouseout", onMouseOut);
      document.addEventListener("keydown", onKeyDown);
    } else if (trigger === "scroll") {
      window.addEventListener("scroll", onScroll, { passive: true });
    } else if (trigger === "time") {
      timeout = setTimeout(fire, 1000 * 60);
    }

    return () => {
      document.removeEventListener("mouseout", onMouseOut);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("scroll", onScroll);
      if (timeout) clearTimeout(timeout);
    };
  }, [enabled, id, trigger]);

  const dismiss = useCallback(
    (dismissed = false) => {
      setOpen(false);
      if (dismissed) {
        writeState(id, { ...readState(id), dismissedAt: Date.now() });
        gtagEvent("popup_dismissed", { popup_id: id });
      } else {
        gtagEvent("popup_closed", { popup_id: id });
      }
    },
    [id]
  );

  const handleCta = useCallback(() => {
    gtagEvent("popup_cta_clicked", { popup_id: id });
    dismiss(false);
  }, [id, dismiss]);

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") dismiss();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, dismiss]);

  if (!enabled || !open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby={`${id}-title`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) dismiss(false);
      }}
    >
      <div className="absolute inset-0 bg-ink/40" aria-hidden="true" />
      <div className="relative w-full max-w-md rounded-2xl bg-white/95 p-6 shadow-2xl ring-1 ring-black/10 backdrop-blur sm:p-8">
        <button
          ref={closeRef}
          type="button"
          onClick={() => dismiss(false)}
          aria-label="Close"
          className="absolute top-4 right-4 rounded-lg p-1.5 text-muted transition-colors hover:bg-surface hover:text-ink focus:ring-2 focus:ring-indigo-600 focus:outline-none"
        >
          <X size={20} />
        </button>

        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Database size={22} />
        </div>

        <h2 id={`${id}-title`} className="text-xl font-medium text-ink">
          {title}
        </h2>
        <p className="mt-2 leading-relaxed text-muted">{body}</p>

        <a
          href={ctaHref}
          onClick={handleCta}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-ink px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-600 focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 focus:outline-none"
        >
          {ctaLabel}
          <ArrowRight size={16} />
        </a>

        <button
          type="button"
          onClick={() => dismiss(true)}
          className="mt-3 w-full text-center text-sm text-muted transition-colors hover:text-ink focus:ring-2 focus:ring-indigo-600 focus:outline-none"
        >
          {declineLabel}
        </button>
      </div>
    </div>
  );
}