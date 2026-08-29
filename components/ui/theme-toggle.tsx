"use client";

import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle({
  theme,
  onToggle,
  className,
}: {
  theme: "light" | "dark";
  onToggle: () => void;
  className?: string;
}) {
  const isLight = theme === "light";
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`Switch to ${isLight ? "dark" : "light"} theme`}
      aria-pressed={isLight}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border p-0.5 transition-colors",
        isLight
          ? "border-black/10 bg-white"
          : "border-white/10 bg-[#1a1a1a]",
        className
      )}
    >
      <span
        className={cn(
          "inline-flex h-5 w-5 items-center justify-center rounded-full bg-white shadow-sm transition-transform",
          isLight
            ? "translate-x-0 bg-white text-amber-500 border border-black/5"
            : "translate-x-5 bg-[#2a2a2a] text-indigo-300 border border-white/10"
        )}
      >
        {isLight ? <Sun size={12} /> : <Moon size={12} />}
      </span>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}
