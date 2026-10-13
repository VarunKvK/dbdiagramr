import { chromium } from "playwright";
import { readFileSync, writeFileSync, mkdirSync, statSync } from "fs";
import { join } from "path";

const WIDTH = 1200;
const HEIGHT = 630;
const OUTPUT_DIR = join(process.cwd(), "public", "og", "blog");
const BG_PATH = join(process.cwd(), "public", "base-OG.png");

function buildHtml(title, bgBase64) {
  const fontSize = title.length > 50 ? 44 : 52;

  return `<!DOCTYPE html>
<html>
<head>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${WIDTH}px; height: ${HEIGHT}px; overflow: hidden; }
  .container {
    width: ${WIDTH}px; height: ${HEIGHT}px;
    background: url(data:image/png;base64,${bgBase64}) center/cover no-repeat;
    position: relative;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    font-family: 'Noto Sans', sans-serif;
  }
  .title-row {
    display: flex; align-items: center; gap: 14px;
    margin-bottom: 20px;
  }
  .accent {
    width: 22px; height: 22px;
    background: #3b82f6; border-radius: 4px;
    flex-shrink: 0;
  }
  .title {
    font-size: ${fontSize}px; font-weight: 700;
    color: #ffffff; text-align: center;
    max-width: 900px; line-height: 1.2;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }
  .subtitle {
    font-size: 20px; color: #94a3b8;
    letter-spacing: 1.5px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  }
</style>
</head>
<body>
<div class="container">
  <div class="title-row">
    <div class="accent"></div>
    <div class="title">${title}</div>
    <div class="accent"></div>
  </div>
  <div class="subtitle">dbdiagramr.space</div>
</div>
</body>
</html>`;
}

async function generateOgImage(slug, title) {
  const bgBuffer = readFileSync(BG_PATH);
  const bgBase64 = bgBuffer.toString("base64");
  const html = buildHtml(title, bgBase64);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  const outPath = join(OUTPUT_DIR, `${slug}.png`);
  await page.screenshot({ path: outPath, type: "png" });
  await browser.close();

  const size = statSync(outPath).size;
  console.log(`  Generated: ${outPath} (${(size / 1024).toFixed(0)}K)`);
}

// --- Main ---
const postsFile = readFileSync(join(process.cwd(), "data/blog/posts.ts"), "utf8");
const slugMatches = [...postsFile.matchAll(/slug:\s*"([^"]+)"/g)];
const titleMatches = [...postsFile.matchAll(/title:\s*"([^"]+)"/g)];
const posts = slugMatches.map((m, i) => ({
  slug: m[1],
  title: titleMatches[i]?.[1] ?? m[1],
}));

mkdirSync(OUTPUT_DIR, { recursive: true });

for (const post of posts) {
  await generateOgImage(post.slug, post.title);
}
console.log(`Done. Generated ${posts.length} images.`);
