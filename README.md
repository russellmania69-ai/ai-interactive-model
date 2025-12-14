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

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.
