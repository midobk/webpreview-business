import { chromium } from 'playwright';

async function main() {
  const url = process.argv[2] || 'http://localhost:3000/showcase';
  const outPath = process.argv[3] || '/tmp/showcase.png';
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  console.log(`Loading ${url}…`);
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  // Wait for entrance animations + screenshot lazy paint
  await page.waitForTimeout(2500);
  await page.screenshot({ path: outPath, fullPage: true });
  const size = await page.evaluate(() => document.documentElement.scrollHeight);
  console.log(`Saved → ${outPath} (full page = ${size}px tall)`);
  await browser.close();
}
main().catch((e) => { console.error(e); process.exit(1); });
