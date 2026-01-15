import { test, expect } from '@playwright/test';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:4173';

test.describe('Smoke endpoints', () => {
  test('health returns 200', async ({ request }) => {
    const res = await request.get(`${BASE}/health`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('metrics returns 200 when METRICS_SECRET provided', async ({ request }) => {
    if (!process.env.METRICS_SECRET) {
      test.skip(true, 'METRICS_SECRET not configured');
      return;
    }
    const res = await request.get(`${BASE}/metrics`, { headers: { 'x-metrics-secret': process.env.METRICS_SECRET } });
    expect(res.ok()).toBeTruthy();
    const text = await res.text();
    expect(typeof text).toBe('string');
    expect(text.length).toBeGreaterThan(0);
  });
});
