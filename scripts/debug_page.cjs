const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'https://russellmania69-ai.github.io/ai-interactive-model/';
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('PAGE LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.toString()));

  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const html = await page.content();
    console.log('--- PAGE HTML SNIPPET ---');
    console.log(html.slice(0, 2000));
    await page.screenshot({ path: 'page-debug.png', fullPage: true });
    console.log('Screenshot saved to page-debug.png');
  } catch (e) {
    console.error('Error loading page:', String(e));
  } finally {
    await browser.close();
  }
})();
