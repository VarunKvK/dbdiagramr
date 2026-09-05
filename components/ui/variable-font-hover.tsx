"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface VariableFontHoverProps {
  label: string;
  className?: string;
  fromFontVariationSettings: string;
  toFontVariationSettings: string;
  staggerDuration?: number;
  staggerFrom?: "center" | "first" | "last" | number;
  transitionDuration?: string;
}

export function VariableFontHover({
  label,
  className,
  fromFontVariationSettings,
  toFontVariationSettings,
  staggerDuration = 0.03,
  staggerFrom = "center",
  transitionDuration = "0.3s",
}: VariableFontHoverProps) {
  const [isHovered, setIsHovered] = useState(false);
  const chars = label.split("");

  function getDelay(index: number): number {
    const len = chars.length;
    if (typeof staggerFrom === "number") {
      return Math.abs(index - staggerFrom) * staggerDuration;
    }
    if (staggerFrom === "first") {
      return index * staggerDuration;
    }
    if (staggerFrom === "last") {
      return (len - 1 - index) * staggerDuration;
    }
    const mid = (len - 1) / 2;
    return Math.abs(index - mid) * staggerDuration;
  }

  return (
    <span
      className={cn("inline-flex", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      aria-label={label}
    >
      {chars.map((char, index) => (
        <span
          key={`${char}-${index}`}
          aria-hidden="true"
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            fontVariationSettings: isHovered
              ? toFontVariationSettings
              : fromFontVariationSettings,
            transition: `font-variation-settings ${transitionDuration} ease ${getDelay(index)}s`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </span>
  );
}

export default VariableFontHover;
