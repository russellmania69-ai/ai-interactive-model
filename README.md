# React + TypeScript + Vite

[![codecov](https://codecov.io/gh/russellmania69-ai/ai-interactive-model/branch/main/graph/badge.svg?token=CODECOV_TOKEN)](https://codecov.io/gh/russellmania69-ai/ai-interactive-model)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Local development without Supabase
---------------------------------

If you don't have a Supabase project or don't want to configure env vars locally, the repo includes a
lightweight mock implementation to run the frontend without a backend. To use it:

- Copy the example env file and optionally enable the mock:

```bash
cp .env.local.example .env.local
# in .env.local set VITE_USE_SUPABASE_MOCK=true or run the dev server with the env var
VITE_USE_SUPABASE_MOCK=true npm run dev
```

You can enable a seeded mock to populate the UI with sample data using:

```bash
# run with seeded sample data
VITE_USE_SUPABASE_MOCK=seed npm run dev
```

Seed generator
----------------

You can regenerate example fixture data used as a starting point with the included script:

```bash
# generates scripts/seed-data.json
node scripts/seed-mock.js
```

The generated file is informational and can be used to extend the in-memory mock data or to craft additional fixtures.

If you want the running dev server to pick up the seed data automatically, run the generator before starting the dev server. The generator also writes a small script to `public/seed-data.js` which assigns the data to `window.__SEED_DATA`. Example workflow:

```bash
node scripts/seed-mock.js
VITE_USE_SUPABASE_MOCK=seed npm run dev
```

When these steps are followed, `createMockSupabase({ seeded: true })` will use the values from `window.__SEED_DATA` synchronously.

Auto-fetch fallback
-------------------

If you run the dev server without `public/seed-data.js` but the file `public/seed-data.json` exists, the mock will attempt to fetch `/seed-data.json` asynchronously and merge it into the in-memory seed data when available. This is a non-blocking fallback; generate the JSON before starting the server for the best developer experience.


Notes:
- The mock provides a minimal subset of Supabase APIs (auth, simple `from()` queries, storage, functions).
- The mock is intended for UI development only and should not be used in CI/production.
- For full functionality (auth, DB, storage), configure real Supabase credentials and set `VITE_SUPABASE_URL`
	and `VITE_SUPABASE_ANON_KEY` in `.env.local` or your deployment provider.

LLM Provider (optional)
-----------------------
You can set a default LLM provider used by client builds via `VITE_DEFAULT_LLM`.

Clients will now default to Claude Sonnet 4.5 when no `VITE_DEFAULT_LLM` is provided. To explicitly enable it for a build, set:

```
VITE_DEFAULT_LLM=claude-sonnet-4.5
```

Notes:
- The client-side helper at `src/lib/llm.ts` reads `VITE_DEFAULT_LLM` and falls back to `claude-sonnet-4.5` if unset.
- Do NOT put private Anthropic keys in the browser. Add `ANTHROPIC_API_KEY` and/or an API proxy on the server to perform Anthropic calls.
- `.env.production.example` includes an example `VITE_DEFAULT_LLM=claude-sonnet-4.5` entry for convenience.

If you'd like, I can open a PR that wires `DEFAULT_LLM` into specific backend request code or add a small serverless proxy example.
### Serverless proxy example (Vercel)

We've added a minimal Vercel serverless function example at `api/anthropic-proxy.ts` that demonstrates a secure pattern for calling Anthropic/Claude from the server (clients call this endpoint, server holds the secret API key).

Quick setup:

1. Add your Anthropic API key to your deployment provider as `ANTHROPIC_API_KEY` (do NOT commit this key).
2. (Optional) Set `VITE_DEFAULT_LLM=claude-sonnet-4.5` in build env or `DEFAULT_LLM=claude-sonnet-4.5` on the server.
3. Deploy to Vercel (or adapt the code to your provider's serverless format). The function forwards the client's `input` and optional `model` to Anthropic and returns the API response.

Client example (fetch from browser to your proxy):

```js
const resp = await fetch('/api/anthropic-proxy', {
	method: 'POST',
	headers: { 'Content-Type': 'application/json' },
	body: JSON.stringify({ input: 'Write a short poem about winter.' })
});
const json = await resp.json();
console.log(json);
```

Security notes:

- Never embed `ANTHROPIC_API_KEY` or other private keys in client-side code. Use server-side secrets.
- Adjust rate-limiting, authentication, and input sanitization in the proxy before using in production.

If you want, I can also add a Netlify / Vercel function variant or a tiny Express server example and open a PR.

Netlify function variant
-----------------------
There's a Netlify Functions example at `netlify/functions/anthropic-proxy.ts` that demonstrates a small proxy with:

- `PROXY_API_KEY` check: clients must send `x-api-key` header matching this server secret.
- In-memory rate limiting (per IP) controlled by `PROXY_RATE_LIMIT` and `PROXY_RATE_WINDOW_MS` env vars.

Set `ANTHROPIC_API_KEY` and `PROXY_API_KEY` in Netlify site settings before deploying. The Netlify function uses the same Anthropic request pattern as the Vercel example.

Express example
---------------
There's an Express example at `examples/express/anthropic-proxy-express.ts` intended for self-hosted deployments. Usage:

1. Set environment variables: `ANTHROPIC_API_KEY`, `PROXY_API_KEY`, and optionally `DEFAULT_LLM` or `VITE_DEFAULT_LLM`.
2. Start the example server (Node >=18 recommended):

```bash
node examples/express/anthropic-proxy-express.ts
```

3. Call `POST /proxy/anthropic` with header `x-api-key` and JSON body `{ "input": "..." }`.

The example includes a basic in-memory rate limiter; for production use add a robust rate-limiting and auth mechanism.



**Production readiness checklist**

- [ ] Rotate any exposed keys (Supabase key was removed from the repo history).
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to your repository Secrets.
- [ ] Verify CI (lint + build) passes on Pull Requests.
- [ ] Enable GitHub Pages (or connect Vercel/Netlify) and add deploy secrets.
- [ ] Add monitoring (Sentry / uptime) and alerting.
- [ ] Add tests and include them in CI.
- [ ] Review bundle sizes and implement further code-splitting if needed.

Quick local commands:

```bash
# install
npm ci

# dev
npm run dev

# build (production)
npm run build

# preview built site
npm run preview
```

Local production checks
-----------------------

To validate required runtime secrets locally before deploying, set them in your shell and run the project's production checks:

```bash
# replace with your real values for a local smoke test
export PROXY_JWT_SECRET='replace-me'
export ANTHROPIC_API_KEY='replace-me'

# verify required env vars
npm run check:prod

# run build to ensure bundling succeeds
npm run build

# optionally build the Docker image locally (requires Docker Desktop)
docker build -t ai-interactive-model:local .
```

GitHub Secrets
--------------

Add the following repository secrets (Settings → Secrets and variables → Actions) so CI and deploy workflows run successfully:

- `PROXY_JWT_SECRET`
- `ANTHROPIC_API_KEY`
- `VITE_SUPABASE_URL` (optional for full Supabase integration)
- `VITE_SUPABASE_ANON_KEY` (optional)

CI will now fail fast if `PROXY_JWT_SECRET` or `ANTHROPIC_API_KEY` are missing.

Deployment notes:

- GitHub Actions workflows are included: `ci.yml` (lint+build), `pages-deploy.yml` (GitHub Pages), and `netlify-deploy.yml` (Netlify). Each expects secrets to be configured in the GitHub repository settings.
- For Netlify: set `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` in GitHub Secrets.
- For GitHub Pages: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in GitHub Secrets.

Sentry (optional)

- To enable runtime error reporting add the following repository secrets in GitHub:
	- `VITE_SENTRY_DSN` — your client Sentry DSN (will enable Sentry at runtime)
	- `SENTRY_AUTH_TOKEN` — (optional) used by CI for release creation if you add release steps

Steps to add a secret in GitHub:
1. Go to your repository on GitHub → Settings → Secrets and variables → Actions.
2. Click "New repository secret" and add the secret name and value.
3. The app will initialize Sentry automatically at startup when `VITE_SENTRY_DSN` is present.

Additional Sentry setup notes

- Local example: copy `.env.production.example` to `.env.production` and set your DSN there for local production builds. This file is intentionally ignored by git.
- CI / Build: ensure `VITE_SENTRY_DSN` is present in your build environment so Vite embeds it at build time. Example for GitHub Actions (build step):

```yaml
- name: Build
	run: npm run build
	env:
		VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
```

- Hosting providers: set `VITE_SENTRY_DSN` in your host's environment variables (Vercel/Netlify/Render) and trigger a redeploy so the built site contains the DSN.
- Security: `VITE_SENTRY_DSN` is public (browser) and safe to embed; keep `SENTRY_AUTH_TOKEN` in GitHub Secrets for CI-only use.


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.



