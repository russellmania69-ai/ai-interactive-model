// Netlify Function example with basic API-key auth and simple in-memory rate-limiting.
// Deploy to Netlify and set the following environment variables in the site settings:
// - ANTHROPIC_API_KEY (server secret)
// - PROXY_API_KEY (shared secret expected from clients in `x-api-key` header)

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

const DEFAULT_MODEL = process.env.VITE_DEFAULT_LLM || process.env.DEFAULT_LLM || 'claude-sonnet-4.5';

// Simple in-memory rate limiter (per IP). Not suitable for multi-instance production.
const RATE_LIMIT = Number(process.env.PROXY_RATE_LIMIT || '5'); // requests
const RATE_WINDOW_MS = Number(process.env.PROXY_RATE_WINDOW_MS || String(60 * 1000));
const hits: Record<string, number[]> = {};

function isRateLimited(key: string) {
  const now = Date.now();
  hits[key] = (hits[key] || []).filter((t) => now - t <= RATE_WINDOW_MS);
  if (hits[key].length >= RATE_LIMIT) return true;
  hits[key].push(now);
  return false;
}

const handler: Handler = async (event: HandlerEvent, _context: HandlerContext) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };

  const proxyKey = process.env.PROXY_API_KEY;
  const providedKey = event.headers['x-api-key'] || event.headers['X-Api-Key'] || '';
  if (!proxyKey || providedKey !== proxyKey) {
    return { statusCode: 401, body: JSON.stringify({ error: 'Unauthorized' }) };
  }

  const ip = event.headers['x-forwarded-for'] || event.headers['x-nf-client-connection-ip'] || event.requestContext?.identity?.sourceIp || 'unknown';
  if (isRateLimited(ip)) return { statusCode: 429, body: JSON.stringify({ error: 'Too Many Requests' }) };

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
