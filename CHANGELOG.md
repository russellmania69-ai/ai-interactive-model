# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2025-12-21
- Added seeded Supabase mock for local development (`VITE_USE_SUPABASE_MOCK=seed`).
  - `src/lib/supabase-mock.ts` now supports seeded in-memory tables for `user_profiles`, `subscriptions`, `chat_sessions`, and `saved_images`.
  - Wired seeded mock mode in `src/lib/supabase.ts` when `VITE_USE_SUPABASE_MOCK=seed`.
  - Documentation updated in `README.md` to show `VITE_USE_SUPABASE_MOCK=seed` usage.

## [v0.1.1] - 2025-12-21
- Improvements and tooling for local development and CI:
  - Added `scripts/seed-mock.js` to generate `public/seed-data.json` and `public/seed-data.js` for synchronous seeded data in dev.
  - `src/lib/supabase-mock.ts` extended to accept `options.seeded`, read `window.__SEED_DATA`, and auto-fetch `/seed-data.json` as a non-blocking fallback.
  - Added unit tests for the seeded mock (`src/__tests__/supabase-mock.test.ts`, `src/__tests__/supabase-mock-more.test.ts`) and increased coverage to ~72% for the mock file.
  - CI updated to run Vitest with coverage, upload coverage artifacts, and post to Codecov; added coverage thresholds in `vitest.config.ts`.
  - Created seed generator PRs and merged changes into `main`; added CHANGELOG/README updates and a `v0.1.0` release earlier.

