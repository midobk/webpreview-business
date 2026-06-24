// shot-loop.mjs — captures the full admin redesign on port 3002.
// Run with: node .learnings/shot-loop.mjs
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const BASE = 'http://localhost:3002';
const OUT = '.learnings/admin-shots-v2';
await mkdir(OUT, { recursive: true });

const PASSWORD = '1234';

async function shot(page, name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log('  →', path);
}

async function fullShot(page, name) {
  const path = `${OUT}/${name}.png`;
  await page.screenshot({ path, fullPage: true });
  console.log('  →', path);
}

const browser = await chromium.launch({ args: ['--no-sandbox'] });

// ===== LIGHT MODE pass =====
const lightCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'light',
});
const light = await lightCtx.newPage();
await light.addInitScript(() => localStorage.setItem('admin-theme', 'light'));

console.log('LIGHT MODE');
await light.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
await light.waitForTimeout(400);
await shot(light, '01-login-light');

await light.goto(`${BASE}/admin/setup`, { waitUntil: 'networkidle' });
await light.waitForTimeout(300);
await shot(light, '02-setup-light');

// Login flow
await light.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
await light.fill('input[name="password"]', PASSWORD);
await Promise.all([
  light.waitForURL(/\/admin\/dashboard/, { timeout: 15000 }),
  light.click('button[type="submit"]'),
]);
await light.waitForSelector('table tbody tr', { timeout: 20000 });
await light.waitForTimeout(1500);
await shot(light, '03-dashboard-light');
await fullShot(light, '03-dashboard-light-full');

// Open lead detail drawer
const firstRow = light.locator('table tbody tr').first();
if (await firstRow.count()) {
  await firstRow.click();
  await light.waitForTimeout(600);
  await shot(light, '04-drawer-light');
  // Close drawer
  await light.keyboard.press('Escape');
  await light.waitForTimeout(400);
}

// Scroll to prototypes
const protoSection = light.locator('text=Prototype gallery').first();
if (await protoSection.count()) {
  await protoSection.scrollIntoViewIfNeeded();
  await light.waitForTimeout(400);
  await shot(light, '05-prototypes-light');
}

await lightCtx.close();

// ===== DARK MODE pass =====
const darkCtx = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 2,
  colorScheme: 'dark',
});
const dark = await darkCtx.newPage();
await dark.addInitScript(() => localStorage.setItem('admin-theme', 'dark'));

console.log('DARK MODE');
await dark.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
await dark.waitForTimeout(400);
await shot(dark, '06-login-dark');

await dark.goto(`${BASE}/admin/setup`, { waitUntil: 'networkidle' });
await dark.waitForTimeout(300);
await shot(dark, '07-setup-dark');

await dark.goto(`${BASE}/admin`, { waitUntil: 'networkidle' });
await dark.fill('input[name="password"]', PASSWORD);
await Promise.all([
  dark.waitForURL(/\/admin\/dashboard/, { timeout: 15000 }),
  dark.click('button[type="submit"]'),
]);
await dark.waitForSelector('table tbody tr', { timeout: 20000 });
await dark.waitForTimeout(1500);
await shot(dark, '08-dashboard-dark');
await fullShot(dark, '08-dashboard-dark-full');

const firstRowD = dark.locator('table tbody tr').first();
if (await firstRowD.count()) {
  await firstRowD.click();
  await dark.waitForTimeout(600);
  await shot(dark, '09-drawer-dark');
}

await darkCtx.close();
await browser.close();
console.log('done');