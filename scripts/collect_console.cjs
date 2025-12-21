const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const logs = [];

  page.on('console', msg => {
    logs.push({ type: 'console', level: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    logs.push({ type: 'pageerror', message: err.message, stack: err.stack });
  });

  page.on('requestfailed', req => {
    logs.push({ type: 'requestfailed', url: req.url(), failure: req.failure() && req.failure().errorText });
  });

  const target = process.env.TARGET_URL || 'http://localhost:8080/';

  try {
    const res = await page.goto(target, { waitUntil: 'networkidle', timeout: 15000 });
    logs.push({ type: 'navigation', status: res ? res.status() : 'no-response', url: res ? res.url() : target });
  } catch (e) {
    logs.push({ type: 'navigation-error', message: e.message });
  }

  // wait a bit for client-side scripts to run
  await page.waitForTimeout(3000);

  console.log('==== COLLECTED LOGS START ====');
  console.log(JSON.stringify(logs, null, 2));
  console.log('==== COLLECTED LOGS END ====');

  await browser.close();
  process.exit(0);
})();
