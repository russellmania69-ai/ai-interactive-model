import { describe, it, expect, beforeEach, vi } from 'vitest';

beforeEach(() => {
  // Ensure module cache is cleared so internal state resets between tests
  vi.resetModules();
  delete process.env.REDIS_URL;
});

describe('isRateLimited (in-memory)', () => {
  it('allows requests under the limit and blocks after exceeding', async () => {
    const { isRateLimited } = await import('../lib/proxy-rate-limit');
    const key = 'test-key-1';
    // use a small limit for the test
    const limit = 3;
    let blocked = false;
    for (let i = 0; i < limit; i++) {
      // should not be blocked for first `limit` calls
      // eslint-disable-next-line no-await-in-loop
      const r = await isRateLimited(key, limit, 60_000);
      expect(r).toBe(false);
    }
    // the next call should be blocked
    blocked = await isRateLimited(key, limit, 60_000);
    expect(blocked).toBe(true);
  });

  it('isolates different keys', async () => {
    const { isRateLimited } = await import('../lib/proxy-rate-limit');
    const a = await isRateLimited('a', 1, 60_000);
    const b = await isRateLimited('b', 1, 60_000);
    expect(a).toBe(false);
    expect(b).toBe(false);
    const a2 = await isRateLimited('a', 1, 60_000);
    expect(a2).toBe(true);
  });
});
