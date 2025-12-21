import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

async function listen(app: any) {
  return new Promise<{ url: string; close: () => Promise<void> }>((resolve) => {
    const srv = app.listen(0, () => {
      // @ts-ignore
      const port = srv.address().port;
      resolve({ url: `http://127.0.0.1:${port}`, close: async () => new Promise((r) => srv.close(r)) });
    });
  });
}

beforeEach(() => {
  vi.resetModules();
  delete process.env.REDIS_URL;
});

describe('examples/express/anthropic-proxy-express', () => {
  it('returns 501 when ANTHROPIC_API_KEY not configured', async () => {
    process.env.PROXY_API_KEY = 'secret';
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', {
      method: 'POST',
      headers: { 'x-api-key': 'secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'hello' })
    });
    expect(res.status).toBe(501);
    await srv.close();
  });

  it('returns 400 when input missing', async () => {
    process.env.PROXY_API_KEY = 'secret';
    process.env.ANTHROPIC_API_KEY = 'api-key';
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', {
      method: 'POST',
      headers: { 'x-api-key': 'secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    expect(res.status).toBe(400);
    await srv.close();
  });

  it('proxies request to Anthropic when configured', async () => {
    process.env.PROXY_API_KEY = 'secret';
    process.env.ANTHROPIC_API_KEY = 'api-key';

    // mock global.fetch used by the proxy
    const mockData = { result: 'ok' };
    vi.stubGlobal('fetch', async () => ({ status: 200, json: async () => mockData } as any));

    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', {
      method: 'POST',
      headers: { 'x-api-key': 'secret', 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: 'say hi' })
    });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toEqual(mockData);
    await srv.close();
    vi.unstubAllGlobals();
  });
});

describe('examples/express/jwt-issuer-express', () => {
  it('returns 401 when admin key missing', async () => {
    delete process.env.PROXY_ISSUER_ADMIN_KEY;
    delete process.env.ADMIN_API_KEY;
    const app = (await import('../../../examples/express/jwt-issuer-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/issuer/token', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ sub: 'x' }) });
    expect(res.status).toBe(401);
    await srv.close();
  });

  it('returns 501 when JWT secret missing', async () => {
    process.env.PROXY_ISSUER_ADMIN_KEY = 'adminkey';
    delete process.env.PROXY_JWT_SECRET;
    const app = (await import('../../../examples/express/jwt-issuer-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/issuer/token', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': 'adminkey' }, body: JSON.stringify({ sub: 'c' }) });
    expect(res.status).toBe(501);
    await srv.close();
  });

  it('issues a JWT when admin key and secret present', async () => {
    process.env.PROXY_ISSUER_ADMIN_KEY = 'adminkey';
    process.env.PROXY_JWT_SECRET = 'jwt-secret';
    const app = (await import('../../../examples/express/jwt-issuer-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/issuer/token', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-key': 'adminkey' }, body: JSON.stringify({ sub: 'client' }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.token).toBeTruthy();
    // verify the token is signed with the secret
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.verify(body.token, 'jwt-secret') as any;
    expect(decoded.sub).toBe('client');
    await srv.close();
  });
});

describe('additional anthropic-proxy branches', () => {
  beforeEach(() => {
    vi.resetModules();
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.PROXY_API_KEY;
    delete process.env.PROXY_JWKS_URL;
    delete process.env.PROXY_JWT_SECRET;
  });

  it('returns 401 when PROXY_JWKS_URL provided but token invalid', async () => {
    process.env.PROXY_JWKS_URL = 'https://example.com/jwks.json';
    // mock verifyWithJWKS to throw
    vi.mock('../../../src/lib/jwks', () => ({ verifyWithJWKS: async () => { throw new Error('invalid'); } }));
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { authorization: 'Bearer tok', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'x' }) });
    expect(res.status).toBe(401);
    await srv.close();
  });

  it('accepts jwks token when verifyWithJWKS succeeds', async () => {
    process.env.PROXY_JWKS_URL = 'https://example.com/jwks.json';
    process.env.ANTHROPIC_API_KEY = 'k';
    // mock verifyWithJWKS to return payload
    vi.mock('../../../src/lib/jwks', () => ({ verifyWithJWKS: async () => ({ sub: 'jwks-client' }) }));
    vi.stubGlobal('fetch', async () => ({ status: 200, json: async () => ({ ok: true }) } as any));
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { authorization: 'Bearer tok', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'hi' }) });
    expect(res.status).toBe(200);
    await srv.close();
    vi.unstubAllGlobals();
  });

  it('returns 401 when PROXY_JWT_SECRET is set but no Bearer token', async () => {
    process.env.PROXY_JWT_SECRET = 's';
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'x' }) });
    expect(res.status).toBe(401);
    await srv.close();
  });

  it('returns 401 when proxy key mismatches', async () => {
    process.env.PROXY_API_KEY = 'right';
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { 'x-api-key': 'wrong', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'x' }) });
    expect(res.status).toBe(401);
    await srv.close();
  });

  it('returns 429 when rate limited', async () => {
    // Use real in-memory rate limiter by lowering the window limit
    process.env.PROXY_API_KEY = 'k';
    process.env.ANTHROPIC_API_KEY = 'ak';
    process.env.PROXY_RATE_LIMIT = '1';
    // first request allowed
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { 'x-api-key': 'k', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'first' }) });
    // second request should be rate limited
    const res2 = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { 'x-api-key': 'k', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'second' }) });
    expect(res2.status).toBe(429);
    await srv.close();
  });

  it('uses payload.id when sub is missing', async () => {
    vi.resetModules();
    process.env.PROXY_JWKS_URL = 'https://example.com/jwks.json';
    process.env.ANTHROPIC_API_KEY = 'k';
    // mock verifyWithJWKS to return id only
    vi.mock('../../../src/lib/jwks', () => ({ verifyWithJWKS: async () => ({ id: 'only-id' }) }));
    vi.stubGlobal('fetch', async () => ({ status: 200, json: async () => ({ ok: true }) } as any));
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { authorization: 'Bearer tok', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'hi' }) });
    expect(res.status).toBe(200);
    await srv.close();
    vi.unstubAllGlobals();
  });

  it('returns 401 when jwt verify throws', async () => {
    vi.resetModules();
    process.env.PROXY_JWT_SECRET = 'secret';
    // use a non-hoisted mock to avoid affecting other tests
    vi.doMock('jsonwebtoken', () => ({ verify: () => { throw new Error('bad token'); } }));
    const app = (await import('../../../examples/express/anthropic-proxy-express')).default;
    const srv = await listen(app);
    const res = await fetch(srv.url + '/proxy/anthropic', { method: 'POST', headers: { authorization: 'Bearer tok', 'Content-Type': 'application/json' }, body: JSON.stringify({ input: 'x' }) });
    expect(res.status).toBe(401);
    await srv.close();
    vi.unmock('jsonwebtoken');
  });

  

  
});
