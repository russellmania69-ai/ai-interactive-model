/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import app from '../../examples/express/anthropic-proxy-express';

let server: any;

beforeEach(() => {
  process.env.PROXY_API_KEY = 'test-proxy-key';
  process.env.ANTHROPIC_API_KEY = 'sk-test-anthropic';
  process.env.PROXY_JWT_SECRET = 'test-jwt-secret';
  process.env.PROXY_RATE_LIMIT = '2';
  process.env.PROXY_RATE_WINDOW_MS = '1000';
});

afterEach(async () => {
  if (server && server.close) await new Promise((r) => server.close(r));
  delete process.env.PROXY_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
});

describe('Express Anthropic proxy (integration)', () => {
  it('forwards request to Anthropic and returns response', async () => {
    // stub global fetch used by the proxy to call Anthropic
    const originalFetch = (globalThis as any).fetch;
    (globalThis as any).fetch = async (_url: string, _opts: any) => ({
      ok: true,
      status: 200,
      json: async () => ({ completion: 'fake-response' })
    });
    // generate a JWT for the proxy auth
    const jwt = await import('jsonwebtoken');
    const token = jwt.sign({ sub: 'test-client' }, process.env.PROXY_JWT_SECRET as string, { expiresIn: '1h' });

    server = app.listen(0);
    const port = (server.address() as any).port;

    // first request should pass
    const resp1 = await originalFetch(`http://127.0.0.1:${port}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ input: 'Hello' })
    });
    const body1 = await resp1.json();
    expect(resp1.status).toBe(200);
    expect(body1).toHaveProperty('completion', 'fake-response');

    // second request should pass (limit=2)
    const resp2 = await originalFetch(`http://127.0.0.1:${port}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ input: 'Hello' })
    });
    expect(resp2.status).toBe(200);

    // third immediate request should be rate-limited
    const resp3 = await originalFetch(`http://127.0.0.1:${port}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${token}` },
      body: JSON.stringify({ input: 'Hello' })
    });
    expect(resp3.status).toBe(429);

    (globalThis as any).fetch = originalFetch;
  });
});
