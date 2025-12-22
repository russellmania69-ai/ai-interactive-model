import { describe, it, expect, vi } from 'vitest'

vi.mock('jose', () => {
  const jwtVerify = vi.fn(async (token: string, jwks: unknown, _opts?: Record<string, unknown>) => {
    return { payload: { sub: 'test-sub', iss: 'test-iss' } }
  })
  const createRemoteJWKSet = (url: URL) => ({ url })
  return { createRemoteJWKSet, jwtVerify }
})

import { verifyWithJWKS } from '../lib/jwks'

describe('verifyWithJWKS', () => {
  it('uses jose to verify token and returns payload', async () => {
    const payload = await verifyWithJWKS('fake-token', 'https://example.com/.well-known/jwks.json')
    expect(payload).toEqual(expect.objectContaining({ sub: 'test-sub', iss: 'test-iss' }))
  })
})
