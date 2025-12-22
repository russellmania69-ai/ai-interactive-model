export async function initServerSentry(): Promise<void> {
  try {
    const dsn = process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;
    if (!dsn) return;
    const Sentry = await import('@sentry/node');
    const Tracing = await import('@sentry/tracing');
    try {
      Sentry.init({
        dsn,
        tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05),
      });
      // Optionally configure tracing for HTTP or Express if available
      // but avoid importing heavy integrations unless used by the server.
    } catch (err) {
      // initialization errors should not crash the server
       
      console.error('Sentry server init failed', err);
    }
  } catch (err) {
     
    console.error('Sentry server load failed', err);
  }
}

export default initServerSentry;
