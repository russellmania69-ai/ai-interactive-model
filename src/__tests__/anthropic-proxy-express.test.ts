/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import app from '../../examples/express/anthropic-proxy-express';

let server: any;

beforeEach(() => {
  process.env.PROXY_API_KEY = 'test-proxy-key';
  process.env.ANTHROPIC_API_KEY = 'sk-test-anthropic';
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

    server = app.listen(0);
    const port = (server.address() as any).port;

    const resp = await (globalThis as any).fetch(`http://127.0.0.1:${port}/proxy/anthropic`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': 'test-proxy-key' },
      body: JSON.stringify({ input: 'Hello' })
    });
    const body = await resp.json();
    expect(resp.status).toBe(200);
    expect(body).toHaveProperty('completion', 'fake-response');

    (globalThis as any).fetch = originalFetch;
  });
});
