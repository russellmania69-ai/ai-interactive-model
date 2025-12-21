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

describe('isRateLimited (redis path)', () => {
  it('uses redis incr and pexpire when REDIS_URL is set', async () => {
    // Mock ioredis default export as a class
    class MockRedis {
      store = new Map();
      constructor(url: string) {
        // no-op
      }
      async ping() { return 'PONG'; }
      async incr(key: string) {
        const v = (this.store.get(key) || 0) + 1;
        this.store.set(key, v);
        return v;
      }
      async pexpire(_k: string, _ms: number) { return 1; }
    }

    vi.resetModules();
    process.env.REDIS_URL = 'redis://localhost:6379';
    vi.mock('ioredis', () => ({ default: class {
      store = new Map();
      constructor(_url: string) {}
      async ping() { return 'PONG'; }
      async incr(key: string) { const v = (this.store.get(key) || 0) + 1; this.store.set(key, v); return v; }
      async pexpire(_k: string, _ms: number) { return 1; }
    } }));

    const { initRateLimiter, isRateLimited } = await import('../lib/proxy-rate-limit');
    await initRateLimiter();

    const key = 'redis-key';
    // first call should not be blocked for limit=1
    const first = await isRateLimited(key, 1, 60_000);
    expect(first).toBe(false);
    // second call should be blocked
    const second = await isRateLimited(key, 1, 60_000);
    expect(second).toBe(true);
  });

  it('falls back to in-memory when redis init fails', async () => {
    // Mock ioredis to throw on ping
    class BrokenRedis {
      constructor() {}
      async ping() { throw new Error('no redis'); }
    }

    vi.resetModules();
    process.env.REDIS_URL = 'redis://localhost:6379';
    vi.mock('ioredis', () => ({ default: class { constructor() {} async ping() { throw new Error('no redis'); } } }));

    const { initRateLimiter, isRateLimited } = await import('../lib/proxy-rate-limit');
    await initRateLimiter();

    const key = 'fallback-key';
    // in-memory behavior: first call allowed
    expect(await isRateLimited(key, 1, 60_000)).toBe(false);
    // next call blocked
    expect(await isRateLimited(key, 1, 60_000)).toBe(true);
  });
});
