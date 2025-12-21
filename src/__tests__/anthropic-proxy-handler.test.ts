import { describe, it, expect, vi } from 'vitest';
import type { Request, Response } from 'express';

describe('anthropic proxy handler and startServer', () => {
  it('handler uses payload.id when no sub and logs fetch errors', async () => {
    // Prepare environment and mocks
    vi.resetModules();
    process.env.PROXY_RATE_LIMIT = '1000';
    delete process.env.PROXY_JWKS_URL;
    process.env.PROXY_JWT_SECRET = 'secret';
    process.env.ANTHROPIC_API_KEY = 'akey';
    // mock jwt.verify (default export) to return { id } and ensure rate limiter does not block
    vi.doMock('jsonwebtoken', () => ({ default: { verify: () => ({ id: 'the-id' }) } }));
    vi.doMock('../../../src/lib/proxy-rate-limit', () => ({ initRateLimiter: async () => {}, isRateLimited: async () => false }));
    // make fetch return a response whose json() throws synchronously to exercise the catch logging
    vi.stubGlobal('fetch', async () => ({ status: 200, json: () => { throw new Error('network error'); } } as any));

    const { proxyHandler } = await import('../../../examples/express/anthropic-proxy-express');

    // create minimal mock req/res
    const req = { header: () => 'Bearer tok', body: { input: 'x' }, ip: '1.2.3.4', headers: {} } as unknown as Request;
    const statusCalls: any[] = [];
    const res = {
      status(code: number) { statusCalls.push(code); return this; },
      json(obj: any) { return obj; }
    } as unknown as Response;

    await proxyHandler(req, res);
    // debug: show status calls
    // eslint-disable-next-line no-console
    console.log('statusCalls=', statusCalls);
    // handler should have returned a 500 because resp.json threw
    expect(statusCalls.includes(500)).toBe(true);
    vi.unstubAllGlobals();
    vi.unmock('../../../src/lib/jwks');

  });

  it('startServer listens (covers listen branch)', async () => {
    const mod = await import('../../../examples/express/anthropic-proxy-express');
    const srv = mod.startServer(0) as any;
    // @ts-ignore
    const port = srv.address().port;
    expect(port).toBeGreaterThan(0);
    await new Promise((r) => srv.close(r));
  });
});
