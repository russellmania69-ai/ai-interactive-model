# Changelog

All notable changes to this project will be documented in this file.

## [v0.1.0] - 2025-12-21
- Added seeded Supabase mock for local development (`VITE_USE_SUPABASE_MOCK=seed`).
  - `src/lib/supabase-mock.ts` now supports seeded in-memory tables for `user_profiles`, `subscriptions`, `chat_sessions`, and `saved_images`.
  - Wired seeded mock mode in `src/lib/supabase.ts` when `VITE_USE_SUPABASE_MOCK=seed`.
  - Documentation updated in `README.md` to show `VITE_USE_SUPABASE_MOCK=seed` usage.
