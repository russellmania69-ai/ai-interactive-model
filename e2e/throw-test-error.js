const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const url = process.argv[2] || 'http://localhost:4173';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle' });
  console.log('Throwing test error in page context');
  await page.evaluate(() => { throw new Error('sourcemap-test:24ba120c3aff6b0746c124de7f7e6d027a72df2a'); });
  await browser.close();
})();
