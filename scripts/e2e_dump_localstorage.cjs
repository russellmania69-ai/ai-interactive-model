const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:5176/ai-interactive-model/';
  const email = process.argv[3] || 'russellmania69@gmail.com';
  const password = process.argv[4] || 'duxhe8-cEdruf-hejxym';
  const timeout = parseInt(process.env.E2E_TIMEOUT || '60000', 10);
  const out = process.env.LOCALSTORAGE_OUT || '/tmp/post_signin_localstorage.json';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout });
    await page.click('button:has-text("Sign In")', { force: true, timeout });
    await page.waitForSelector('#email', { timeout });
    await page.fill('#email', email);
    await page.fill('#password', password);
    await Promise.all([
      page.click('button:has-text("Sign In")', { force: true, timeout }),
      page.waitForTimeout(1500)
    ]);
    await page.waitForTimeout(1000);
    const ls = await page.evaluate(() => {
      const obj = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        obj[key] = localStorage.getItem(key);
      }
      return obj;
    });
    fs.writeFileSync(out, JSON.stringify(ls, null, 2));
    console.log('Wrote', out);
    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('Error dumping localStorage:', e);
    await browser.close();
    process.exit(1);
  }
})();
