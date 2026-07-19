import { chromium } from 'playwright';
const url = process.argv[2];
const out = process.argv[3];
const w = parseInt(process.argv[4]||'1440',10);
const h = parseInt(process.argv[5]||'900',10);
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
const ctx = await browser.newContext({ viewport: { width: w, height: h } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('pageerror: '+e.message));
page.on('console', m => { if(m.type()==='error') errors.push('console: '+m.text()); });
const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
await page.waitForTimeout(800);
await page.screenshot({ path: out, fullPage: true });
const imgs = await page.$$eval('img', els => els.map(e => ({src:e.getAttribute('src'), w:e.naturalWidth, h:e.naturalHeight})));
const overflow = await page.evaluate(() => ({
  scrollW: document.documentElement.scrollWidth,
  clientW: document.documentElement.clientWidth,
  bodyOverflow: getComputedStyle(document.body).overflow
}));
console.log(JSON.stringify({status:resp?.status(), imgs, overflow, errors}, null, 2));
await browser.close();
