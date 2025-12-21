import type { Application, ErrorRequestHandler } from 'express';

/**
 * Attach Sentry request/tracing handlers to an Express app if `SENTRY_DSN` is configured.
 * Returns a function to register the error handler (call after your routes), or null if not attached.
 */
export async function attachSentryToExpress(app: Application): Promise<(() => void) | null> {
  try {
    const dsn = process.env.SENTRY_DSN || process.env.VITE_SENTRY_DSN;
    if (!dsn) return null;

    const Sentry = await import('@sentry/node');
    await import('@sentry/tracing');

    try {
      Sentry.init({ dsn, tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE || 0.05) });
    } catch (e) {
      // initialization errors should not crash the app
       
      console.error('Sentry init error', e);
      return null;
    }

    // Register request/tracing handlers early in the middleware chain
    if (Sentry.Handlers && typeof Sentry.Handlers.requestHandler === 'function') {
      app.use(Sentry.Handlers.requestHandler());
    }
    if (Sentry.Handlers && typeof Sentry.Handlers.tracingHandler === 'function') {
      app.use(Sentry.Handlers.tracingHandler());
    }

    // Return a function to register the error handler; callers should call this AFTER routes are mounted
    const registerErrorHandler = () => {
      if (Sentry.Handlers && typeof Sentry.Handlers.errorHandler === 'function') {
        // Error handler should be the last handler
        app.use(Sentry.Handlers.errorHandler() as ErrorRequestHandler);
      }
    };

    return registerErrorHandler;
  } catch (err) {
     
    console.error('Sentry Express attach failed', err);
    return null;
  }
}

export default attachSentryToExpress;
