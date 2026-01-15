import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

import IORedis from 'ioredis';
let RedisStoreRealtime = null;
try {
  const mod = await import('rate-limit-redis');
  RedisStoreRealtime = mod?.default || mod;
} catch (e) {
  RedisStoreRealtime = null;
}

const app = express();
app.use(express.static('public'));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const TAVUS_KEY = process.env.TAVUS_API_KEY;
const TAVUS_URL = process.env.TAVUS_API_URL || 'https://api.tavus.ai/v1/generate';
import cache from './lib/tavus-cache.js';
import metrics from './lib/metrics.js';

if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

// Simple SSE endpoint that proxies OpenAI streaming chat completions.
// Client opens an EventSource GET /api/realtime?prompt=... and receives
// server-sent "data: <text>\n\n" events carrying incremental assistant tokens.
// Configure optional Redis-backed rate limiter for realtime endpoint
const REALTIME_RATE_WINDOW_MS = Number(process.env.REALTIME_RATE_WINDOW_MS || 60_000);
const REALTIME_RATE_MAX = Number(process.env.REALTIME_RATE_MAX || 6);
let realtimeLimiter;
const REALTIME_REDIS = process.env.REDIS_URL || process.env.REDIS || process.env.REDIS_URI || '';
if (REALTIME_REDIS && RedisStoreRealtime) {
    try {
    const redisClientRealtime = new IORedis(REALTIME_REDIS);
    const storeRealtime = new RedisStoreRealtime({ client: redisClientRealtime, expiry: Math.ceil(REALTIME_RATE_WINDOW_MS / 1000), prefix: 'realtime_rl:' });
    // lazy import to avoid adding dependency to top-level
    const rlMod = await import('express-rate-limit');
    const rateLimit = rlMod?.default || rlMod;
    realtimeLimiter = rateLimit({ windowMs: REALTIME_RATE_WINDOW_MS, max: REALTIME_RATE_MAX, store: storeRealtime, standardHeaders: true, legacyHeaders: false, message: { error: 'Rate limit exceeded' } });
    console.log('Realtime rate limiter: using Redis store');
  } catch (err) {
    console.warn('Failed to initialize Redis realtime limiter, falling back to memory limiter', err);
    const rlMod = await import('express-rate-limit');
    const rateLimit = rlMod?.default || rlMod;
    realtimeLimiter = rateLimit({ windowMs: REALTIME_RATE_WINDOW_MS, max: REALTIME_RATE_MAX, message: { error: 'Rate limit exceeded' } });
  }
} else {
  const rlMod = await import('express-rate-limit');
  const rateLimit = rlMod?.default || rlMod;
  realtimeLimiter = rateLimit({ windowMs: REALTIME_RATE_WINDOW_MS, max: REALTIME_RATE_MAX, message: { error: 'Rate limit exceeded' } });
}

