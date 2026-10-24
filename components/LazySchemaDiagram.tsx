"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { Schema } from "@/lib/diagram";

const SchemaDiagram = dynamic(() => import("@/components/SchemaDiagram"), {
  ssr: false,
});

export default function LazySchemaDiagram({
  schema,
  className = "",
}: {
  schema: Schema;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "300px 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        <SchemaDiagram schema={schema} className="h-full w-full" />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center bg-ink"
          aria-hidden="true"
        >
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/70" />
        </div>
      )}
    </div>
  );
}
