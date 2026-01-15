const { chromium } = require('playwright');

(async () => {
  const url = process.argv[2] || 'http://127.0.0.1:5176/';
  const browser = await chromium.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE_CONSOLE:', msg.type(), msg.text()));
  try {
    await page.goto(url, { waitUntil: 'networkidle' });
    // Click the Sign In button (find by exact text)
    await page.evaluate(() => {
      const btn = Array.from(document.querySelectorAll('button')).find(b => (b.textContent||'').trim() === 'Sign In');
      if (btn) btn.click();
    });
    // Wait briefly for modal to render
    await page.waitForTimeout(1000);

    const hasEmail = await page.evaluate(() => !!document.querySelector('#email'));
    const hasPassword = await page.evaluate(() => !!document.querySelector('#password'));
    console.log('HAS_EMAIL:', hasEmail, 'HAS_PASSWORD:', hasPassword);

    const modalHtml = await page.evaluate(() => {
      const modal = document.querySelector('form') || document.querySelector('[role="dialog"]') || document.querySelector('.react-modal') || document.body;
      return modal ? (modal.outerHTML || modal.innerHTML).slice(0, 2000) : null;
    });
    console.log('MODAL_HTML_SNIPPET:', modalHtml ? modalHtml.substring(0, 2000) : null);

    await browser.close();
    process.exit(0);
  } catch (e) {
    console.error('ERROR:', e);
    try { await page.screenshot({ path: 'click-inspect-error.png', fullPage: true }); } catch (e) {}
    await browser.close();
    process.exit(1);
  }
})();
