# Release / Production Deployment Guide

This guide collects the manual steps and automated helpers to prepare and deploy a production release.

Prerequisites
- Node 20+ installed locally or in CI
- Secrets configured in your target environment (OPENAI_API_KEY, TAVUS_API_KEY, METRICS_SECRET, TAVUS_S3_BUCKET, AWS credentials, REDIS_URL, etc.)

Commands (local)
1. Run the release preparation script (tests, lint, build, optional S3/Redis smoke):

```bash
npm run release:prepare
```

2. Build and publish static assets to your CDN or static host (example using aws cli):

```bash
# build already run by release:prepare
aws s3 sync dist/ s3://your-bucket/ --delete --acl public-read
# Invalidate CDN/CloudFront if needed
```

3. Deploy server components (example for Render/Heroku/Vercel):
- Push the `main` branch with env vars configured in the platform's dashboard.

CI Guidance
- The repository includes `.github/workflows/prod-smoke.yml` to run smoke checks against S3 and Redis on-demand or on `main`.
- `ci.yml` contains pinned Node 20 setup and smoke checks for `/health` and `/metrics`.

Post-deploy checks
- `GET /health` should return JSON `{ ok: true }`.
- `GET /metrics` should require `x-metrics-secret` header and return Prometheus metrics.
- Verify cached audio URLs are served from your configured public URL or CDN.

Rollback
- If the release causes issues, revert the main branch to the previous tag/commit and re-deploy.

Security
- Keep credentials in a secure secret store and rotate regularly.
- Limit access to `/metrics` and admin endpoints via firewall or internal-only networks.

For help automating any of these steps (CDN invalidation, automated tagging, or infra IaC), tell me which piece to implement next.
