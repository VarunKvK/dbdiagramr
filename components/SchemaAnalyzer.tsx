"use client";

import { useMemo, useState } from "react";
import type { Schema } from "@/lib/diagram";
import { analyzeSchema, type SchemaReport } from "@/lib/sql/analyzeSchema";
import TryModal from "@/components/TryModal";

const severityStyle: Record<string, string> = {
  error: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-indigo-50 text-indigo-600 ring-indigo-200",
};

const severityLabel: Record<string, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
};

const gradeColor: Record<string, string> = {
  A: "text-emerald-600",
  B: "text-indigo-600",
  C: "text-amber-600",
  D: "text-red-600",
};

function reportToMarkdown(report: SchemaReport): string {
  const lines = [
    `# Schema health report — grade ${report.grade} (${report.score}/100)`,
    ``,
    `- Tables: ${report.tableCount}`,
    `- Columns: ${report.columnCount}`,
    `- Foreign keys: ${report.foreignKeyCount}`,
    `- Issues: ${report.issues.length}`,
    ``,
  ];
  for (const issue of report.issues) {
    const where = [issue.table, issue.column].filter(Boolean).join(".");
    lines.push(`## [${issue.severity.toUpperCase()}] ${where || "schema"}`);
    lines.push(issue.message);
    lines.push(`Fix: ${issue.fix}`);
    lines.push(``);
  }
  lines.push(`Generated with dbdiagramr — https://www.dbdiagramr.space/database-schema-analyzer`);
  return lines.join("\n");
}

export default function SchemaAnalyzer() {
  const [schema, setSchema] = useState<Schema | null>(null);
  const [copied, setCopied] = useState(false);

  const report = useMemo(
    () => (schema ? analyzeSchema(schema) : null),
    [schema]
  );

  async function copyReport() {
    if (!report) return;
    await navigator.clipboard.writeText(reportToMarkdown(report));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function downloadReport() {
    if (!report) return;
    const blob = new Blob([reportToMarkdown(report)], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schema-health-report.md";
    a.click();
    URL.revokeObjectURL(url);
  }

  const errors = report?.issues.filter((i) => i.severity === "error") ?? [];
  const warnings = report?.issues.filter((i) => i.severity === "warning") ?? [];
  const infos = report?.issues.filter((i) => i.severity === "info") ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <TryModal
          onSchemaGenerated={setSchema}
          onSchemaCleared={() => setSchema(null)}
        />
      </div>

      <div>
        {!report ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-black/5">
            <div className="text-4xl font-medium text-ink">?</div>
            <h2 className="mt-4 text-xl font-medium text-ink">
              Paste SQL to get your schema grade
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Missing primary keys, unindexed foreign keys, naming drift —
              the analyzer checks your schema and grades it in seconds.
              Nothing leaves your browser.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5">
              <div
                className={`flex h-20 w-20 items-center justify-center rounded-full bg-cream text-4xl font-medium ring-4 ring-black/10 ${gradeColor[report.grade]}`}
              >
                {report.grade}
              </div>
              <div className="flex-1">
                <div className="text-2xl font-medium text-ink">
                  {report.score}/100
                </div>
                <div className="mt-1 text-sm text-muted">
                  {report.tableCount} tables · {report.columnCount} columns ·{" "}
                  {report.foreignKeyCount} foreign keys · {report.issues.length}{" "}
                  issues ({errors.length} errors, {warnings.length} warnings,{" "}
                  {infos.length} notes)
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
                >
                  {copied ? "Copied!" : "Copy report"}
                </button>
                <button
                  type="button"
                  onClick={downloadReport}
                  className="rounded-lg bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-600"
                >
                  Download .md
                </button>
              </div>
            </div>

            {report.issues.length === 0 ? (
              <div className="mt-4 rounded-2xl bg-emerald-50 p-6 text-center ring-1 ring-emerald-200">
                <div className="text-lg font-medium text-emerald-700">
                  Clean schema — nothing to flag.
                </div>
                <p className="mt-1 text-sm text-emerald-600">
                  Every table has a primary key and no common smells detected.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {report.issues.map((issue, i) => (
                  <div
                    key={`${issue.rule}-${issue.table}-${issue.column}-${i}`}
                    className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-black/5"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${severityStyle[issue.severity]}`}
                      >
                        {severityLabel[issue.severity]}
                      </span>
                      {(() => {
                        const where = [issue.table, issue.column]
                          .filter(Boolean)
                          .join(".");
                        return (
                          where && (
                            <code className="rounded bg-black/5 px-1.5 py-0.5 font-mono text-xs text-ink">
                              {where}
                            </code>
                          )
                        );
                      })()}
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-ink">
                      {issue.message}
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-muted">
                      <span className="font-medium">Fix:</span> {issue.fix}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 rounded-xl bg-indigo-50 p-5 ring-1 ring-indigo-200">
              <span className="text-sm text-indigo-900">
                Want to see these tables visually?{" "}
              </span>
              <a
                href="/visualize"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
              >
                Open your schema in the ER diagram tool →
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
