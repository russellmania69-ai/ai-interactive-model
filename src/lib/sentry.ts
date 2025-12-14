export function initSentry(): void {
  try {
    const dsn = (import.meta as { env?: { VITE_SENTRY_DSN?: string } }).env?.VITE_SENTRY_DSN;
    if (!dsn) return;
    // Lazy import to avoid bundling if not used
    import('@sentry/react')
      .then((SentryModule) => {
        return import('@sentry/tracing').then(() => SentryModule);
      })
      .then((SentryModule) => {
        type SentryLike = { init: (opts: { dsn: string; integrations?: unknown[]; tracesSampleRate?: number }) => void };
        const Sentry = SentryModule as unknown as SentryLike;
        Sentry.init({
          dsn,
          integrations: [],
          tracesSampleRate: 0.0,
        });
      })
      .catch((e: unknown) => console.error('Sentry load failed', e));
  } catch (_e) {
    // no-op
  }
}
