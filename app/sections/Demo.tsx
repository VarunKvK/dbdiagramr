"use client";

import { useState, useRef, useEffect } from "react";
import type { Schema } from "@/lib/diagram";
import SchemaDiagram from "@/components/SchemaDiagram";

const SAMPLE_SCHEMA: Schema = {
  tables: [
    {
      name: "users",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "name", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "email", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "YES", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [],
    },
    {
      name: "posts",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "user_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "title", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "body", type: "text", nullable: "YES", default: null, isPrimaryKey: false },
        { name: "created_at", type: "timestamptz", nullable: "YES", default: "now()", isPrimaryKey: false },
      ],
      foreignKeys: [{ column: "user_id", referencesTable: "users", referencesColumn: "id" }],
    },
    {
      name: "tags",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "name", type: "varchar", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [],
    },
    {
      name: "comments",
      columns: [
        { name: "id", type: "uuid", nullable: "NO", default: "gen_random_uuid()", isPrimaryKey: true },
        { name: "post_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "user_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "content", type: "text", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "user_id", referencesTable: "users", referencesColumn: "id" },
      ],
    },
    {
      name: "post_tags",
      columns: [
        { name: "post_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
        { name: "tag_id", type: "uuid", nullable: "NO", default: null, isPrimaryKey: false },
      ],
      foreignKeys: [
        { column: "post_id", referencesTable: "posts", referencesColumn: "id" },
        { column: "tag_id", referencesTable: "tags", referencesColumn: "id" },
      ],
    },
  ],
};

export default function Demo() {
  const [visible, setVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="demo" ref={sectionRef} className="bg-[#fafafa]">
      <div className="mx-auto max-w-5xl px-4 py-24">
        <div className="mb-4 text-center">
          <span className="inline-block rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-600">
            Interactive Preview
          </span>
        </div>
        <h2 className="mb-6 text-center text-3xl font-medium text-[#1a1a1a] md:text-4xl">
          See your database, visually
        </h2>
        <p className="mx-auto mb-16 max-w-lg text-center text-[#737373]">
          Hover tables to trace relationships.
        </p>

        <div
          className="mx-auto max-w-4xl overflow-hidden rounded-2xl bg-[#1a1a1a] shadow-2xl ring-1 ring-black/5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(24px)",
            transition: "all 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* Window chrome */}
          <div className="flex h-10 items-center justify-between bg-[#252525] px-4">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
              <span className="h-3 w-3 rounded-full bg-[#28c840] ring-1 ring-black/10" />
            </div>
            <div className="w-16" />
          </div>

          {/* Content */}
          <div className="relative min-h-[360px]">
            <div className="overflow-hidden">
              <SchemaDiagram schema={SAMPLE_SCHEMA} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}