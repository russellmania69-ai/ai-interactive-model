import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import IORedis from 'ioredis';
import metrics from '@/lib/metrics';
let RedisStore = null;
try {
  const mod = await import('rate-limit-redis');
  RedisStore = mod?.default || mod;
} catch (e) {
  RedisStore = null;
}
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import cache from '@/lib/tavus-cache';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const TAVUS_KEY = process.env.TAVUS_API_KEY;
const TAVUS_URL = process.env.TAVUS_API_URL || 'https://api.tavus.ai/v1/generate';
const TAVUS_CACHE_TTL_DAYS = Number(process.env.TAVUS_CACHE_TTL_DAYS || 7);
const TAVUS_ADMIN_SECRET = process.env.TAVUS_ADMIN_SECRET || '';

if (!TAVUS_KEY) {
  console.warn('Warning: TAVUS_API_KEY is not set — /api/tavus will return 500');
}

// Simple per-IP rate limiter to protect Tavus API usage (configurable via env)
const windowMs = Number(process.env.TAVUS_RATE_WINDOW_MS || 60_000);
const maxRequests = Number(process.env.TAVUS_RATE_MAX || 6);
let tavusLimiter;
const REDIS_URL = process.env.REDIS_URL || process.env.REDIS || process.env.REDIS_URI || '';
if (REDIS_URL && RedisStore) {
  try {
    const redisClient = new IORedis(REDIS_URL);
    const store = new RedisStore({ client: redisClient, expiry: Math.ceil(windowMs / 1000), prefix: 'tavus_rl:' });
    tavusLimiter = rateLimit({
      windowMs,
      max: maxRequests,
      message: { error: 'Rate limit exceeded' },
      standardHeaders: true,
      legacyHeaders: false,
      store
    });
    console.log('Tavus rate limiter: using Redis store');
  } catch (err) {
    console.warn('Failed to initialize Redis rate limiter, falling back to memory limiter', err);
    tavusLimiter = rateLimit({ windowMs, max: maxRequests, message: { error: 'Rate limit exceeded' } });
  }
} else {
    tavusLimiter = rateLimit({ windowMs, max: maxRequests, message: { error: 'Rate limit exceeded' },
      handler: (req, res) => {
        try { metrics.tavusRateLimited.inc(); } catch (e) {}
        res.status(429).json({ error: 'Rate limit exceeded' });
      }
    });
}

