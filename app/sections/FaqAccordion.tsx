"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Faq = { q: string; a: string };
type Variant = "landing" | "card" | "flush";

const itemStyles: Record<Variant, string> = {
  landing: "rounded-[20px] bg-surface px-5 transition-colors duration-200",
  card: "rounded-[20px] border border-border bg-white shadow-sm transition-colors duration-200",
  flush: "border-b border-border px-5 transition-colors duration-200 last:border-b-0",
};

const buttonStyles: Record<Variant, string> = {
  landing: "py-4",
  card: "px-6 pt-6 pb-4",
  flush: "py-4",
};

const questionStyles: Record<Variant, string> = {
  landing: "text-base font-semibold text-ink",
  card: "text-lg font-medium text-ink",
  flush: "text-sm font-semibold text-ink",
};

const answerStyles: Record<Variant, string> = {
  landing: "pb-5 pr-8 text-sm leading-relaxed text-muted",
  card: "px-6 pb-6 text-base leading-relaxed text-muted",
  flush: "pb-4 text-sm leading-relaxed text-muted",
};

export default function FaqAccordion({
  items,
  variant = "landing",
  columns = variant === "landing" ? 2 : 1,
}: {
  items: Faq[];
  variant?: Variant;
  columns?: 1 | 2;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div
      className={cn(
        "grid items-start",
        variant === "flush" ? "gap-0" : variant === "card" ? "gap-4" : "gap-3",
        columns === 2 && "md:grid-cols-2",
      )}
    >
      {items.map((faq, index) => {
        const isOpen = openIndex === index;
        const panelId = `${baseId}-panel-${index}`;
        const buttonId = `${baseId}-button-${index}`;

        return (
          <div
            key={faq.q}
            className={cn(
              itemStyles[variant],
              isOpen && variant !== "card" && "bg-white",
            )}
          >
            <h3>
              <button
                id={buttonId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={cn(
                  "flex w-full items-center justify-between gap-4 text-left",
                  buttonStyles[variant],
                )}
              >
                <span className={questionStyles[variant]}>{faq.q}</span>
                <Plus
                  size={16}
                  strokeWidth={2}
                  aria-hidden
                  className={cn(
                    "shrink-0 text-muted transition-transform duration-300 ease-in-out",
                    isOpen ? "rotate-45" : "rotate-0",
                  )}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              aria-hidden={!isOpen}
              className="grid transition-[grid-template-rows,opacity] duration-300 ease-in-out"
              style={{
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                opacity: isOpen ? 1 : 0,
              }}
            >
              <div className="min-h-0 overflow-hidden">
                <p className={answerStyles[variant]}>{faq.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
