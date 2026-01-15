#!/usr/bin/env bash
set -euo pipefail

echo "Running release preparation checks..."

echo "1) Run tests"
npm test

echo "2) Run lint"
npm run lint

echo "3) Build production assets"
npm run build

if [ -n "${TAVUS_S3_BUCKET:-}" ] || [ -n "${REDIS_URL:-}" ]; then
  echo "4) Optional prod smoke checks (S3/Redis)"
  npm run smoke:prod || { echo "Smoke checks failed"; exit 2; }
else
  echo "Skipping prod smoke checks (no S3 or Redis configured)"
fi

echo "Release preparation completed. Create a tag and open a PR to merge into main when ready."
