import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:8080'

test('subscribe button visible on mobile viewport', async ({ page }) => {
  // emulate a common mobile viewport
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto(BASE)

  // wait for model cards to render
  const subscribe = page.locator('text=Subscribe').first()
  await subscribe.waitFor({ state: 'visible', timeout: 10_000 })
  await subscribe.scrollIntoViewIfNeeded()

  // basic visibility
  expect(await subscribe.isVisible()).toBeTruthy()

  // ensure bounding box fits within viewport (not clipped)
  const rect = await subscribe.evaluate((el) => {
    const r = el.getBoundingClientRect()
    return { top: r.top, left: r.left, right: r.right, bottom: r.bottom, width: r.width, height: r.height, vw: window.innerWidth, vh: window.innerHeight }
  })

  expect(rect.width).toBeGreaterThan(0)
  expect(rect.height).toBeGreaterThan(0)
  expect(rect.right).toBeLessThanOrEqual(rect.vw + 1) // allow tiny subpixel
  expect(rect.bottom).toBeLessThanOrEqual(rect.vh + 1)
})
