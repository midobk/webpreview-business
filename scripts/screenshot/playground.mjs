/**
 * scripts/screenshot/playground.mjs
 *
 * Capture desktop + mobile screenshots of anonymized prototypes via headless
 * Chromium (Playwright). Used by the playground-vetting workflow to populate
 * `public/prototype-screenshots/<slug>-{desktop,mobile}.png`.
 *
 * Usage:
 *   node scripts/screenshot/playground.mjs                 # all 9 playground slugs
 *   node scripts/screenshot/playground.mjs <slug> [more…]  # specific slugs
 *   node scripts/screenshot/playground.mjs --out <dir>     # override output dir
 */

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, '..', '..');
const PROTOS_DIR = join(PROJECT_ROOT, 'data', 'prototypes-anonymized');
const OUT_DIR = join(PROJECT_ROOT, 'public', 'prototype-screenshots');

const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 390, height: 844 },
};

// 9 playground slugs vetted at threshold (≥75 premium-saas score).
const DEFAULT_SLUGS = [
  'flowdesk-saas',
  'premier-real-estate',
  'harvest-table-restaurant',
  'bright-smile-dental',
  'summit-fitness-gym',
  'meridian-law-firm',
  'allied-home-services',
  'northwind-ecommerce',
  'catalyst-online-course',
];

function parseArgs(argv) {
  const args = { slugs: null, outDir: OUT_DIR };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--out') args.outDir = resolve(argv[++i]);
    else if (a === '--help' || a === '-h') { printHelp(); process.exit(0); }
    else args.slugs = args.slugs || [];
    if (a.startsWith('--') || a === '--out') continue;
    args.slugs.push(a);
  }
  return args;
}

function printHelp() {
  console.log(`Usage:
  node scripts/screenshot/playground.mjs                 # all 9 playground slugs
  node scripts/screenshot/playground.mjs <slug> [more…]  # specific slugs
  node scripts/screenshot/playground.mjs --out <dir>     # override output dir`);
}

async function captureOne(browser, slug, outDir) {
  const htmlPath = join(PROTOS_DIR, slug, 'index.html');
  if (!existsSync(htmlPath)) {
    console.error(`  ! ${slug}: no index.html at ${htmlPath}`);
    return null;
  }
  mkdirSync(outDir, { recursive: true });
  const url = 'file://' + htmlPath;

  const files = {};
  for (const [kind, viewport] of Object.entries(VIEWPORTS)) {
    const ctx = await browser.newContext({ viewport });
    const page = await ctx.newPage();
    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
      // Let CSS animations settle (some prototypes have initial opacity:0 + reveal).
      await page.waitForTimeout(1500);
      const outPath = join(outDir, `${slug}-${kind}.png`);
      await page.screenshot({ path: outPath, fullPage: true });
      const stat = statSync(outPath);
      files[kind] = { path: outPath, bytes: stat.size };
      const rel = outPath.replace(PROJECT_ROOT + '/', '');
      console.log(`  ✓ ${slug} (${kind}) → ${rel} (${(stat.size / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.error(`  ! ${slug} (${kind}): ${err.message}`);
    } finally {
      await ctx.close();
    }
  }
  return { slug, files };
}

async function main() {
  const { slugs, outDir } = parseArgs(process.argv.slice(2));
  const list = slugs && slugs.length ? slugs : DEFAULT_SLUGS;
  if (!existsSync(PROTOS_DIR)) {
    console.error(`No prototypes-anonymized dir at ${PROTOS_DIR}`);
    process.exit(1);
  }
  // If user passed `node playground.mjs` with no args, scan dir too.
  let targets = list;
  if (!process.argv.slice(2).length) {
    targets = readdirSync(PROTOS_DIR).filter((d) =>
      statSync(join(PROTOS_DIR, d)).isDirectory()
    );
  }
  console.log(`Capturing ${targets.length} prototype(s) via file:// → ${outDir.replace(PROJECT_ROOT + '/', '')}/\n`);

  const browser = await chromium.launch();
  const summary = [];
  for (const slug of targets) {
    const r = await captureOne(browser, slug, outDir);
    if (r) summary.push(r);
  }
  await browser.close();

  const totalBytes = summary.reduce(
    (s, r) => s + Object.values(r.files).reduce((x, f) => x + (f?.bytes || 0), 0),
    0
  );
  const ok = summary.filter((r) => r.files.desktop && r.files.mobile).length;
  console.log(`\nDone. ${ok}/${targets.length} complete (${summary.length} partial). ${(totalBytes / 1024 / 1024).toFixed(2)} MB total.`);
  if (ok < targets.length) process.exit(1);
}

main().catch((e) => { console.error(e); process.exit(1); });
