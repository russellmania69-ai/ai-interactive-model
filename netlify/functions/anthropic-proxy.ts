// Netlify Function example with basic API-key auth and simple in-memory rate-limiting.
// Deploy to Netlify and set the following environment variables in the site settings:
// - ANTHROPIC_API_KEY (server secret)
// - PROXY_API_KEY (shared secret expected from clients in `x-api-key` header)

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const DEFAULT_MODEL = process.env.VITE_DEFAULT_LLM || process.env.DEFAULT_LLM || 'claude-sonnet-4.5';

import { initRateLimiter, isRateLimited } from '../../src/lib/proxy-rate-limit';
import jwt from 'jsonwebtoken';
import { verifyWithJWKS } from '../../src/lib/jwks';

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  await initRateLimiter();

  const jwtSecret = process.env.PROXY_JWT_SECRET;
  const providedKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';

  let clientId = providedKey || 'anon';
  const jwksUrl = process.env.PROXY_JWKS_URL;
  const auth = event.headers.authorization || event.headers.Authorization || '';
  if (jwksUrl && auth?.startsWith('Bearer ')) {
    const token = (auth || '').slice(7).trim();
    try {
      const payload = await verifyWithJWKS(token, jwksUrl);
      clientId = String(payload?.sub ?? payload?.id ?? clientId);
    } catch (e: any) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token (jwks)' }) };
    }
  } else if (jwtSecret) {
    const auth = event.headers.authorization || event.headers.Authorization || '';
    if (!auth.startsWith('Bearer ')) return { statusCode: 401, body: JSON.stringify({ error: 'Missing Bearer token' }) };
    const token = auth.slice(7).trim();
    try {
      const decoded = jwt.verify(token, jwtSecret) as any;
      clientId = String(decoded?.sub ?? decoded?.id ?? clientId);
    } catch (e: any) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Invalid token' }) };
    }
  } else {
    const proxyKey = process.env.PROXY_API_KEY;
    if (!proxyKey || providedKey !== proxyKey) {
      return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
    }
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || event.requestContext?.identity?.sourceIp || 'unknown';
  if (await isRateLimited(`${clientId}:${ip}`)) return { statusCode: 429, body: JSON.stringify({ error: 'Too Many Requests' }) };

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { statusCode: 501, body: JSON.stringify({ error: 'Anthropic API key not configured (ANTHROPIC_API_KEY)' }) };

  let body: any = {};
  try {
    body = event.body ? JSON.parse(event.body) : {};
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON body' }) };
  }

  const input = typeof body.input === 'string' ? body.input : String(body.input ?? '');
  const model = typeof body.model === 'string' && body.model.length > 0 ? body.model : DEFAULT_MODEL;
  if (!input) return { statusCode: 400, body: JSON.stringify({ error: 'Missing `input` in request body' }) };

  try {
    const resp = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ model, prompt: input, max_tokens: 800 })
    });
    const data = await resp.json();
    return { statusCode: resp.status, body: JSON.stringify(data) };
  } catch (err: any) {
    console.error('Anthropic proxy error:', err?.message || err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Proxy request failed', details: String(err?.message || err) }) };
  }
};

export { handler };
