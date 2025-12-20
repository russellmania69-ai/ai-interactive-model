# React + TypeScript + Vite

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

Notes:
- The mock provides a minimal subset of Supabase APIs (auth, simple `from()` queries, storage, functions).
- The mock is intended for UI development only and should not be used in CI/production.
- For full functionality (auth, DB, storage), configure real Supabase credentials and set `VITE_SUPABASE_URL`
	and `VITE_SUPABASE_ANON_KEY` in `.env.local` or your deployment provider.


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
