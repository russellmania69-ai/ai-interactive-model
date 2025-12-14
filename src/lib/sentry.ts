export function initSentry() {
  try {
    const dsn = (import.meta as any).env?.VITE_SENTRY_DSN as string | undefined;
    if (!dsn) return;
    // Lazy import to avoid bundling if not used
    // @ts-ignore
    import('@sentry/react').then((Sentry) => {
      // @ts-ignore
      import('@sentry/tracing').then(() => {
        Sentry.init({
          dsn,
          integrations: [],
          tracesSampleRate: 0.0,
        });
      });
    }).catch((e) => console.error('Sentry load failed', e));
  } catch (e) {
    // no-op
  }
}
