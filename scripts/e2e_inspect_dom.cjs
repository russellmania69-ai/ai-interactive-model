const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:5176/ai-interactive-model/';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE_CONSOLE:', msg.type(), msg.text()));
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    const title = await page.title();
    console.log('PAGE_TITLE:', title);
    const navHtml = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      return nav ? nav.outerHTML : null;
    });
    console.log('NAV_HTML_SNIPPET:', navHtml ? navHtml.substring(0, 1000) : 'null');

    const buttons = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => {
        const rect = b.getBoundingClientRect ? b.getBoundingClientRect() : { width:0, height:0, x:0, y:0 };
        return {
          text: (b.textContent || '').trim(),
          id: b.id || null,
          class: b.className || null,
          visible: rect.width > 0 && rect.height > 0,
          rect
        };
      });
    });
    console.log('BUTTONS_COUNT:', buttons.length);
    console.log('BUTTONS:', JSON.stringify(buttons, null, 2));

    const signinExists = await page.locator('text=Sign In').count();
    console.log('LOCATOR_SIGNIN_COUNT:', signinExists);

    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e);
    try { await page.screenshot({ path: 'inspect-error.png', fullPage: true }); } catch (e) {}
    await browser.close();
    process.exit(1);
  }
})();
