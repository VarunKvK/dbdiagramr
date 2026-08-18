#!/usr/bin/env node
/**
 * A5 — Structured data (JSON-LD) validation.
 *
 * Crawls the production sitemap, extracts every static
 * `<script type="application/ld+json">` block and validates it:
 *   - JSON parses
 *   - per-type required fields present (Article, FAQPage, BreadcrumbList,
 *     CollectionPage, ItemList, WebSite, Organization, SoftwareApplication,
 *     HowTo, ...)
 *   - referenced URLs live on the configured canonical host
 *   - every page emits at least one static JSON-LD block
 *
 * Also flags a page when it has NO static ld+json at all (e.g. structured
 * data only living in a JS runtime payload is invisible to Google).
 *
 * Optionally cross-checks each page with validator.schema.org when
 * SCHEMAORG_CROSSCHECK=1 (default on; set to 0 to skip).
 *
 * Writes a report to <JSONLD_OUT>/<YYYY-MM-DD>.md and exits non-zero when
 * any page fails.
 *
 * Usage:
 *   node scripts/validate-jsonld.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = process.env.SITE_URL || "https://www.dbdiagramr.space";
const CANONICAL_HOST = process.env.CANONICAL_HOST || "www.dbdiagramr.space";
const DO_CROSSCHECK = process.env.SCHEMAORG_CROSSCHECK !== "0";

const DEFAULT_OUT = process.env.JSONLD_OUT
  || (process.env.VAULT
    ? path.resolve(process.env.VAULT, "Content/Inbox/seo-jsonld")
    : path.resolve(process.env.HOME || "/", "Odyssey/Content/Inbox/seo-jsonld"));
const OUT_DIR = DEFAULT_OUT;

const SCHEMAORG_API = "https://validator.schema.org/validate";

// Required fields per @type. Values are keys that must be present; nested
// shapes validated via helper functions below.
const REQUIRED = {
  Article: ["headline", "datePublished", "author", "publisher"],
  FAQPage: ["mainEntity"],
  BreadcrumbList: ["itemListElement"],
  CollectionPage: [],
  ItemList: ["itemListElement"],
  WebSite: ["name", "url"],
  Organization: ["name", "url", "logo"],
  SoftwareApplication: ["name", "applicationCategory", "operatingSystem"],
  HowTo: ["name", "step"],
  ImageObject: ["url"],
  Offer: ["price", "priceCurrency"],
  Question: ["name", "acceptedAnswer"],
  Answer: ["text"],
  HowToStep: ["name"],
  ListItem: ["position", "name", "item"],
  Person: ["name"],
};

function esc(s) {
  return String(s ?? "").replace(/_/g, "\\_");
}

async function fetchText(url, init) {
  const res = await fetch(url, { redirect: "follow", ...init });
  return { res, text: await res.text() };
}

function parseSitemap(xml, base) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  return [...new Set(locs)].map((x) => (x.startsWith("http") ? x : new URL(x, base).href));
}

// Extract <script type="application/ld+json">…</script> blocks as raw text.
function extractJsonLdBlocks(html) {
  const blocks = [];
  const re = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) blocks.push(m[1].trim());
  return blocks;
}

function parseBlock(raw) {
  try {
    return { ok: true, obj: JSON.parse(raw) };
  } catch (e) {
    return { ok: false, error: `JSON parse error: ${e.message}` };
  }
}

// Walk a node tree and run a checker fn over every object with @type.
function walk(node, fn, depth = 0) {
  if (Array.isArray(node)) {
    for (const v of node) walk(v, fn, depth);
  } else if (node && typeof node === "object") {
    fn(node, depth);
    for (const v of Object.values(node)) walk(v, fn, depth + 1);
  }
}

function nodeType(n) {
  const t = n["@type"];
  return Array.isArray(t) ? t[0] : t;
}

function validateNode(n, issues) {
  const type = nodeType(n);
  if (!type || !REQUIRED[type]) return;
  const missing = REQUIRED[type].filter((k) => n[k] === undefined || n[k] === null);
  if (missing.length) {
    issues.push(`${type}: missing ${missing.join(", ")}`);
    return;
  }
  // Nested shape checks.
  if (type === "FAQPage") {
    const main = n.mainEntity;
    if (!Array.isArray(main) || main.length === 0) {
      issues.push("FAQPage: mainEntity must be a non-empty array");
    } else {
      const bad = main.filter(
        (q) => nodeType(q) !== "Question" || !q.name || !q.acceptedAnswer
      );
      if (bad.length) issues.push("FAQPage: mainEntity items must be Question with name + acceptedAnswer");
    }
  }
  if (type === "BreadcrumbList") {
    const els = n.itemListElement;
    if (!Array.isArray(els) || els.length === 0) {
      issues.push("BreadcrumbList: itemListElement must be a non-empty array");
    } else {
      const positions = els.map((e) => e.position);
      const uniq = new Set(positions).size === positions.length;
      if (!uniq) issues.push("BreadcrumbList: positions must be unique");
    }
  }
  if (type === "Article") {
    const a = n.author;
    if (typeof a === "object" && a && !a.name) issues.push("Article: author needs a name");
    const p = n.publisher;
    if (typeof p === "object" && p && !p.name) issues.push("Article: publisher needs a name");
    if (!n.description) issues.push("Article: missing description");
  }
  if (type === "HowTo") {
    const steps = n.step;
    if (!Array.isArray(steps) || steps.length === 0) {
      issues.push("HowTo: step must be a non-empty array");
    } else {
      const bad = steps.filter((s) => !s.name);
      if (bad.length) issues.push("HowTo: every step needs a name");
    }
  }
  if (type === "ListItem" && typeof n.item !== "string") {
    issues.push("ListItem: item must be a URL string");
  }
}

async function validatePage(url) {
  const issues = [];
  const notes = [];
  let status = "ERR";

  let text = "";
  try {
    const { res, text: t } = await fetchText(url);
    status = String(res.status);
    text = t;
    if (!res.ok) {
      issues.push(`fetch: HTTP ${res.status}`);
      return { url, ok: false, issues, notes, status };
    }
  } catch (e) {
    issues.push(`fetch: ${e.message}`);
    return { url, ok: false, issues, notes, status };
  }

  const blocks = extractJsonLdBlocks(text);
  if (blocks.length === 0) {
    issues.push("no static application/ld+json block (structured data in JS payload is invisible to Google)");
    return { url, ok: false, issues, notes, status };
  }
  notes.push(`${blocks.length} block(s)`);

  const seenTypes = new Set();
  for (const raw of blocks) {
    const parsed = parseBlock(raw);
    if (!parsed.ok) {
      issues.push(parsed.error);
      continue;
    }
    walk(parsed.obj, (n) => {
      const type = nodeType(n);
      if (type) seenTypes.add(type);
      validateNode(n, issues);
      // URL host check — only for fields that must resolve to this site
      // (breadcrumb items, mainEntityOfPage). Author/sameAs URLs are
      // legitimately external.
      for (const [k, v] of Object.entries(n)) {
        if (typeof v !== "string" || !v.startsWith("https://")) continue;
        if (k === "item" || k === "mainEntityOfPage") {
          try {
            const host = new URL(v).host;
            if (!host.endsWith(CANONICAL_HOST)) {
              issues.push(`${type || "?"}.${k}: host ${host} != ${CANONICAL_HOST}`);
            }
          } catch {
            issues.push(`${type || "?"}.${k}: invalid URL ${v}`);
          }
        }
      }
    });
  }
  notes.push([...seenTypes].join(","));

  return { url, ok: issues.length === 0, issues, notes, status };
}

async function schemaOrgCheck(url) {
  try {
    const res = await fetch(SCHEMAORG_API, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(25000),
    });
    const data = await res.json().catch(() => ({}));
    const errs = data?.errors || [];
    const warnings = data?.warnings || [];
    return { ok: errs.length === 0, errors: errs, warnings };
  } catch (e) {
    return { ok: null, errors: [`cross-check failed: ${e.message}`], warnings: [] };
  }
}

function mdEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const started = Date.now();
  console.log(`A5 validate-jsonld  site=${SITE_URL}  out=${OUT_DIR}`);
  try {
    const sitemapUrl = new URL("/sitemap.xml", SITE_URL).href;
    let { res, text } = await fetchText(sitemapUrl);
    if (!res.ok) {
      console.error(`Cannot fetch sitemap ${sitemapUrl}: HTTP ${res.status}`);
      process.exit(2);
    }
    const urls = parseSitemap(text, SITE_URL);
    console.log(`found ${urls.length} URLs in sitemap`);

    const results = [];
    for (const u of urls) {
      results.push(await validatePage(u));
    }

    if (DO_CROSSCHECK) {
      console.log("cross-checking with validator.schema.org…");
      for (let i = 0; i < results.length; i++) {
        const cc = await schemaOrgCheck(results[i].url);
        if (cc.ok === false) {
          results[i].ok = false;
          results[i].issues.push(`schema.org: ${cc.errors.join("; ")}`);
        }
        results[i].crossCheck = cc.ok === null ? "skipped/error" : cc.ok ? "ok" : "errors";
      }
    }

    const pass = results.filter((r) => r.ok);
    const fail = results.filter((r) => !r.ok);

    const today = new Date().toISOString().slice(0, 10);
    const stamp = `${today} ${new Date().toTimeString().slice(0, 5)}`;
    const lines = [];
    lines.push(`# Structured data validation — ${stamp}`);
    lines.push("");
    lines.push(`Site: \`${SITE_URL}\` · ${urls.length} sitemap URLs · **${pass.length} pass / ${fail.length} fail** · ${Date.now() - started}ms`);
    lines.push("");
    lines.push("Checks per page: static JSON-LD present · JSON parses · per-type required fields · URLs on canonical host · (optional validator.schema.org cross-check)");
    lines.push("");
    lines.push("## Failures");
    if (fail.length === 0) {
      lines.push("- none 🎉");
    } else {
      for (const r of fail) {
        lines.push(`- [${mdEscape(r.url)}](${esc(r.url)}) — ${r.issues.join("; ")}`);
      }
    }
    lines.push("");
    lines.push("## All URLs");
    for (const r of [...results].sort((a, b) => a.url.localeCompare(b.url))) {
      const mark = r.ok ? "✅" : "❌";
      const extra = r.crossCheck ? ` · schema.org: ${r.crossCheck}` : "";
      lines.push(`- ${mark} ${mdEscape(r.url)} — ${r.ok ? r.notes.join(", ") : r.issues.join("; ")}${extra}`);
    }
    lines.push("");

    await mkdir(OUT_DIR, { recursive: true });
    const outFile = path.join(OUT_DIR, `${today}.md`);
    await writeFile(outFile, lines.join("\n"), "utf8");
    console.log(`report: ${outFile}`);
    console.log(`RESULT: ${pass.length}/${urls.length} pages pass`);

    process.exit(fail.length > 0 ? 1 : 0);
  } catch (err) {
    console.error("validate-jsonld error:", err);
    process.exit(2);
  }
}

main();
