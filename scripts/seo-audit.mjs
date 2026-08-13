#!/usr/bin/env node
/**
 * A1 — SEO health audit.
 *
 * Crawls the production sitemap, fetches every URL and asserts the rules
 * we enforced during the Ahrefs cleanup:
 *   - no 3xx redirect (final URL == request URL)
 *   - canonical host   == configured canonical host (www default)
 *   - title length     <= 60
 *   - meta description <= 151
 *   - exactly one H1
 *   - >= 2 internal dofollow links
 *   - JSON-LD present
 * Plus site-level reachability of /robots.txt and /llms.txt.
 *
 * Writes a report to <SEO_AUDIT_OUT>/<YYYY-MM-DD>.md and exits non-zero
 * when any check fails.
 *
 * Usage:
 *   node scripts/seo-audit.mjs
 *   SITE_URL=https://www.dbdiagramr.space FORCE_ALL=1 node scripts/seo-audit.mjs
 */

import { writeFile, mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SITE_URL = process.env.SITE_URL || "https://www.dbdiagramr.space";
const CANONICAL_HOST = process.env.CANONICAL_HOST || "www.dbdiagramr.space";
const FORCE_ALL = process.env.FORCE_ALL === "1";

const DEFAULT_OUT = process.env.SEO_AUDIT_OUT
  || (process.env.VAULT
    ? path.resolve(process.env.VAULT, "Content/Inbox/seo-audit")
    : path.resolve(process.env.HOME || "/", "Odyssey/Content/Inbox/seo-audit"));
const OUT_DIR = DEFAULT_OUT;

const TITLE_MAX = 60;
const DESC_MAX = 151;
const MIN_INTERNAL_LINKS = 2;

const CHECKS = [
  "no-3xx",
  "canonical",
  "title",
  "description",
  "h1",
  "internal-links",
  "json-ld",
];

function strip(normalize) {
  return (u) => {
    let s = normalize ? u.replace(/\/+$/, "") : u;
    try {
      const p = new URL(s, SITE_URL);
      return p.href;
    } catch {
      return s;
    }
  };
}
const normUrl = strip(true);

const esc = (s) => String(s ?? "").replace(/_/g, "\\_");

async function fetchText(url, init) {
  const res = await fetch(url, {
    redirect: "follow",
    ...init,
  });
  return { res, text: await res.text() };
}

function parseSitemap(xml, base) {
  const locs = [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
  return [...new Set(locs)].map((x) => (x.startsWith("http") ? x : new URL(x, base).href));
}

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "";
}

function extractCanonical(html) {
  const m = html.match(/<link\b[^>]*rel=["']canonical["'][^>]*>/i);
  if (!m) return "";
  return m[0].match(/href\s*=\s*["']([^"']+)["']/i)?.[1] ?? "";
}

function extractDescription(html) {
  const m = html.match(/<meta\b[^>]*name=["']description["'][^>]*>/i);
  if (!m) return "";
  return m[0].match(/content\s*=\s*["']([^"']*)["']/i)?.[1] ?? "";
}

function countLinks(html) {
  const hrefs = [...html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
  let internal = 0,
    external = 0;
  for (const h of hrefs) {
    const clean = h.replace(/^\/\//, "https://");
    if (clean.startsWith("/") || clean.includes(CANONICAL_HOST)) internal++;
    else if (clean.startsWith("http")) external++;
  }
  return { internal, external, total: hrefs.length };
}

async function auditPage(url, isForceAll) {
  const issues = [];
  const notes = [];
  let ok = true;

  let res;
  try {
    const { res: r, text } = await fetchText(url);
    res = r;
    const redirected = normUrl(res.url) !== normUrl(url);
    if (redirected || !res.ok) {
      ok = false;
      issues.push(`no-3xx: got ${res.status}${redirected ? " (redirected)" : ""}`);
    } else if (isForceAll || CHECKS.includes("canonical")) {
      const canon = extractCanonical(text);
      const canonHost = canon ? new URL(canon, SITE_URL).host : "";
      if (canonHost !== CANONICAL_HOST) {
        ok = false;
        issues.push(`canonical: host ${canonHost || "(none)"} != ${CANONICAL_HOST}`);
      } else {
        notes.push(`canonical ${canonHost}`);
      }
    }

    if (res.ok) {
      const title = extractTitle(text);
      if (!title) {
        ok = false;
        issues.push("title: missing");
      } else if (title.length > TITLE_MAX) {
        ok = false;
        issues.push(`title: ${title.length} chars > ${TITLE_MAX}`);
      } else {
        notes.push(`title ${title.length}`);
      }

      const desc = extractDescription(text);
      if (!desc) {
        ok = false;
        issues.push("description: missing");
      } else if (desc.length > DESC_MAX) {
        ok = false;
        issues.push(`description: ${desc.length} chars > ${DESC_MAX}`);
      } else {
        notes.push(`desc ${desc.length}`);
      }

      const h1Count = (text.match(/<h1[\s>]/gi) || []).length;
      if (h1Count !== 1) {
        ok = false;
        issues.push(`h1: ${h1Count} (want exactly 1)`);
      } else {
        notes.push("h1 ok");
      }

      const links = countLinks(text);
      if (links.internal < MIN_INTERNAL_LINKS) {
        ok = false;
        issues.push(`internal-links: ${links.internal} < ${MIN_INTERNAL_LINKS}`);
      } else {
        notes.push(`links ${links.internal}i/${links.external}e`);
      }

      const hasJsonLd = /application\/ld\+json/.test(text);
      if (!hasJsonLd) {
        ok = false;
        issues.push("json-ld: missing");
      } else {
        notes.push("json-ld ok");
      }
    }
  } catch (err) {
    ok = false;
    issues.push(`fetch: ${err.message}`);
  }

  return { url, ok, issues, notes, status: res?.status ?? "ERR" };
}

function mdEscape(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function main() {
  const started = Date.now();
  console.log(`A1 seo-audit  site=${SITE_URL}  out=${OUT_DIR}`);
  try {
    const sitemapUrl = new URL("/sitemap.xml", SITE_URL).href;
    let { res, text } = await fetchText(sitemapUrl);
    if (!res.ok) {
      console.error(`Cannot fetch sitemap ${sitemapUrl}: HTTP ${res.status}`);
      process.exit(2);
    }
    const urls = parseSitemap(text, SITE_URL);
    console.log(`found ${urls.length} URLs in sitemap`);

    const useAll = FORCE_ALL || CHECKS.length === 0;
    const results = [];
    for (const u of urls) {
      results.push(await auditPage(u, useAll));
      if ((results.length % 10) === 0) console.log(`  ...${results.length}/${urls.length}`);
    }

    const pass = results.filter((r) => r.ok);
    const fail = results.filter((r) => !r.ok);

    const siteChecks = [];
    for (const f of ["robots.txt", "llms.txt"]) {
      try {
        const r = await fetch(new URL(f, SITE_URL).href, { redirect: "follow" });
        siteChecks.push({ file: f, ok: r.ok, status: r.status });
      } catch (e) {
        siteChecks.push({ file: f, ok: false, status: e.message });
      }
    }

    const today = new Date().toISOString().slice(0, 10);
    const stamp = `${today} ${new Date().toTimeString().slice(0, 5)}`;
    const lines = [];
    lines.push(`# SEO audit — ${stamp}`);
    lines.push("");
    lines.push(`Site: \`${SITE_URL}\` · ${urls.length} sitemap URLs · **${pass.length} pass / ${fail.length} fail** · ${Date.now() - started}ms`);
    lines.push("");
    lines.push("| Check | Rule |");
    lines.push("|---|---|");
    lines.push(`| no-3xx | final URL == request URL |`);
    lines.push(`| canonical | host == \`${CANONICAL_HOST}\` |`);
    lines.push(`| title | ≤ ${TITLE_MAX} chars |`);
    lines.push(`| description | ≤ ${DESC_MAX} chars |`);
    lines.push(`| h1 | exactly 1 |`);
    lines.push(`| internal-links | ≥ ${MIN_INTERNAL_LINKS} |`);
    lines.push(`| json-ld | present |`);
    lines.push("");
    for (const sc of siteChecks) {
      lines.push(`- \`/${sc.file}\` … ${sc.ok ? "OK" : "FAIL"} (${sc.status})`);
    }
    lines.push("");
    lines.push(`## Failures`);
    if (fail.length === 0) {
      lines.push("- none 🎉");
    } else {
      for (const r of fail) {
        lines.push(`- [${mdEscape(r.url)}](${esc(r.url)}) — ${r.issues.join("; ")}`);
      }
    }
    lines.push("");
    lines.push(`## All URLs`);
    for (const r of [...results].sort((a, b) => a.url.localeCompare(b.url))) {
      const mark = r.ok ? "✅" : "❌";
      lines.push(`- ${mark} ${mdEscape(r.url)} — ${r.ok ? r.notes.join(", ") : r.issues.join("; ")}`);
    }
    lines.push("");

    await mkdir(OUT_DIR, { recursive: true });
    const outFile = path.join(OUT_DIR, `${today}.md`);
    await writeFile(outFile, lines.join("\n"), "utf8");
    console.log(`report: ${outFile}`);
    console.log(`RESULT: ${pass.length}/${urls.length} pages pass`);

    const hardFail = fail.length > 0 || siteChecks.some((s) => !s.ok);
    process.exit(hardFail ? 1 : 0);
  } catch (err) {
    console.error("seo-audit error:", err);
    process.exit(2);
  }
}

main();