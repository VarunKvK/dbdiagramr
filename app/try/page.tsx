"use client";

import { useState, useCallback } from "react";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";
import TryModal from "@/components/TryModal";

export default function TryPage() {
  const [schema, setSchema] = useState<Schema | null>(null);

  const handleSchemaGenerated = useCallback((s: Schema) => {
    setSchema(s);
  }, []);

  const handleSchemaCleared = useCallback(() => {
    setSchema(null);
  }, []);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-[#1a1a1a]">
      {/* Floating modal */}
      <div className="absolute top-4 left-4 z-20">
        <TryModal
          onSchemaGenerated={handleSchemaGenerated}
          onSchemaCleared={handleSchemaCleared}
        />
      </div>

      {/* Full-page diagram preview */}
      <div className="h-full w-full">
        {schema ? (
          <SchemaDiagram schema={schema} className="h-full w-full" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-[#252525]">
                <svg
                  className="h-8 w-8 text-[#555]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7C5 4 4 5 4 7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M8 12h8M12 8v8"
                  />
                </svg>
              </div>
              <h2 className="mb-2 text-lg font-medium text-[#555]">
                No diagram yet
              </h2>
              <p className="max-w-xs text-sm text-[#444]">
                Paste your PostgreSQL connection string in the panel above to
                generate a live ER diagram.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
