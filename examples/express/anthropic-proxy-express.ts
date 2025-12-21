import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { isRateLimited } from '../../src/lib/proxy-rate-limit';
import { verifyWithJWKS } from '../../src/lib/jwks';
import fetchWithRetry from '../../src/lib/fetch-with-retry';
import attachSentryToExpress from '../../src/lib/express-middleware/sentry-express';

// Minimal, valid Express example used for documentation / local testing.
const DEFAULT_MODEL = process.env.VITE_DEFAULT_LLM || process.env.DEFAULT_LLM || 'claude-sonnet-4.5';

const app = express();
app.use(express.json());

// Attach Sentry (no-op if not configured)
const _sentryRegisterPromise = attachSentryToExpress(app);

app.post('/proxy', async (req: Request, res: Response) => {
  const auth = String(req.headers.authorization || '');
  const providedKey = String(req.headers['x-api-key'] || '');

  // Basic auth: prefer JWKS, then JWT secret, then shared proxy key
  let clientId = 'anonymous';
  const jwksUrl = process.env.PROXY_JWKS_URL;
  const jwtSecret = process.env.PROXY_JWT_SECRET;

  if (jwksUrl && auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    try {
      const payload = await verifyWithJWKS(token, jwksUrl);
      clientId = String((payload as Record<string, unknown>)?.sub ?? clientId);
    } catch {
      return res.status(401).json({ error: 'Invalid token (jwks)' });
    }
  } else if (jwtSecret && auth.startsWith('Bearer ')) {
    const token = auth.slice(7).trim();
    try {
      const decoded = jwt.verify(token, jwtSecret) as Record<string, unknown>;
      clientId = String(decoded?.sub ?? clientId);
    } catch {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    const proxyKey = process.env.PROXY_API_KEY;
    if (!proxyKey || providedKey !== proxyKey) return res.status(401).json({ error: 'Unauthorized' });
  }

  const ip = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
  if (await isRateLimited(`${clientId}:${ip}`)) return res.status(429).json({ error: 'Too Many Requests' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(501).json({ error: 'Anthropic API key not configured (ANTHROPIC_API_KEY)' });

  const input = typeof req.body.input === 'string' ? req.body.input : String(req.body.input ?? '');
  const model = typeof req.body.model === 'string' && req.body.model.length ? req.body.model : DEFAULT_MODEL;
  if (!input) return res.status(400).json({ error: 'Missing `input` in request body' });

  try {
    const resp = await fetchWithRetry('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, prompt: input, max_tokens: 800 }),
      timeoutMs: 8000,
      retries: 2,
      backoffMs: 300
    });
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err: unknown) {
    const e = err as { message?: string };
    console.error('Anthropic proxy error:', e?.message ?? err);
    return res.status(500).json({ error: 'Proxy request failed', details: String(e?.message ?? String(err)) });
  }
});

export function createServer(port = Number(process.env.PORT || 3000)) {
  return app.listen(port, () => console.log(`Anthropic proxy (Express) listening on http://localhost:${port}`));
}

if (require.main === module) {
  const server = createServer();
  const shutdown = () => {
    console.log('Shutting down Anthropic proxy...');
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

// Register Sentry error handler after routes are set up
(async () => {
  const register = await _sentryRegisterPromise;
  if (typeof register === 'function') register();
})();

export default app;
