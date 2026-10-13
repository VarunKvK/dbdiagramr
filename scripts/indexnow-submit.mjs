#!/usr/bin/env node
// Submit URLs to search engines via IndexNow (Bing, Yandex, ...).
// Usage: npm run indexnow -- <url1> <url2> ...
// The key file public/<KEY>.txt must be deployed (it is — proof of ownership).
// Docs: https://www.indexnow.org/documentation

const HOST = "www.dbdiagramr.space";
const KEY = "d7bf744e54a34845aac63c9d8a51474f";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

const STATUS_MEANING = {
  200: "OK — URLs submitted successfully",
  400: "Bad request — invalid format",
  403: "Forbidden — key not valid (key file missing or mismatch; redeploy?)",
  422: "Unprocessable — URLs don't belong to the host",
  429: "Too many requests — back off, potential spam flag",
};

async function main() {
  const urls = process.argv.slice(2).filter((a) => !a.startsWith("-"));
  if (urls.length === 0) {
    console.error("Usage: npm run indexnow -- <url1> <url2> ...");
    process.exit(2);
  }
  const bad = urls.filter((u) => {
    try {
      const parsed = new URL(u);
      return parsed.host !== HOST;
    } catch {
      return true;
    }
  });
  if (bad.length > 0) {
    console.error(`Refusing — not on ${HOST}: ${bad.join(", ")}`);
    process.exit(2);
  }

  const body = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });

  let res;
  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body,
    });
  } catch (err) {
    console.error(`Network error submitting to ${ENDPOINT}: ${err.message}`);
    process.exit(1);
  }

  console.log(`IndexNow → ${res.status}: ${STATUS_MEANING[res.status] ?? (await res.text()).slice(0, 200)}`);
  if (res.status !== 200) process.exit(1);
  console.log(`Submitted ${urls.length} URL(s):`);
  for (const u of urls) console.log(`  ${u}`);
}

main();
