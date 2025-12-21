// Vercel serverless function example: a small secure proxy to call Anthropic APIs.
// DO NOT commit your Anthropic API key. Set `ANTHROPIC_API_KEY` in your deployment provider.

import type { VercelRequest, VercelResponse } from '@vercel/node';

const DEFAULT_MODEL = process.env.VITE_DEFAULT_LLM || process.env.DEFAULT_LLM || 'claude-sonnet-4.5';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(501).json({ error: 'Anthropic API key not configured on server (ANTHROPIC_API_KEY)' });
  }

  const body = req.body || {};
  const input = typeof body.input === 'string' ? body.input : String(body.input ?? '');
  const model = typeof body.model === 'string' && body.model.length > 0 ? body.model : DEFAULT_MODEL;

  if (!input) return res.status(400).json({ error: 'Missing `input` in request body' });

  try {
    // Replace the URL and payload as needed for the Anthropic API you intend to call.
    // Example uses Anthropic "complete" endpoint style; check Anthropic docs for exact payload/URL.
    const resp = await fetch('https://api.anthropic.com/v1/complete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        prompt: input,
        max_tokens: 800
      })
    });

    const data = await resp.json();
    return res.status(resp.status).json(data);
  } catch (err: any) {
    console.error('Anthropic proxy error:', err?.message || err);
    return res.status(500).json({ error: 'Proxy request failed', details: String(err?.message || err) });
  }
}
