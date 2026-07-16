const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.CAPTURE_BASE_URL || 'http://localhost:3000';

async function ensureDevServer() {
  try {
    const res = await fetch(BASE_URL + '/', { signal: AbortSignal.timeout(2000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  } catch (err) {
    throw new Error(
      `Dev server not reachable at ${BASE_URL} (${err.message}). ` +
        'Start it with `npm run dev` (or set CAPTURE_BASE_URL) before running this script.'
    );
  }
}

async function captureScreenshots() {
  await ensureDevServer();

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  // Get all prototype directories
  const prototypesDir = path.join(process.cwd(), 'data', 'prototypes');
  const prototypeDirs = fs.readdirSync(prototypesDir).filter(dir =>
    fs.statSync(path.join(prototypesDir, dir)).isDirectory()
  );

  for (const slug of prototypeDirs) {
    console.log(`Capturing screenshots for ${slug}...`);
    
    // Construct the local URL for the preview
    const url = `${BASE_URL}/preview/${slug}`;
    
    try {
      // Navigate to the preview page
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Wait a bit for the page to load
      await page.waitForTimeout(2000);
      
      // Capture desktop screenshot
      const desktopPath = path.join(prototypesDir, slug, 'screenshot-desktop.png');
      await page.screenshot({ path: desktopPath, fullPage: true });
      console.log(`  Desktop screenshot saved to ${desktopPath}`);
      
      // Capture mobile screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      const mobilePath = path.join(prototypesDir, slug, 'screenshot-mobile.png');
      await page.screenshot({ path: mobilePath, fullPage: true });
      console.log(`  Mobile screenshot saved to ${mobilePath}`);
      
      // Reset viewport for next iteration
      await page.setViewportSize({ width: 1280, height: 720 });
    } catch (error) {
      console.error(`  Error capturing screenshots for ${slug}:`, error.message);
    }
  }

  await browser.close();
  console.log('Screenshot capture complete!');
}

// Run the function if this script is executed directly
if (require.main === module) {
  captureScreenshots().catch(console.error);
}

module.exports = { captureScreenshots };