// POST /api/tavus/generate
// body: { avatarId: string, input: { text: string }, options?: object }
app.post('/api/tavus/generate', tavusLimiter, async (req, res) => {
  try { metrics.tavusRequests.inc(); } catch (e) {}
  if (!TAVUS_KEY) return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  const { avatarId, input, options } = req.body || {};
  if (!avatarId || !input || typeof input.text !== 'string') {
    return res.status(400).json({ error: 'avatarId and input.text required' });
  }

  try {
    const text = String(input.text || '');
    const hash = cache.hashText(text);
    // prefer mp3; adapt if Tavus returns other formats
    const existing = cache.cacheExists(hash, 'mp3');
    if (existing) {
      try { metrics.tavusCacheHits.inc(); } catch (e) {}
      return res.json({ ok: true, cached: true, audio_url: cache.audioPublicUrl(hash, 'mp3') });
    }
    try { metrics.tavusCacheMisses.inc(); } catch (e) {}

    const payload = {
      avatar_id: avatarId,
      input: { text },
      options: options || {}
    };

    const r = await fetch(TAVUS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TAVUS_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await r.json().catch(async () => {
      const txt = await r.text().catch(() => '');
      return { raw: txt };
    });

    if (!r.ok) {
      return res.status(r.status || 500).json({ error: data || 'Tavus API error' });
    }

    // Save audio if present (either audio_url or base64)
    try {
      const audio_url = data?.audio_url || data?.result?.audio_url || data?.data?.audio_url || null;
      const audio_b64 = data?.audio_base64 || data?.result?.audio_base64 || null;
      if (audio_url) {
        // fetch remote audio and cache
        const ar = await fetch(audio_url);
        if (ar.ok) {
          const buf = Buffer.from(await ar.arrayBuffer());
          cache.saveAudioBuffer(hash, buf, 'mp3');
          return res.json({ ok: true, audio_url: cache.audioPublicUrl(hash, 'mp3'), raw: data });
        }
      } else if (audio_b64) {
        // decode and save
        const b64 = String(audio_b64).replace(/^data:audio\/[a-zA-Z0-9.+-]+;base64,/, '');
        const buf = Buffer.from(b64, 'base64');
        cache.saveAudioBuffer(hash, buf, 'mp3');
        return res.json({ ok: true, audio_url: cache.audioPublicUrl(hash, 'mp3'), raw: data });
      }
    } catch (e) {
      try { metrics.tavusErrors.inc(); } catch (err) {}
      console.warn('Failed to cache audio:', e);
    }

    // fallback: forward provider response
    res.json({ ok: true, data });
  } catch (err) {
    try { metrics.tavusErrors.inc(); } catch (e) {}
    console.error('Tavus proxy error', err);
    res.status(500).json({ error: String(err) });
  }
});

// Admin endpoint to purge old cached audio. Protect with TAVUS_ADMIN_SECRET header `x-admin-secret`.
app.post('/api/tavus/cache/purge', async (req, res) => {
  const secret = (req.headers['x-admin-secret'] || req.query.secret || '').toString();
  // Support basic auth as alternative (use ADMIN_BASIC_USER and ADMIN_BASIC_PASS env vars)
  const adminUser = process.env.ADMIN_BASIC_USER || '';
  const adminPass = process.env.ADMIN_BASIC_PASS || '';
  let basicOk = false;
  try {
    const auth = (req.headers['authorization'] || '').toString();
    if (auth.startsWith('Basic ')) {
      const b = Buffer.from(auth.replace(/^Basic\s+/, ''), 'base64').toString('utf8');
      const [u, p] = b.split(':');
      if (u === adminUser && p === adminPass && adminUser && adminPass) basicOk = true;
    }
  } catch (e) {}
  if (TAVUS_ADMIN_SECRET) {
    if (secret !== TAVUS_ADMIN_SECRET && !basicOk) return res.status(403).json({ error: 'forbidden' });
  } else if (!basicOk) {
    return res.status(403).json({ error: 'forbidden' });
  }
  try {
    const removed = cache.cleanupOldFiles(TAVUS_CACHE_TTL_DAYS, 'mp3');
    try { metrics.tavusCacheHits.inc(0); } catch (e) {}
    return res.json({ ok: true, removed });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, async () => {
    console.log(`Tavus proxy listening on ${port}`);
    // Initial cleanup on startup
    try {
      const removed = cache.cleanupOldFiles(TAVUS_CACHE_TTL_DAYS, 'mp3');
      if (removed && removed.length) console.log('Removed cached files on startup:', removed.length);
    } catch (e) {
      console.warn('Cache cleanup failed on startup', e);
    }
    // Schedule daily cleanup
    const dayMs = 24 * 60 * 60 * 1000;
    setInterval(() => {
      try {
        const removed = cache.cleanupOldFiles(TAVUS_CACHE_TTL_DAYS, 'mp3');
        if (removed && removed.length) console.log('Periodic cache cleanup removed', removed.length, 'files');
      } catch (e) {
        console.warn('Periodic cache cleanup failed', e);
      }
    }, dayMs);
  });
}

export default app;

// Expose protected metrics endpoint and healthcheck for observability
try {
  const METRICS_SECRET = process.env.METRICS_SECRET || '';
  if (METRICS_SECRET) {
    app.get('/metrics', (req, res) => {
      const secretHeader = (req.headers['x-metrics-secret'] || req.headers['x-admin-secret'] || '').toString();
      if (!secretHeader || secretHeader !== METRICS_SECRET) return res.status(403).send('forbidden');
      try { return metrics.metricsMiddleware(req, res); } catch (e) { return res.status(500).send('metrics error'); }
    });
  }
} catch (e) {}

app.get('/health', (req, res) => res.json({ ok: true, uptime: process.uptime() }));
