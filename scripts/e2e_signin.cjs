const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'https://russellmania69-ai.github.io/ai-interactive-model/';
  const email = process.argv[3];
  const password = process.argv[4];
  if (!email || !password) {
    console.error('Usage: node e2e_signin.cjs <url> <email> <password>');
    process.exit(2);
  }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle' });

    // Open auth modal
    await page.click('text=Sign In');
    await page.waitForSelector('#email', { timeout: 10000 });

    await page.fill('#email', email);
    await page.fill('#password', password);

    // Submit and wait for UI change
    await Promise.all([
      page.click('button:has-text("Sign In")'),
      page.waitForTimeout(1000)
    ]);

    // Check for My Profile button
    try {
      await page.waitForSelector('text=My Profile', { timeout: 10000 });
      console.log('Sign-in appears successful: My Profile visible');
      await page.click('text=My Profile');
      // Verify email appears in profile
      await page.waitForSelector(`text=${email}`, { timeout: 5000 });
      console.log('Profile shows email:', email);
      await browser.close();
      process.exit(0);
    } catch (err) {
      console.error('Sign-in failed or My Profile not visible');
      await page.screenshot({ path: 'signin-fail.png', fullPage: true });
      await browser.close();
      process.exit(1);
    }
  } catch (e) {
    console.error('Error during sign-in flow:', String(e));
    await page.screenshot({ path: 'signin-error.png', fullPage: true });
    await browser.close();
    process.exit(1);
  }
})();
