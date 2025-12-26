# Deploy Secrets

This project requires repository secrets to perform production deploys to Netlify and Vercel. On `main`, the CI workflows will fail if the required secrets are not set to prevent accidental or misconfigured deploys.

Required secrets:

- `VITE_SUPABASE_URL` — Supabase URL used at build time (public) for static build env.
- `VITE_SUPABASE_ANON_KEY` — Supabase anon key used at build time.

Netlify (set both):
- `NETLIFY_AUTH_TOKEN` — Personal access token or deploy token with site write access.
- `NETLIFY_SITE_ID` — The Netlify site ID to deploy to.

Vercel (set all):
- `VERCEL_TOKEN` — Vercel personal token with deployment privileges.
- `VERCEL_ORG_ID` — Vercel organization ID (used by the CLI).
- `VERCEL_PROJECT_ID` — Vercel project scope/ID.

Notes:
- Add these secrets under the repository Settings → Secrets → Actions in GitHub.
- For Netlify, create a deploy token or use a personal token and verify the token has access to the target site.
- For Vercel, create a personal token in your Vercel account and retrieve the org/project IDs from the Vercel dashboard.
- CI will run `npm run build` and requires `VITE_SUPABASE_*` values to be present for successful build if the app depends on them; consider adding placeholder values for CI if needed.

If you'd like, I can open a PR with these changes (the workflows were updated to fail on `main` when secrets are missing and this document was added).