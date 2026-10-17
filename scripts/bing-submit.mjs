#!/usr/bin/env node
// Submit URLs directly to Bing via Webmaster Tools URL Submission API (JSON protocol only;
// SOAP/POX were retired 2026-08-31). Complements indexnow-submit.mjs — IndexNow pings all
// participating engines, this one is Bing-only with a 10,000/day quota.
// Usage: BING_API_KEY=<key> npm run bing -- <url1> <url2> ...
// Key: Bing Webmaster Tools > Settings > API Access > Generate API Key (site must be verified).

const SITE_URL = process.env.BING_SITE_URL ?? "https://www.dbdiagramr.space";
const API = "https://ssl.bing.com/webmaster/api.svc/json";

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

async function post(method, payload) {
  const key = process.env.BING_API_KEY;
  const res = await fetch(`${API}/${method}?apikey=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify(payload),
  });
  const text = await res.text();
  if (!res.ok) {
    let detail = text.slice(0, 300);
    try {
      const parsed = JSON.parse(text);
      detail = parsed.Message ?? parsed.ErrorCode ?? detail;
    } catch {}
    return { ok: false, status: res.status, detail };
  }
  return { ok: true, status: res.status };
}

async function main() {
  if (!process.env.BING_API_KEY) {
    fail("BING_API_KEY not set. Generate it in Bing Webmaster Tools > Settings > API Access.");
  }
  const urls = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (urls.length === 0) {
    fail("Usage: BING_API_KEY=<key> npm run bing -- <url1> <url2> ...");
  }
  const bad = urls.filter((u) => {
    try {
      return new URL(u).host !== "www.dbdiagramr.space";
    } catch {
      return true;
    }
  });
  if (bad.length > 0) fail(`Refusing — not on www.dbdiagramr.space: ${bad.join(", ")}`);
  if (urls.length > 500) fail(`Batch limit is 500 per call, got ${urls.length}`);

  // Read remaining quota first (response wrapped in a "d" envelope).
  const quotaRes = await fetch(
    `${API}/GetUrlSubmissionQuota?siteUrl=${encodeURIComponent(SITE_URL)}&apikey=${encodeURIComponent(process.env.BING_API_KEY)}`
  );
  const quotaText = await quotaRes.text();
  if (!quotaRes.ok) {
    fail(
      `Quota check failed (${quotaRes.status}): ${quotaText.slice(0, 300)} — ` +
        `if this is 401/403, siteUrl may not match your verified property (currently "${SITE_URL}"); override with BING_SITE_URL.`
    );
  }
  let daily = null;
  try {
    daily = JSON.parse(quotaText)?.d?.DailyQuota ?? null;
  } catch {}
  let batch = urls;
  if (daily !== null) {
    console.log(`Remaining daily quota: ${daily}`);
    if (daily <= 0) fail("Daily quota exhausted — retry after 00:00 UTC.");
    if (daily < urls.length) {
      batch = urls.slice(0, daily);
      console.log(`Trimming to quota: submitting ${batch.length}, ${urls.length - batch.length} deferred to next run.`);
    }
  }

  const r = await post("SubmitUrlBatch", { siteUrl: SITE_URL, urlList: batch });
  // Success body is {"d": null} — an empty payload means submitted, not failed.
  if (!r.ok) fail(`SubmitUrlBatch failed (${r.status}): ${r.detail}`);
  console.log(`Submitted ${batch.length} URL(s) to Bing (${SITE_URL}).`);
  for (const u of batch) console.log(`  ${u}`);
}

main();
