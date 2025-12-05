## Deploy Supabase Edge Functions via GitHub Actions

This repository includes a GitHub Actions workflow to deploy the Supabase Edge Functions and set the `STRIPE_SECRET_KEY` secret from GitHub Secrets.

Required GitHub repository secrets (add these at repository Settings → Secrets → Actions):

- `SUPABASE_ACCESS_TOKEN` - a Supabase access token with permissions to deploy functions and set secrets. You can generate this in the Supabase Dashboard under Project Settings → Service Key or use a personal access token.
- `SUPABASE_PROJECT_REF` - your Supabase project ref (example: `wnytflqoxaxglgetafqn`).
- `STRIPE_SECRET_KEY` - your Stripe secret key (`sk_test_...` or `sk_live_...`).

How it works:
- The workflow installs the Supabase CLI, logs in with `SUPABASE_ACCESS_TOKEN`, sets the `STRIPE_SECRET_KEY` secret in the project, and deploys the `create-stripe-checkout` and `verify-stripe-session` functions.

Triggering the workflow:
- Push to `main` or run the workflow manually from the Actions tab via `workflow_dispatch`.

After deploy:
- Check the Supabase Dashboard → Edge Functions to verify the deployed functions and inspect logs and invocation metrics.
