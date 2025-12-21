/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import proxyApp from '../../examples/express/anthropic-proxy-express';
import issuerApp from '../../examples/express/jwt-issuer-express';

let proxyServer: any;
let issuerServer: any;

beforeEach(() => {
  process.env.PROXY_JWT_SECRET = 'test-jwt-secret';
  process.env.PROXY_ISSUER_ADMIN_KEY = 'admin-key';
  process.env.ANTHROPIC_API_KEY = 'sk-test-anthropic';
  process.env.PROXY_RATE_LIMIT = '2';
  process.env.PROXY_RATE_WINDOW_MS = '1000';
});

afterEach(async () => {
  if (proxyServer && proxyServer.close) await new Promise((r) => proxyServer.close(r));
  if (issuerServer && issuerServer.close) await new Promise((r) => issuerServer.close(r));
  delete process.env.PROXY_JWT_SECRET;
  delete process.env.PROXY_ISSUER_ADMIN_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.PROXY_RATE_LIMIT;
  delete process.env.PROXY_RATE_WINDOW_MS;
});

describe('JWT issuer + proxy integration', () => {
  it('issues a token and proxy accepts it (rate limit enforced)', async () => {
    // stub outbound Anthropic call
    const originalFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = async (_url: string, _opts: any) => ({
      ok: true,
      status: 200,
      json: async () => ({ completion: 'fake-response' })
    });

    issuerServer = issuerApp.listen(0);
    const issuerPort = (issuerServer.address() as any).port;

    // request token from issuer
    const tokenResp = await originalFetch(`http://127.0.0.1:${issuerPort}/issuer/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': 'admin-key' },
      body: JSON.stringify({ sub: 'test-client', expiresIn: '1h' })
    });
    const tokBody = await tokenResp.json();
    expect(tokenResp.status).toBe(200);
    expect(tokBody).toHaveProperty('token');

    proxyServer = proxyApp.listen(0);
    const proxyPort = (proxyServer.address() as any).port;

    const token = tokBody.token;
    // two allowed requests
    const r1 = await originalFetch(`http://127.0.0.1:${proxyPort}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ input: 'hello' })
    });
    expect(r1.status).toBe(200);

    const r2 = await originalFetch(`http://127.0.0.1:${proxyPort}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ input: 'hello' })
    });
    expect(r2.status).toBe(200);

    const r3 = await originalFetch(`http://127.0.0.1:${proxyPort}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ input: 'hello' })
    });
    expect(r3.status).toBe(429);

    (globalThis as any).fetch = originalFetch;
  });
});
