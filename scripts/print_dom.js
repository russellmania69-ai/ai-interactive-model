import { chromium } from 'playwright';

const base = process.env.E2E_BASE_URL || 'http://localhost:4173';

try {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE_CONSOLE', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('PAGE_ERROR', err.message, '\n', err.stack));
  await page.goto(base, { waitUntil: 'load', timeout: 30000 });
  // wait for client JS to render
  await page.waitForTimeout(2000);
  const content = await page.content();
  console.log(content);
  await browser.close();
} catch (err) {
  console.error('ERROR', err);
  process.exitCode = 1;
}
