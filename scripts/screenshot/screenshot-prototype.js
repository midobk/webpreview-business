/**
 * scripts/screenshot/screenshot-prototype.js
 *
 * Capture desktop + mobile screenshots of a prototype using Playwright
 * with a file:// URL — no local dev server required.
 *
 * Outputs:
 *   - public/prototype-screenshots/<slug>-desktop.png
 *   - public/prototype-screenshots/<slug>-mobile.png
 *
 * Public path is what the live /showcase page references, so these
 * screenshots are visible on Vercel (which is read-only at runtime).
 *
 * Usage:
 *   node scripts/screenshot/screenshot-prototype.js <slug>
 *   node scripts/screenshot/screenshot-prototype.js --all
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PROTOS_DIR = path.join(PROJECT_ROOT, 'data', 'prototypes');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'prototype-screenshots');

const VIEWPORTS = {
  desktop: { width: 1440, height: 900 },
  mobile: { width: 390, height: 844 },
};

async function captureOne(browser, slug) {
  const htmlPath = path.join(PROTOS_DIR, slug, 'index.html');
  if (!fs.existsSync(htmlPath)) {
    console.error(`  ! ${slug}: no index.html at ${htmlPath}`);
    return null;
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const url = 'file://' + htmlPath;

  const results = { slug, files: {} };
  for (const [kind, viewport] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Let any deferred paint (fonts, lazy images) finish
      await page.waitForTimeout(1200);
      const outPath = path.join(OUT_DIR, `${slug}-${kind}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      const stat = fs.statSync(outPath);
      results.files[kind] = { path: outPath, bytes: stat.size };
      console.log(`  ✓ ${slug} (${kind}) → ${path.relative(PROJECT_ROOT, outPath)} (${(stat.size/1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  ! ${slug} (${kind}): ${err.message}`);
    } finally {
      await ctx.close();
    }
  }
  return results;
}

async function main() {
  const arg = process.argv[2];
  let slugs = [];

  if (arg === '--all' || !arg) {
    if (!fs.existsSync(PROTOS_DIR)) {
      console.error(`No prototypes dir at ${PROTOS_DIR}`);
      process.exit(1);
    }
    slugs = fs.readdirSync(PROTOS_DIR).filter((d) =>
      fs.statSync(path.join(PROTOS_DIR, d)).isDirectory()
    );
    console.log(`Capturing ${slugs.length} prototypes via file://…\n`);
  } else {
    slugs = [arg];
  }

  const browser = await chromium.launch();
  const summary = [];
  for (const slug of slugs) {
    const r = await captureOne(browser, slug);
    if (r) summary.push(r);
  }
  await browser.close();

  console.log(`\nDone. ${summary.length}/${slugs.length} captured → ${path.relative(PROJECT_ROOT, OUT_DIR)}/`);
  if (summary.length) {
    const totalBytes = summary.reduce(
      (s, r) => s + Object.values(r.files).reduce((x, f) => x + (f?.bytes || 0), 0),
      0
    );
    console.log(`Total: ${(totalBytes / 1024 / 1024).toFixed(2)} MB`);
  }
}

if (require.main === module) {
  main().catch((e) => { console.error(e); process.exit(1); });
}

module.exports = { captureOne };
