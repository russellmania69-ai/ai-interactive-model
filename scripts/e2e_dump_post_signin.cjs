const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:5176/ai-interactive-model/';
  const email = process.argv[3] || 'russellmania69@gmail.com';
  const password = process.argv[4] || 'duxhe8-cEdruf-hejxym';
  const timeout = parseInt(process.env.E2E_TIMEOUT || '60000', 10);
  const outHtml = process.env.POST_SIGNIN_HTML || '/tmp/post_signin_dom.html';
  const outLog = process.env.POST_SIGNIN_LOG || '/tmp/post_signin_console.log';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  const logs = [];
  page.on('console', msg => {
    try { logs.push({ type: msg.type(), text: msg.text() }); } catch (e) {}
  });

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
    // wait a short time for UI to update
    await page.waitForTimeout(2000);
    const html = await page.content();
    fs.writeFileSync(outHtml, html);
    fs.writeFileSync(outLog, JSON.stringify(logs, null, 2));
    console.log('Wrote', outHtml, outLog);
    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('Error dumping post-signin DOM:', e);
    try { fs.writeFileSync(outLog, JSON.stringify(logs, null, 2)); } catch (err) {}
    await browser.close();
    process.exit(1);
  }
})();
