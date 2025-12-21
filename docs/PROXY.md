Proxy services and secrets
=========================

This project includes small example server-side proxies (Express and Netlify) for safely using Anthropic/Claude without exposing API keys to browser clients.

Required secrets
- `ANTHROPIC_API_KEY` — your Anthropic/Claude API key (server-side only).
- `PROXY_JWT_SECRET` — optional: when set, the proxy requires a signed JWT in `Authorization: Bearer <token>`.
- `PROXY_ISSUER_ADMIN_KEY` — admin key used by the example JWT issuer to mint tokens (`x-admin-key`).
- `PROXY_API_KEY` — optional: when `PROXY_JWT_SECRET` is not set, the proxy falls back to this API key using `x-api-key` header.
- `REDIS_URL` — optional: when present, the proxy will use Redis-based rate limiting via that URL.

Rate limiting
- Environment variables: `PROXY_RATE_LIMIT` (default `20`) and `PROXY_RATE_WINDOW_MS` (default `60000`) control the rate limiter. When `REDIS_URL` is set, a Redis-backed counter is used; otherwise an in-memory fallback is used (not suitable for multi-instance production).

Local dev
- Start the issuer and proxy to try things locally:

```bash
# start issuer
PROXY_JWT_SECRET=test-jwt-secret PROXY_ISSUER_ADMIN_KEY=admin-key node examples/express/jwt-issuer-express.ts

# start proxy
PROXY_JWT_SECRET=test-jwt-secret ANTHROPIC_API_KEY=sk-test PROXY_RATE_LIMIT=5 node examples/express/anthropic-proxy-express.ts
```

- Request a token from the issuer:

```bash
curl -s -X POST http://localhost:3100/issuer/token -H "Content-Type: application/json" -H "x-admin-key: admin-key" -d '{"sub":"client-1"}'
```

- Use the token to call the proxy (example):

```bash
TOKEN=$(curl -s -X POST http://localhost:3100/issuer/token -H "Content-Type: application/json" -H "x-admin-key: admin-key" -d '{"sub":"client-1"}' | jq -r .token)
curl -s -X POST http://localhost:3000/proxy/anthropic -H "Content-Type: application/json" -H "Authorization: Bearer $TOKEN" -d '{"input":"hello"}'
```

CI
- A smoke workflow `.github/workflows/proxy-smoke.yml` runs unit and integration tests; set the repository secrets listed above in your GitHub repo settings to allow the workflow to exercise the proxy.

Security notes
- Never expose `ANTHROPIC_API_KEY` or `PROXY_JWT_SECRET` in client code or commit them to source. Use platform secrets (Vercel, Netlify, GitHub Actions secrets) for storage.