app.get('/api/realtime', realtimeLimiter, async (req, res) => {
  try { metrics.realtimeRequests.inc(); } catch (e) {}
/* realtime rate limiter middleware will be inserted below */
  const prompt = String(req.query.prompt || '');
  if (!prompt) return res.status(400).send('prompt required');

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders && res.flushHeaders();

  // Write a comment to establish the stream
  res.write(': connected\n\n');

  try {
    const body = {
      model: MODEL,
      messages: [
        { role: 'system', content: 'You are a helpful assistant. Respond concisely.' },
        { role: 'user', content: prompt }
      ],
      stream: true
    };

    const r = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const text = await r.text().catch(() => '');
      res.write(`event: error\ndata: ${JSON.stringify(text)}\n\n`);
      res.end();
      return;
    }

    const reader = r.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let assistantFull = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      // OpenAI streaming responses use lines like: `data: {json}\n\n`
      const parts = buffer.split(/\n\n/);
      // Keep last partial chunk in buffer
      buffer = parts.pop() || '';

      for (const part of parts) {
        const line = part.trim();
        if (!line.startsWith('data:')) continue;
        const payload = line.replace(/^data:\s*/, '');
        if (payload === '[DONE]') {
          // When streaming completes, optionally call Tavus to generate TTS audio
          if (TAVUS_KEY && assistantFull.trim()) {
            try {
              const avatarId = String(req.query.avatar || process.env.DEFAULT_TAVUS_AVATAR || '');
              const text = assistantFull;
              const hash = cache.hashText(text);
              const existing = cache.cacheExists(hash, 'mp3');
              if (existing) {
                res.write(`event: audio\ndata: ${JSON.stringify({ audio_url: cache.audioPublicUrl(hash, 'mp3'), cached: true })}\n\n`);
              } else {
                const tavusBody = {
                  avatar_id: avatarId,
                  input: { text },
                  options: {}
                };
                const tr = await fetch(TAVUS_URL, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${TAVUS_KEY}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify(tavusBody)
                });
                let tavusData = null;
                try { tavusData = await tr.json(); } catch (e) { tavusData = null; }
                if (tr.ok && tavusData) {
                  const audio_url = tavusData?.audio_url || tavusData?.result?.audio_url || tavusData?.data?.audio_url || null;
                  const audio_b64 = tavusData?.audio_base64 || tavusData?.result?.audio_base64 || null;
                  if (audio_url) {
                    const ar = await fetch(audio_url);
                    if (ar.ok) {
                      const buf = Buffer.from(await ar.arrayBuffer());
                      cache.saveAudioBuffer(hash, buf, 'mp3');
                      res.write(`event: audio\ndata: ${JSON.stringify({ audio_url: cache.audioPublicUrl(hash, 'mp3'), raw: tavusData })}\n\n`);
                    } else {
                      res.write(`event: audio_error\ndata: ${JSON.stringify({ status: ar.status })}\n\n`);
                    }
                  } else if (audio_b64) {
                    const b64 = String(audio_b64).replace(/^data:audio\/[a-zA-Z0-9.+-]+;base64,/, '');
                    const buf = Buffer.from(b64, 'base64');
                    cache.saveAudioBuffer(hash, buf, 'mp3');
                    res.write(`event: audio\ndata: ${JSON.stringify({ audio_url: cache.audioPublicUrl(hash, 'mp3'), raw: tavusData })}\n\n`);
                  } else {
                    res.write(`event: audio_error\ndata: ${JSON.stringify({ raw: tavusData })}\n\n`);
                  }
                } else {
                  res.write(`event: audio_error\ndata: ${JSON.stringify({ status: tr.status, body: tavusData })}\n\n`);
                }
              }
            } catch (e) {
              res.write(`event: audio_error\ndata: ${JSON.stringify({ error: String(e) })}\n\n`);
            }
          }
          res.write('event: done\ndata: [DONE]\n\n');
          res.end();
          return;
        }
        try {
          const j = JSON.parse(payload);
          // delta may be nested under choices[].delta.content
          const ch = j.choices && j.choices[0];
          let token = '';
          if (ch) {
            // handle delta content (streaming)
            token = (ch.delta && ch.delta.content) || '';
            // fallback: older completions shape
            token = token || (ch.message && ch.message.content) || '';
          }
          if (token) {
            // send as SSE data event
            // escape newlines
            const safe = token.replace(/\n/g, '\\n');
            res.write(`data: ${safe}\n\n`);
            assistantFull += token;
          }
        } catch (e) {
          // ignore parse errors for partial lines
        }
      }
    }

    // stream ended
    res.end();
  } catch (err) {
    console.error('realtime proxy error', err);
    res.write(`event: error\ndata: ${JSON.stringify(String(err))}\n\n`);
    res.end();
  }
});

// Expose Prometheus metrics (if metrics library loaded).
// Protect metrics with `METRICS_SECRET` env var — if not provided, metrics endpoint is not registered.
const METRICS_SECRET = process.env.METRICS_SECRET || '';
try {
  if (METRICS_SECRET) {
    app.get('/metrics', (req, res) => {
      const secretHeader = (req.headers['x-metrics-secret'] || req.headers['x-admin-secret'] || '').toString();
      if (!secretHeader || secretHeader !== METRICS_SECRET) {
        return res.status(403).send('forbidden');
      }
      try { return metrics.metricsMiddleware(req, res); } catch (e) { return res.status(500).send('metrics error'); }
    });
  } else {
    console.warn('METRICS_SECRET not set: /metrics endpoint will NOT be exposed');
  }
} catch (e) {
  // ignore if metrics isn't available
}

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Realtime proxy listening on ${port}`));

// Lightweight healthcheck
app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
