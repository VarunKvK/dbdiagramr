"use client";

import { useEffect } from "react";
import SchemaDiagram from "@/components/SchemaDiagram";
import { rlsDemoSchema } from "@/data/schemas/rlsDemo";
import { track } from "@/lib/analytics";

export default function RlsDemo() {
  useEffect(() => {
    track("rls_landing_viewed");
  }, []);

  return (
    <div className="overflow-hidden rounded-[20px] border border-border bg-surface shadow-lg">
      <div className="h-[520px] w-full">
        <SchemaDiagram
          schema={rlsDemoSchema}
          className="h-full w-full"
          zoomOnScroll={false}
          minimal
        />
      </div>
    </div>
  );
}
