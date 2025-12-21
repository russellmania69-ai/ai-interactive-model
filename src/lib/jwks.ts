/**
 * Verify a JWT using a remote JWKS endpoint.
 *
 * Notes:
 * - This helper uses a dynamic `import('jose')` so projects that don't enable
 *   `PROXY_JWKS_URL` aren't required to install `jose` as a dependency.
 * - If you do enable `PROXY_JWKS_URL` in production or CI, we recommend
 *   installing `jose` explicitly. See `docs/PROXY.md` for guidance.
 */
export async function verifyWithJWKS(token: string, jwksUrl: string) {
  // Dynamically import `jose` so tests/local runs that don't install it won't fail
  const { createRemoteJWKSet, jwtVerify } = await import('jose');
  const JWKS = createRemoteJWKSet(new URL(jwksUrl));
  // Allow common RSA algorithms; adjust as needed for your keys
  const { payload } = await jwtVerify(token, JWKS, { algorithms: ['RS256', 'PS256'] });
  return payload as Record<string, unknown>;
}
