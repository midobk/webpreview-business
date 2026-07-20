// Screenshot the prototype at desktop and mobile widths
import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const HTML_PATH = process.argv[2] || 'data/prototypes/quilles-nativit-bowling-ad6e7e78/index.html';
const OUT_DIR = process.argv[3] || 'prototype-screenshots';
const SLUG = process.argv[4] || 'quilles-nativit-bowling-ad6e7e78';

const browser = await chromium.launch();
const url = 'file://' + path.resolve(HTML_PATH);

const ctxD = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const pageD = await ctxD.newPage();
await pageD.goto(url, { waitUntil: 'networkidle' });
await pageD.waitForTimeout(500);
fs.mkdirSync(OUT_DIR, { recursive: true });
await pageD.screenshot({ path: path.join(OUT_DIR, `${SLUG}-desktop.png`), fullPage: true });
console.log(`Wrote ${SLUG}-desktop.png`);

const ctxM = await browser.newContext({ viewport: { width: 390, height: 844 } });
const pageM = await ctxM.newPage();
await pageM.goto(url, { waitUntil: 'networkidle' });
await pageM.waitForTimeout(500);
await pageM.screenshot({ path: path.join(OUT_DIR, `${SLUG}-mobile.png`), fullPage: true });
console.log(`Wrote ${SLUG}-mobile.png`);

await browser.close();
