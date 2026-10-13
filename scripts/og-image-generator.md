# OG Image Generator for Blog Posts

Generate social media preview images (OG images) for your blog posts. Renders an HTML template to a 1200x630 PNG using a headless browser.

## Quick Start

1. Save the script below as `generate-og.mjs`
2. Install Playwright:
   ```bash
   npm install playwright
   npx playwright install chromium
   ```
3. Run:
   ```bash
   node generate-og.mjs
   ```
4. Follow the prompts

## Requirements

- **Node.js 18+**
- **Playwright** (for HTML to PNG rendering)

## What It Does

The script prompts you for:

1. **Title** -- displayed as large white text
2. **Slug** -- used as the output filename (`{slug}.png`)
3. **Subtitle** -- text below the title (your site name, tagline, etc.)
4. **Background image** -- optional. Leave empty for a default dark template
5. **Output directory** -- where to save the PNG (defaults to `public/og/blog`)

After each image, it asks if you want to generate another so you can batch multiple posts without re-running.

## Script

Copy everything below this line into `generate-og.mjs`:

````javascript
#!/usr/bin/env node

/**
 * OG Image Generator for Blog Posts
 *
 * Generates social media preview images (OG images) by rendering an HTML
 * template to a 1200x630 PNG using a headless browser (Playwright).
 *
 * Usage:
 *   node generate-og.mjs
 *
 * Requirements:
 *   - Node.js 18+
 *   - Playwright: npm install playwright && npx playwright install chromium
 *
 * The script will prompt you for:
 *   1. Blog post title (displayed as large white text)
 *   2. Slug (used as the output filename)
 *   3. Subtitle (e.g., your site name)
 *   4. Background image path (optional -- a default dark template is used if empty)
 *   5. Output directory (defaults to public/og/blog)
 *
 * After each image, it asks if you want to generate another.
 */

import { chromium } from "playwright";
import { readFileSync, statSync, mkdirSync, existsSync } from "fs";
import { createInterface } from "readline";
import { join, resolve } from "path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Default image dimensions (standard OG size). */
const DEFAULT_WIDTH = 1200;
const DEFAULT_HEIGHT = 630;

/** Default output directory (relative to cwd). */
const DEFAULT_OUTPUT_DIR = "public/og/blog";

/** Accent color for the squares flanking the title. */
const ACCENT_COLOR = "#3b82f6";

/** Title text color. */
const TITLE_COLOR = "#ffffff";

/** Subtitle text color. */
const SUBTITLE_COLOR = "#94a3b8";

// ---------------------------------------------------------------------------
// Prompt helper -- wraps readline in a promise
// ---------------------------------------------------------------------------

/**
 * Ask a question and return the user's answer.
 * @param {string} question - The prompt to display.
 * @param {string} [defaultValue] - Optional default if user presses Enter.
 * @returns {Promise<string>} The user's input (or default).
 */
function prompt(question, defaultValue = "") {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const suffix = defaultValue ? ` (${defaultValue})` : "";
  const display = question.endsWith("?") ? `${question} ` : `${question}? `;

  return new Promise((resolve) => {
    rl.question(`${display}${suffix}: `, (answer) => {
      rl.close();
      const value = answer.trim() || defaultValue;
      resolve(value);
    });
  });
}

// ---------------------------------------------------------------------------
// HTML template builder
// ---------------------------------------------------------------------------

/**
 * Build the HTML string that Playwright will render to PNG.
 *
 * If bgBase64 is provided, it's used as the background image.
 * Otherwise, a default dark gradient with a subtle dot pattern is rendered.
 *
 * @param {string} title - The blog post title.
 * @param {string} subtitle - Text below the title (e.g., site name).
 * @param {string|null} bgBase64 - Base64-encoded background image, or null for default.
 * @param {number} width - Image width in pixels.
 * @param {number} height - Image height in pixels.
 * @returns {string} Complete HTML document.
 */
