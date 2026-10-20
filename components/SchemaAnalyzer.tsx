"use client";

import { useMemo, useState } from "react";
import type { Schema } from "@/lib/diagram";
import { analyzeSchema, type SchemaReport } from "@/lib/sql/analyzeSchema";
import { track } from "@/lib/analytics";
import TryModal from "@/components/TryModal";

const severityStyle: Record<string, string> = {
  error: "bg-red-50 text-red-700 ring-red-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  info: "bg-accent-soft text-accent ring-accent/30",
};

const severityLabel: Record<string, string> = {
  error: "Error",
  warning: "Warning",
  info: "Info",
};

const gradeColor: Record<string, string> = {
  A: "text-emerald-600",
  B: "text-accent",
  C: "text-amber-600",
  D: "text-red-600",
};

function reportToMarkdown(report: SchemaReport): string {
  const lines = [
    `# Schema health report: grade ${report.grade} (${report.score}/100)`,
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
  lines.push(`Generated with dbdiagramr (https://www.dbdiagramr.space/database-schema-analyzer)`);
  return lines.join("\n");
}

const CARD_FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

const gradeAccent: Record<string, string> = {
  A: "#34d399",
  B: "#818cf8",
  C: "#fbbf24",
  D: "#f87171",
};

const gradeHeadline: Record<string, string> = {
  A: "Clean schema. Ship it.",
  B: "Healthy, a few things to tidy.",
  C: "Worth fixing before it spreads.",
  D: "Fix the errors first.",
};

function fitText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length > 1 && ctx.measureText(`${out}…`).width > maxWidth) {
    out = out.slice(0, -1);
  }
  return `${out}…`;
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (!current || ctx.measureText(test).width <= maxWidth) {
      current = test;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length <= maxLines) return lines;
  const out = lines.slice(0, maxLines);
  out[maxLines - 1] = fitText(ctx, `${out[maxLines - 1]} …`, maxWidth);
  return out;
}

function drawStat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  value: string,
  label: string
) {
  ctx.fillStyle = "#1b1d21";
  ctx.beginPath();
  ctx.roundRect(x, y, w, 86, 14);
  ctx.fill();
  ctx.fillStyle = "#f5f5f5";
  ctx.font = `600 30px ${CARD_FONT}`;
  ctx.fillText(value, x + 18, y + 40);
  ctx.fillStyle = "#8b8f96";
  ctx.font = `500 15px ${CARD_FONT}`;
  ctx.fillText(label, x + 18, y + 66);
}

