import express from 'express';
import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { initRateLimiter, isRateLimited } from '../../src/lib/proxy-rate-limit';

// Small Express proxy example. This is for self-hosted use (e.g., a small server).
// Environment vars required:
// - ANTHROPIC_API_KEY (server secret)
// - PROXY_API_KEY (shared secret expected from clients in `x-api-key` header)
// Optional:
// - VITE_DEFAULT_LLM or DEFAULT_LLM

const DEFAULT_MODEL = process.env.VITE_DEFAULT_LLM || process.env.DEFAULT_LLM || 'claude-sonnet-4.5';

// Rate limiter is handled by `src/lib/proxy-rate-limit` which supports Redis or in-memory fallback.

const app = express();
app.use(express.json());

app.post('/proxy/anthropic', async (req: Request, res: Response) => {
  await initRateLimiter();

  const jwtSecret = process.env.PROXY_JWT_SECRET;
  const providedKey = req.header('x-api-key') || '';

  let clientId = providedKey || 'anon';
  if (jwtSecret) {
    const auth = req.header('authorization') || '';
    if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing Bearer token' });
    const token = auth.slice(7).trim();
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      clientId = String(decoded?.sub ?? decoded?.id ?? clientId);
    } catch (e: any) {
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
    const resp = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({ model, prompt: input, max_tokens: 800 })
    });
    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err: any) {
    console.error('Anthropic proxy error:', err?.message || err);
    return res.status(500).json({ error: 'Proxy request failed', details: String(err?.message || err) });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3000);
  app.listen(port, () => console.log(`Anthropic proxy (Express) listening on http://localhost:${port}`));
}

export default app;
