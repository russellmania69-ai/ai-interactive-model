import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('proxy-rate-limit', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.REDIS_URL
  })

  it('uses in-memory store when Redis not configured', async () => {
    const { isRateLimited } = await import('../lib/proxy-rate-limit')
    const key = 'test-inmem'
    expect(await isRateLimited(key, 2)).toBe(false)
    expect(await isRateLimited(key, 2)).toBe(false)
    expect(await isRateLimited(key, 2)).toBe(true)
  })

  it('uses Redis when REDIS_URL present', async () => {
    process.env.REDIS_URL = 'redis://localhost:6379'

    vi.mock('ioredis', () => ({
      default: class MockRedis {
        store = new Map<string, number>()
        url: string
        constructor(u: string) { this.url = u }
        async ping() { return 'PONG' }
        async incr(k: string) {
          const v = (this.store.get(k) || 0) + 1
          this.store.set(k, v)
          return v
        }
        async pexpire(_k: string, _ms: number) { return 1 }
      }
    }))

    const { initRateLimiter, isRateLimited } = await import('../lib/proxy-rate-limit')
    await initRateLimiter()

    const key = 'test-redis'
    expect(await isRateLimited(key, 2)).toBe(false)
    expect(await isRateLimited(key, 2)).toBe(false)
    expect(await isRateLimited(key, 2)).toBe(true)
  })
})