function downloadScoreCard(report: SchemaReport) {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const accent = gradeAccent[report.grade] ?? "#e5e5e5";
  const errors = report.issues.filter((i) => i.severity === "error").length;
  const warnings = report.issues.filter((i) => i.severity === "warning").length;

  ctx.fillStyle = "#111214";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#1e2024";
  ctx.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
    ctx.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
    ctx.stroke();
  }

  const glow = ctx.createRadialGradient(250, 320, 20, 250, 320, 280);
  glow.addColorStop(0, `${accent}2e`);
  glow.addColorStop(1, "rgba(17,18,20,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 40, 600, 560);

  ctx.fillStyle = "#9ca3af";
  ctx.font = `600 18px ${CARD_FONT}`;
  ctx.fillText("SCHEMA HEALTH REPORT", 80, 92);

  ctx.textAlign = "right";
  ctx.fillStyle = "#e5e7eb";
  ctx.font = `600 22px ${CARD_FONT}`;
  ctx.fillText("dbdiagramr", 1120, 92);
  ctx.textAlign = "start";

  ctx.beginPath();
  ctx.arc(250, 320, 120, 0, Math.PI * 2);
  ctx.strokeStyle = `${accent}55`;
  ctx.lineWidth = 10;
  ctx.stroke();

  const pct = Math.max(0, Math.min(1, report.score / 100));
  ctx.beginPath();
  ctx.arc(250, 320, 120, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 10;
  ctx.lineCap = "round";
  ctx.stroke();

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = accent;
  ctx.font = `700 104px ${CARD_FONT}`;
  ctx.fillText(report.grade, 250, 308);
  ctx.fillStyle = "#d1d5db";
  ctx.font = `500 22px ${CARD_FONT}`;
  ctx.fillText(`${report.score}/100`, 250, 382);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#f5f5f5";
  ctx.font = `700 40px ${CARD_FONT}`;
  wrapLines(ctx, gradeHeadline[report.grade] ?? "Schema health score", 650, 2).forEach(
    (line, i) => ctx.fillText(line, 470, 122 + i * 48)
  );

  const boxWidth = 153;
  const gap = 12;
  drawStat(ctx, 470, 200, boxWidth, String(report.tableCount), "tables");
  drawStat(ctx, 470 + boxWidth + gap, 200, boxWidth, String(report.columnCount), "columns");
  drawStat(ctx, 470 + (boxWidth + gap) * 2, 200, boxWidth, String(report.foreignKeyCount), "foreign keys");
  drawStat(ctx, 470 + (boxWidth + gap) * 3, 200, boxWidth, String(report.issues.length), "issues");

  ctx.fillStyle = "#8b8f96";
  ctx.font = `500 16px ${CARD_FONT}`;
  ctx.fillText(
    `${errors} errors · ${warnings} warnings · ${report.issues.length - errors - warnings} notes`,
    470,
    330
  );

  const top = report.issues.slice(0, 3);
  if (top.length === 0) {
    ctx.fillStyle = accent;
    ctx.font = `500 22px ${CARD_FONT}`;
    ctx.fillText("No issues found.", 470, 390);
  } else {
    top.forEach((issue, i) => {
      const y = 390 + i * 52;
      const dotColor =
        issue.severity === "error" ? "#f87171" : issue.severity === "warning" ? "#fbbf24" : "#818cf8";
      ctx.fillStyle = dotColor;
      ctx.beginPath();
      ctx.arc(478, y - 7, 5, 0, Math.PI * 2);
      ctx.fill();
      const where = [issue.table, issue.column].filter(Boolean).join(".");
      ctx.fillStyle = "#e5e7eb";
      ctx.font = `500 19px ${CARD_FONT}`;
      ctx.fillText(
        fitText(ctx, `${where ? `${where}: ` : ""}${issue.message}`, 640),
        496,
        y
      );
    });
  }

  ctx.strokeStyle = "#24272c";
  ctx.beginPath();
  ctx.moveTo(80, 556);
  ctx.lineTo(1120, 556);
  ctx.stroke();

  ctx.fillStyle = "#9ca3af";
  ctx.font = `500 18px ${CARD_FONT}`;
  ctx.fillText("dbdiagramr.space/database-schema-analyzer", 80, 596);
  ctx.textAlign = "right";
  ctx.fillStyle = "#6b7280";
  ctx.fillText("Made with dbdiagramr", 1120, 596);
  ctx.textAlign = "start";

  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `schema-health-${report.grade}-${report.score}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }, "image/png");
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

  function downloadCard() {
    if (!report) return;
    downloadScoreCard(report);
    track("score_card_downloaded", {
      grade: report.grade,
      score: report.score,
      table_count: report.tableCount,
      issue_count: report.issues.length,
    });
  }

  const errors = report?.issues.filter((i) => i.severity === "error") ?? [];
  const warnings = report?.issues.filter((i) => i.severity === "warning") ?? [];
  const infos = report?.issues.filter((i) => i.severity === "info") ?? [];

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <div className="rounded-[20px] border border-border bg-white p-4 shadow-sm">
        <TryModal
          onSchemaGenerated={setSchema}
          onSchemaCleared={() => setSchema(null)}
        />
      </div>

      <div>
        {!report ? (
          <div className="flex h-full min-h-[320px] flex-col items-center justify-center rounded-[20px] border border-border bg-white p-8 text-center shadow-sm">
            <div className="text-4xl font-medium text-ink">?</div>
            <h2 className="mt-4 text-xl font-semibold text-ink">
              Paste SQL to get your schema grade
            </h2>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-muted">
              Missing primary keys, unindexed foreign keys, naming drift. The analyzer checks your schema and grades it in seconds.
              Nothing leaves your browser.
            </p>
          </div>
        ) : (
          <div>
            <div className="flex flex-wrap items-center gap-4 rounded-[20px] border border-border bg-white p-6 shadow-sm">
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
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyReport}
                  className="rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
                >
                  {copied ? "Copied!" : "Copy report"}
                </button>
                <button
                  type="button"
                  onClick={downloadCard}
                  title="Download a shareable 1200x630 score card"
                  className="rounded-[10px] border border-border bg-white px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-cream"
                >
                  Score card
                </button>
                <button
                  type="button"
                  onClick={downloadReport}
                  className="rounded-[10px] bg-ink px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover"
                >
                  Download .md
                </button>
              </div>
            </div>

            {report.issues.length === 0 ? (
              <div className="mt-4 rounded-[20px] border border-emerald-200 bg-emerald-50 p-6 text-center">
                <div className="text-lg font-medium text-emerald-700">
                  Clean schema. Nothing to flag.
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
                    className="rounded-[20px] border border-border bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-[20px] px-2.5 py-0.5 text-xs font-medium ring-1 ${severityStyle[issue.severity]}`}
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

            <div className="mt-4 rounded-[20px] border border-accent/30 bg-accent-soft p-5">
              <span className="text-sm text-accent">
                Want to see these tables visually?{" "}
              </span>
              <a
                href="/visualize"
                className="text-sm font-medium text-accent hover:text-accent-hover"
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
