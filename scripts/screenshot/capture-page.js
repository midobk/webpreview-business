const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const url = process.argv[2] || 'http://localhost:3000/';
  const outDir = process.argv[3] || path.join(process.cwd(), 'logs');
  const tag = process.argv[4] || 'screenshot';

  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  const desktopPath = path.join(outDir, `homepage-desktop-${tag}.png`);
  await page.screenshot({ path: desktopPath, fullPage: true });
  console.log(`Desktop → ${desktopPath}`);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(800);
  const mobilePath = path.join(outDir, `homepage-mobile-${tag}.png`);
  await page.screenshot({ path: mobilePath, fullPage: true });
  console.log(`Mobile  → ${mobilePath}`);

  await browser.close();
}

const fs = require('fs');
main().catch((e) => { console.error(e); process.exit(1); });