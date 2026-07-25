"use client";

import { Toaster, toast as sonnerToast } from "sonner";

export function ToastProvider() {
  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: {
          background: "transparent",
          border: "none",
          boxShadow: "none",
          padding: 0,
        },
      }}
    />
  );
}

function ToastCard({
  title,
  children,
  variant,
  onDismiss,
}: {
  title: string;
  children: React.ReactNode;
  variant: "error" | "warning" | "info";
  onDismiss: () => void;
}) {
  const icon = {
    error: (
      <svg
        className="h-4 w-4 text-destructive"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
    warning: (
      <svg
        className="h-4 w-4 text-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
        />
      </svg>
    ),
    info: (
      <svg
        className="h-4 w-4 text-foreground"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div className="relative w-full max-w-sm overflow-hidden rounded-lg border border-border bg-background shadow-lg">
      <div className="flex items-start gap-3 p-4">
        <div className="mt-0.5 shrink-0">{icon[variant]}</div>
        <div className="flex-1 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <button
              onClick={onDismiss}
              className="shrink-0 rounded p-1 text-muted-foreground/60 transition-colors hover:bg-muted hover:text-foreground"
            >
              <svg
                className="h-3.5 w-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="text-[13px] leading-relaxed text-muted-foreground">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export const toast = {
  localhost: () => {
    sonnerToast.custom((id) => (
      <ToastCard
        title="Localhost won't work here"
        variant="warning"
        onDismiss={() => sonnerToast.dismiss(id)}
      >
        <p className="mb-3">
          You're on the hosted version of dbdiagramr, so{" "}
          <code className="rounded bg-muted px-1 py-0.5 font-mono text-[11px] text-foreground">
            localhost
          </code>{" "}
          points to this server, not your computer.
        </p>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-foreground">
            To visualize your local database:
          </p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>
                Run dbdiagramr locally:{" "}
                <code className="rounded bg-muted px-1 font-mono text-[11px] text-foreground">
                  git clone + npm run dev
                </code>
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>Or use a cloud database: Supabase, Neon, or Railway</span>
            </li>
          </ul>
        </div>
      </ToastCard>
    ));
  },

  dnsError: () => {
    sonnerToast.custom((id) => (
      <ToastCard
        title="Database not found"
        variant="error"
        onDismiss={() => sonnerToast.dismiss(id)}
      >
        <p className="mb-3">
          We couldn't find that database — the hostname doesn't seem to exist.
        </p>
        <div className="rounded-md bg-muted/50 p-3">
          <p className="mb-2 text-xs font-medium text-foreground">
            This often happens when:
          </p>
          <ul className="space-y-2 text-xs text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>
                The database is paused (Supabase free tier pauses after 7 days
                of inactivity)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>The hostname has a typo</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
              <span>
                The server uses IPv6 and your hosting platform needs the
                connection pooler{" "}
                <code className="rounded bg-muted px-1 font-mono text-[11px] text-foreground">
                  (port 6543)
                </code>
              </span>
            </li>
          </ul>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Check your connection string and try again.
        </p>
      </ToastCard>
    ));
  },

  connectionError: (message: string) => {
    sonnerToast.custom((id) => (
      <ToastCard
        title="Could not connect"
        variant="error"
        onDismiss={() => sonnerToast.dismiss(id)}
      >
        <p className="mb-2 text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground/70">
          Make sure your database is running and accessible from the internet.
        </p>
      </ToastCard>
    ));
  },

  genericError: (message: string) => {
    sonnerToast.custom((id) => (
      <ToastCard
        title="Something went wrong"
        variant="error"
        onDismiss={() => sonnerToast.dismiss(id)}
      >
        <p className="text-muted-foreground">{message}</p>
      </ToastCard>
    ));
  },

  success: (tables: number, relations: number) => {
    sonnerToast.custom((id) => (
      <ToastCard
        title="Diagram generated"
        variant="info"
        onDismiss={() => sonnerToast.dismiss(id)}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg
              className="h-3.5 w-3.5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4"
              />
            </svg>
            <span>{tables} tables</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <svg
              className="h-3.5 w-3.5 text-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span>{relations} relations</span>
          </div>
        </div>
      </ToastCard>
    ));
  },

  dismiss: sonnerToast.dismiss,
};