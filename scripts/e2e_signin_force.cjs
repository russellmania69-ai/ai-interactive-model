const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:5176/ai-interactive-model/';
  const email = process.argv[3] || 'russellmania69@gmail.com';
  const password = process.argv[4] || 'duxhe8-cEdruf-hejxym';
  const timeout = parseInt(process.env.E2E_TIMEOUT || '60000', 10);
  const tracePath = process.env.PLAYWRIGHT_TRACE_PATH || '/tmp/playwright-trace.zip';
  const screenshotPath = process.env.PLAYWRIGHT_SCREENSHOT_PATH || '/tmp/signin_force.png';

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  page.on('console', msg => {
    try { console.log('PAGE_CONSOLE:', msg.type(), msg.text()); } catch (e) {}
  });

  try {
    await context.tracing.start({ screenshots: true, snapshots: true });
    await page.goto(url, { waitUntil: 'networkidle', timeout });
    // If the app is already authenticated (e.g. auto mock signin), skip the sign-in flow.
    try {
      await page.waitForSelector('text=My Profile', { timeout: 3000 });
      console.log('Already signed in: My Profile visible');
      await page.screenshot({ path: '/tmp/signin-success-force.png', fullPage: true });
      await context.tracing.stop({ path: tracePath });
      await browser.close();
      process.exit(0);
    } catch (err) {
      // not signed in yet — continue with sign-in flow
    }
    await page.click('button:has-text("Sign In")', { force: true, timeout });
    // Wait for any common email/password input patterns (id, name, or type)
    await page.waitForSelector('input[type="email"], input[name*=email], #email', { timeout });
    await page.fill('input[type="email"], input[name*=email], #email', email);
    await page.waitForSelector('input[type="password"], input[name*=pass], #password', { timeout });
    await page.fill('input[type="password"], input[name*=pass], #password', password);
    await Promise.all([
      page.click('button:has-text("Sign In")', { force: true, timeout }),
      page.waitForTimeout(1500)
    ]);
    await page.waitForSelector('text=My Profile', { timeout });
    console.log('Sign-in successful: My Profile visible');
    await page.screenshot({ path: '/tmp/signin-success-force.png', fullPage: true });
    await context.tracing.stop({ path: tracePath });
    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('Error during forced sign-in flow:', e);
    try { await page.screenshot({ path: screenshotPath, fullPage: true }); } catch (err) {}
    try { await context.tracing.stop({ path: tracePath }); } catch (err) {}
    await browser.close();
    process.exit(1);
  }
})();