function buildHtml(title, subtitle, bgBase64, width, height) {
  // Shrink font for longer titles so they don't overflow
  const fontSize = title.length > 50 ? 44 : 52;

  // Background CSS: use image if provided, otherwise default template
  const backgroundCss = bgBase64
    ? `url(data:image/png;base64,${bgBase64}) center/cover no-repeat`
    : `linear-gradient(180deg, #0f1117 0%, #1a1d27 100%)`;

  // Subtle dot pattern overlay (only used for default template)
  const dotOverlay = bgBase64
    ? ""
    : `background-image: radial-gradient(circle, #ffffff08 1px, transparent 1px);
       background-size: 24px 24px;`;

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: ${width}px; height: ${height}px; overflow: hidden; }

  .container {
    width: ${width}px;
    height: ${height}px;
    background: ${backgroundCss};
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: 'Noto Sans', sans-serif;
  }

  .dot-pattern {
    position: absolute;
    inset: 0;
    ${dotOverlay}
    pointer-events: none;
  }

  .vignette {
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.4) 100%);
    pointer-events: none;
  }

  .content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .title-row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 20px;
  }

  .accent {
    width: 22px;
    height: 22px;
    background: ${ACCENT_COLOR};
    border-radius: 4px;
    flex-shrink: 0;
  }

  .title {
    font-size: ${fontSize}px;
    font-weight: 700;
    color: ${TITLE_COLOR};
    text-align: center;
    max-width: 900px;
    line-height: 1.2;
    letter-spacing: -0.5px;
    text-shadow: 0 2px 8px rgba(0,0,0,0.6);
  }

  .subtitle {
    font-size: 20px;
    color: ${SUBTITLE_COLOR};
    letter-spacing: 1.5px;
    text-shadow: 0 1px 4px rgba(0,0,0,0.8);
  }
</style>
</head>
<body>
<div class="container">
  <div class="dot-pattern"></div>
  <div class="vignette"></div>
  <div class="content">
    <div class="title-row">
      <div class="accent"></div>
      <div class="title">${escapeHtml(title)}</div>
      <div class="accent"></div>
    </div>
    <div class="subtitle">${escapeHtml(subtitle)}</div>
  </div>
