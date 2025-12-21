# Sentry Setup (Client & Server)

This document explains how to wire Sentry for both the browser (client) and serverless/Node environments.

Prerequisites
- Add `SENTRY_DSN` (server) and `VITE_SENTRY_DSN` (client) to your secret store.
- For CI: add `SENTRY_DSN` and `VITE_SENTRY_DSN` in GitHub Secrets.

Client (browser)
- The app already calls `initSentry()` from `src/lib/sentry.ts` which reads `import.meta.env.VITE_SENTRY_DSN`.
- To enable Sentry in production builds, set the `VITE_SENTRY_DSN` env var in your build environment (e.g., GitHub Actions or during `npm run build`).

Example: set `VITE_SENTRY_DSN` in GitHub Actions workflow environment section:

```yaml
env:
  VITE_SENTRY_DSN: ${{ secrets.VITE_SENTRY_DSN }}
```

Server (Node / Serverless)
- Install `@sentry/node` in your deployment environment (not required in the dev UI client).

Package install example:

```bash
npm install @sentry/node @sentry/tracing --save
```

Snippet to initialize Sentry in server code (paste near top of `api/*.ts` or your Express server entry):

```ts
if (process.env.SENTRY_DSN) {
  try {
    const Sentry = await import('@sentry/node');
    const Tracing = await import('@sentry/tracing');
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1
    });
  } catch (e) {
    console.error('Sentry init failed', e);
  }
}
```

Notes
- Keep `VITE_SENTRY_DSN` separate from `SENTRY_DSN` to avoid exposing server DSN to the browser.
- Avoid logging secrets to console or CI logs.
- Configure sampling appropriately for production to control event volume and cost.
