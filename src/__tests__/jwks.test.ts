import { vi, describe, it, expect } from 'vitest';

vi.mock('jose', () => {
  return {
    createRemoteJWKSet: (url: URL) => ({ url }),
    jwtVerify: async (token: string) => ({ payload: { sub: 'test-sub', aud: 'test-aud', token } }),
  };
});

describe('verifyWithJWKS', () => {
  it('returns payload from mocked jose.jwtVerify', async () => {
    const { verifyWithJWKS } = await import('../lib/jwks');
    const payload = await verifyWithJWKS('fake-token', 'https://example.com/jwks.json');
    expect(payload).toBeTruthy();
    expect(payload.sub).toBe('test-sub');
    expect(payload.aud).toBe('test-aud');
    expect((payload as any).token).toBe('fake-token');
  });
});
