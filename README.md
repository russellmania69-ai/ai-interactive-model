# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

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


# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