</div>
</body>
</html>`;
}

/**
 * Escape HTML special characters to prevent XSS in the title/subtitle.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ---------------------------------------------------------------------------
// Image generator
// ---------------------------------------------------------------------------

/**
 * Generate a single OG image.
 *
 * @param {Object} options
 * @param {string} options.slug - URL-friendly filename (no extension).
 * @param {string} options.title - Blog post title.
 * @param {string} options.subtitle - Subtitle text.
 * @param {string|null} options.bgPath - Path to background image, or null for default.
 * @param {string} options.outputDir - Directory to save the PNG.
 * @param {number} options.width - Image width.
 * @param {number} options.height - Image height.
 * @returns {Promise<string>} Path to the generated file.
 */
async function generateOgImage({ slug, title, subtitle, bgPath, outputDir, width, height }) {
  // Load background image if provided
  let bgBase64 = null;
  if (bgPath) {
    const resolved = resolve(bgPath);
    if (!existsSync(resolved)) {
      throw new Error(`Background image not found: ${resolved}`);
    }
    bgBase64 = readFileSync(resolved).toString("base64");
  }

  // Build HTML and render to PNG via Playwright
  const html = buildHtml(title, subtitle, bgBase64, width, height);

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(html, { waitUntil: "networkidle" });
  await page.waitForTimeout(800); // Wait for Google Fonts to load

  // Ensure output directory exists
  mkdirSync(outputDir, { recursive: true });

  const outPath = join(outputDir, `${slug}.png`);
  await page.screenshot({ path: outPath, type: "png" });
  await browser.close();

  const size = statSync(outPath).size;
  const sizeStr = size > 1024 * 1024
    ? `${(size / 1024 / 1024).toFixed(1)}M`
    : `${(size / 1024).toFixed(0)}K`;

  return outPath;
}

// ---------------------------------------------------------------------------
// Input validation
// ---------------------------------------------------------------------------

/**
 * Validate the slug string: lowercase, hyphens, no spaces or special chars.
 * @param {string} slug
 * @returns {{ valid: boolean, clean: string, error?: string }}
 */
function validateSlug(slug) {
  const clean = slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!clean) {
    return { valid: false, clean: "", error: "Slug must contain at least one alphanumeric character." };
  }
  return { valid: true, clean };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log("\n  OG Image Generator");
  console.log("  ─────────────────────────────────────────\n");

  let totalCount = 0;
  let running = true;

  while (running) {
    // --- Collect inputs ---
    const title = await prompt("  Blog post title");
    if (!title) {
      console.log("  ✗ Title cannot be empty.\n");
      continue;
    }

    const rawSlug = await prompt("  Slug (URL-friendly)");
    if (!rawSlug) {
      console.log("  ✗ Slug cannot be empty.\n");
      continue;
    }
    const slugResult = validateSlug(rawSlug);
    if (!slugResult.valid) {
      console.log(`  ✗ ${slugResult.error}\n`);
      continue;
    }

    const subtitle = await prompt("  Subtitle (e.g., yoursite.com)");
    if (!subtitle) {
      console.log("  ✗ Subtitle cannot be empty.\n");
      continue;
    }

    const bgInput = await prompt("  Background image path (leave empty for default)");
    const bgPath = bgInput || null;

    if (bgPath && !existsSync(resolve(bgPath))) {
      console.log(`  ⚠ File not found: ${bgPath}`);
      const retry = await prompt("  Try a different path? (leave empty for default)", "");
      if (retry && existsSync(resolve(retry))) {
        // Use the retry path
      } else if (retry && !existsSync(resolve(retry))) {
        console.log(`  ✗ File not found: ${retry}. Using default template.\n`);
      }
      // If empty, bgPath stays null (default template)
    }

    const outputDir = await prompt("  Output directory", DEFAULT_OUTPUT_DIR);

    // --- Generate ---
    console.log("");
    try {
      const outPath = await generateOgImage({
        slug: slugResult.clean,
        title,
        subtitle,
        bgPath: bgPath && existsSync(resolve(bgPath)) ? bgPath : null,
        outputDir,
        width: DEFAULT_WIDTH,
        height: DEFAULT_HEIGHT,
      });
      console.log(`  ✓ Generated: ${outPath}\n`);
      totalCount++;
    } catch (err) {
      console.log(`  ✗ Error: ${err.message}\n`);
    }

    // --- Repeat? ---
    const again = await prompt("  Generate another? (y/n)", "y");
    if (again.toLowerCase() !== "y" && again.toLowerCase() !== "yes") {
      running = false;
    }
    console.log("");
  }

  console.log(`  Done. ${totalCount} image${totalCount !== 1 ? "s" : ""} generated.\n`);
}

main().catch((err) => {
  console.error("Fatal error:", err.message);
  process.exit(1);
});
````

## Customization

### Colors

Edit the constants at the top of the script:

```javascript
const ACCENT_COLOR = "#3b82f6";   // Blue squares next to title
const TITLE_COLOR = "#ffffff";    // Title text color
const SUBTITLE_COLOR = "#94a3b8"; // Subtitle text color
```

### Default template

The default dark template uses a gradient + dot pattern. To change it, edit the `backgroundCss` and `dotOverlay` variables in `buildHtml()`.

### Font

The script loads **Noto Sans** from Google Fonts. To use a different font:
1. Change the `@import url(...)` in the CSS
2. Update `font-family` in `.container`

### Dimensions

Change `DEFAULT_WIDTH` and `DEFAULT_HEIGHT` at the top of the script. Standard OG size is 1200x630.

### Layout

Edit the HTML template in `buildHtml()`:
- `.title-row` -- title container (flexbox, centered)
- `.accent` -- blue squares (size, color, border-radius)
- `.title` -- title text (font-size, max-width, line-height)
- `.subtitle` -- subtitle text
- `.vignette` -- edge darkening effect

## Troubleshooting

**"Cannot find module 'playwright'"**
Run: `npm install playwright`

**"Chromium not found"**
Run: `npx playwright install chromium`

**Fonts look wrong**
The script loads Google Fonts. If you're offline, it falls back to system sans-serif. For consistent rendering, embed a local font file instead.

**Output is all black**
Playwright may not have loaded the background image. Check that the file path is correct and the file is a valid PNG/JPG.
