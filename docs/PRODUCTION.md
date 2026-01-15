# Production Readiness Checklist

This document lists required environment variables, hardening steps, and recommended deployment actions to run the project in production.

## Required environment variables
- `OPENAI_API_KEY` - OpenAI API key for streaming/chat completions
- `OPENAI_MODEL` - (optional) default model (e.g. `gpt-4o-mini`)
- `TAVUS_API_KEY` - Tavus API key for TTS
- `TAVUS_API_URL` - (optional) Tavus API base URL
- `TAVUS_ADMIN_SECRET` - secret used to protect Tavus admin endpoints
- `METRICS_SECRET` - secret used to protect `/metrics`
- `DEFAULT_TAVUS_AVATAR` - default avatar id for Tavus
- `REDIS_URL` - (recommended) Redis URL for distributed rate limiting
- `TAVUS_RATE_WINDOW_MS`, `TAVUS_RATE_MAX` - rate limiter config
- `REALTIME_RATE_WINDOW_MS`, `REALTIME_RATE_MAX` - rate limiter config

## Minimal Hardening
1. Pin Node.js runtime to `>=20` (see `package.json` engines).
2. Use a secure secret store (platform vault, GitHub Actions secrets, Vercel/Netlify env) for all API keys and secrets.
3. Configure `METRICS_SECRET` and ensure Prometheus scrapers use it in the `x-metrics-secret` header.
4. Enable Redis and set `REDIS_URL` to use distributed rate limiting for `/api/realtime` and `/api/tavus/*`.
5. Move file-based cache (`public/tavus-cache/`) to durable object storage + CDN (S3/GCS + CloudFront/Cloudflare).
6. Restrict `/api/tavus/cache/purge` and `/metrics` to internal networks or require secrets as implemented.

## Observability
- Configure Prometheus to scrape `/metrics` using the `x-metrics-secret` header.
- Set up Sentry or other error tracking for server errors.

## Testing
- Add Playwright integration tests that exercise the realtime SSE flow and the Tavus proxy (use mocks or staging keys).
- Run load tests against SSE and Tavus proxy to tune rate limits.

## Deployment
- Build assets with `npm run build` and serve via CDN/static host.
- Deploy server components to Node 20+ runtime (AWS/GCP/Heroku/Render/Vercel functions) with env vars configured.

### S3 cache example
If you enable S3-backed caching, set these env vars:

- `TAVUS_S3_BUCKET` - the S3 bucket name
- `AWS_REGION` - AWS region for the bucket
- `TAVUS_S3_PUBLIC_URL` - public root URL for the bucket (e.g. https://cdn.example.com)

Bucket lifecycle rules are recommended to expire old audio files automatically.

### Redis rate limiter
For distributed rate limiting across instances, set `REDIS_URL` and ensure `rate-limit-redis` dependency is available. Example:

- `REDIS_URL=redis://:password@redis-host:6379/0`


## Post-deploy smoke checks
- `GET /health` should return 200 JSON.
- `GET /metrics` should require the `x-metrics-secret` header.
- Verify caching path (object storage) and that cached audio URLs are served behind CDN.

For help automating any of these steps, tell me which item to work on first.

## Running E2E smoke locally

1. Build the app and serve `dist` on port `4173` (or set `E2E_BASE_URL`):

```bash
npm run build
npx http-server ./dist -p 4173 &
```

2. Set `METRICS_SECRET` if you enabled metrics protection:

```bash
export METRICS_SECRET=your-secret
```

3. Run Playwright smoke tests:

```bash
npx playwright test e2e/health.spec.ts --project=chromium
```

The CI workflow already runs similar smoke checks after build.
