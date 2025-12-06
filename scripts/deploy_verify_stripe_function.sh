#!/usr/bin/env bash
set -euo pipefail

# Deploy verify-stripe-session Supabase Edge Function
# Usage:
#   PROJECT_REF=<your-project-ref> STRIPE_SECRET_KEY=<sk_test_or_live_...> ./scripts/deploy_verify_stripe_function.sh

PROJECT_REF="${PROJECT_REF:-}"
if [ -z "$PROJECT_REF" ]; then
  echo "Error: PROJECT_REF is not set. Usage: PROJECT_REF=<your-project-ref> STRIPE_SECRET_KEY=<sk_...> $0"
  exit 1
fi

if [ -z "${STRIPE_SECRET_KEY:-}" ]; then
  echo "Error: STRIPE_SECRET_KEY env var is not set. Provide STRIPE_SECRET_KEY=<sk_...>"
  exit 1
fi

echo "Setting secret STRIPE_SECRET_KEY for Supabase project: $PROJECT_REF"
supabase secrets set STRIPE_SECRET_KEY="$STRIPE_SECRET_KEY" --project-ref "$PROJECT_REF"

echo "Deploying function: verify-stripe-session"
supabase functions deploy verify-stripe-session --project-ref "$PROJECT_REF"

echo "Deployment finished. Listing functions for project: $PROJECT_REF"
supabase functions list --project-ref "$PROJECT_REF" || true

echo
echo "Example test (replace with your project domain or functions domain):"
echo "curl -X POST \"https://<your-project>.functions.supabase.co/verify-stripe-session\" -H 'Content-Type: application/json' -d '{\"sessionId\":\"cs_test_...\"}'"
