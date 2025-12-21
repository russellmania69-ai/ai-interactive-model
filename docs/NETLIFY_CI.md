Netlify CI deployment
=====================

This project includes a GitHub Actions workflow to deploy the production build to Netlify.

Required repository secrets
- `NETLIFY_AUTH_TOKEN` — a CI token generated with `netlify login:ci` (non-interactive token).
- `NETLIFY_SITE_ID` — your Netlify site ID (found in the Site settings / Site information).

How to create a CI token (local)
1. Install the Netlify CLI locally:

```bash
npm install -g netlify-cli
# or: npx netlify-cli
```

2. Generate a non-interactive token for CI:

```bash
netlify login:ci
# The command prints a token you should copy.
```

3. Add the token and site id to GitHub repository secrets:

- Go to your repository -> Settings -> Secrets and variables -> Actions -> New repository secret.
- Add `NETLIFY_AUTH_TOKEN` with the token value, and `NETLIFY_SITE_ID` with your site id.

CI behavior
- The workflow `.github/workflows/netlify-deploy.yml` now checks for the presence of these secrets and will fail early with a helpful message if they are missing.
- The workflow uses `npx netlify-cli deploy --site "$NETLIFY_SITE_ID" --auth "$NETLIFY_AUTH_TOKEN" --prod --dir=./dist` to perform a non-interactive deploy.

Manual local deploy (without GitHub Actions)

```bash
export NETLIFY_AUTH_TOKEN="<token>"
export NETLIFY_SITE_ID="<site-id>"
npx netlify-cli deploy --site "$NETLIFY_SITE_ID" --auth "$NETLIFY_AUTH_TOKEN" --prod --dir=./dist
```

Notes
- Do not commit tokens or site IDs to source control. Use GitHub repository secrets for CI.
- If you need an interactive login for testing, run `netlify login` locally, but CI requires `login:ci` token.
