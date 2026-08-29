"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ShinyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function ShinyButton({ children, className, ...props }: ShinyButtonProps) {
  return (
    <button
      className={cn(
        "group relative inline-flex items-center justify-center overflow-hidden rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-white transition-all hover:bg-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/20 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      <span className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-600/60 via-indigo-600/0 to-transparent opacity-60" />
      <span className="absolute inset-0 -z-10 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-transparent to-transparent" />
      <span
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(255,255,255,0.04)_50%)] bg-[length:100%_4px] opacity-30"
        aria-hidden
      />
      <span className="pointer-events-none absolute -top-10 left-0 h-20 w-20 -translate-x-[120%] rotate-12 bg-white/15 blur-xl transition-transform duration-700 group-hover:translate-x-[420%]" aria-hidden />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}
