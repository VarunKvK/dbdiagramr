"use client";

import { useState } from "react";
import Link from "next/link";
import { Code, Plug } from "lucide-react";
import MacWindow from "@/components/ui/mac-window";

const tabs = [
  {
    id: "sql" as const,
    label: "Paste SQL",
    icon: Code,
    title: "Paste SQL",
    description:
      "Paste CREATE TABLE statements and see a live ER diagram as you type. No server needed.",
    cta: "Try SQL mode",
  },
  {
    id: "connect" as const,
    label: "Connect to Database",
    icon: Plug,
    title: "Connect to Database",
    description:
      "Paste your PostgreSQL connection string and see your entire database schema. Works with Supabase, Neon, Railway.",
    cta: "Try connection",
  },
];

export default function TwoWaysToUse() {
  const [active, setActive] = useState<"sql" | "connect">("sql");

  return (
    <section className="bg-cream pb-24 pt-[120px]">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-4 text-3xl font-medium text-ink md:text-4xl">
          Two ways to visualize your schema
        </h2>
        <p className="mb-10 max-w-2xl text-base leading-relaxed text-muted">
          Paste SQL for a quick preview, or connect to your live database for the
          full picture.
        </p>

        <div className="mb-8 flex gap-1 rounded-xl bg-surface p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActive(tab.id)}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-white text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <MacWindow url="dbdiagramr.space/visualize">
          <div className="p-6">
            {active === "sql" ? (
              <div className="space-y-4">
                <div className="rounded-lg bg-surface p-4 font-mono text-sm leading-relaxed text-muted">
                  <span className="text-indigo-600">CREATE TABLE</span>{" "}
                  <span className="text-ink">users</span> {"{"}
                  <br />
                  &nbsp;&nbsp;id{" "}
                  <span className="text-indigo-600">uuid PRIMARY KEY</span>,
                  <br />
                  &nbsp;&nbsp;name{" "}
                  <span className="text-muted">varchar(255) NOT NULL</span>,
                  <br />
                  &nbsp;&nbsp;email{" "}
                  <span className="text-muted">varchar(255) UNIQUE</span>
                  <br />
                  {"};"}
                  <br />
                  <br />
                  <span className="text-indigo-600">CREATE TABLE</span>{" "}
                  <span className="text-ink">posts</span> {"{"}
                  <br />
                  &nbsp;&nbsp;id{" "}
                  <span className="text-indigo-600">uuid PRIMARY KEY</span>,
                  <br />
                  &nbsp;&nbsp;user_id{" "}
                  <span className="text-muted">
                    uuid REFERENCES users(id)
                  </span>
                  ,
                  <br />
                  &nbsp;&nbsp;title <span className="text-muted">text</span>,
                  <br />
                  &nbsp;&nbsp;created_at{" "}
                  <span className="text-muted">timestamptz</span>
                  <br />
                  {"};"}
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-block rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white">
                    Generate diagram
                  </span>
                  <span className="text-xs text-muted">
                    2 tables, 1 relationship detected
                  </span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg border border-border bg-white px-4 py-3">
                  <Plug size={16} className="shrink-0 text-muted" />
                  <span className="truncate font-mono text-sm text-muted">
                    postgresql://postgres:xxxx@db.abc.supabase.co:5432/postgres
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="inline-block rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-medium text-white">
                    Generate diagram
                  </span>
                  <span className="text-xs text-muted">
                    Reads tables, columns, keys from your live database
                  </span>
                </div>
              </div>
            )}
          </div>
        </MacWindow>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = active === tab.id;
            return (
              <Link
                href="/visualize"
                key={tab.id}
                className={`rounded-xl bg-white p-6 shadow-sm ring-1 ring-black/5 transition-all duration-200 ${
                  isActive ? "ring-indigo-200" : ""
                }`}
              >
                <Icon
                  size={24}
                  className={isActive ? "text-indigo-600" : "text-muted"}
                />
                <h3 className="mt-4 text-lg font-medium text-ink">
                  {tab.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {tab.description}
                </p>
                <p
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-500"
                >
                  {tab.cta} &rarr;
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
