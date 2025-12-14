import { test, expect } from '@playwright/test'

const BASE = process.env.E2E_BASE_URL ?? 'https://russellmania69-ai.github.io/ai-interactive-model'

test('homepage loads and has correct title', async ({ page }) => {
  await page.goto(BASE)
  await expect(page).toHaveTitle(/AI Interactive Model/)
})
