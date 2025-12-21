import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.useRealTimers()

describe('examples/express apps', () => {
  beforeEach(() => {
    vi.resetModules()
    delete process.env.PROXY_API_KEY
    delete process.env.ANTHROPIC_API_KEY
    delete process.env.PROXY_ISSUER_ADMIN_KEY
    delete process.env.PROXY_JWT_SECRET
  })

  it('anthropic proxy returns proxied response when authenticated with x-api-key', async () => {
    process.env.PROXY_API_KEY = 'secret'
    process.env.ANTHROPIC_API_KEY = 'anthropic-key'

    // Mock rate limiter to allow request
    vi.mock('../../src/lib/proxy-rate-limit', () => ({
      initRateLimiter: async () => {},
      isRateLimited: async () => false,
    }))

    // Mock fetch to simulate Anthropic API
    const originalFetch = global.fetch
    const fakeResp = { ok: true, result: 'ok' }
    vi.stubGlobal('fetch', async () => ({
      status: 200,
      json: async () => fakeResp,
    }))

    const app = (await import('../express/anthropic-proxy-express')).default
    const server = app.listen(0)
    const addr: any = server.address()
    const port = addr.port

    const res = await fetch(`http://localhost:${port}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'secret' },
      body: JSON.stringify({ input: 'hello' }),
    })
    const body = await res.json()
    server.close()
    // restore global fetch so subsequent tests perform real requests
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    global.fetch = originalFetch

    expect(res.status).toBe(200)
    expect(body).toEqual(expect.objectContaining({ result: 'ok' }))
  })

  it('jwt issuer issues token when admin key provided', async () => {
    process.env.PROXY_ISSUER_ADMIN_KEY = 'adminkey'
    process.env.PROXY_JWT_SECRET = 'jwtsecret'

    const app = (await import('../express/jwt-issuer-express')).default
    const server = app.listen(0)
    const addr: any = server.address()
    const port = addr.port

    const res = await fetch(`http://localhost:${port}/issuer/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'adminkey' },
      body: JSON.stringify({ sub: 'client123' }),
    })
    const body = await res.json()
    server.close()

    expect(res.status).toBe(200)
    expect(body).toHaveProperty('token')

    const jwt = (await import('jsonwebtoken')) as any
    const decoded = jwt.verify(body.token, process.env.PROXY_JWT_SECRET!) as any
    expect(decoded.sub).toBe('client123')
  })
})
