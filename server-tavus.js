import express from 'express';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
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

if (!TAVUS_KEY) {
  console.warn('Warning: TAVUS_API_KEY is not set — /api/tavus will return 500');
}

// Simple per-IP rate limiter to protect Tavus API usage (configurable via env)
const tavusLimiter = rateLimit({
  windowMs: Number(process.env.TAVUS_RATE_WINDOW_MS || 60_000),
  max: Number(process.env.TAVUS_RATE_MAX || 6),
  message: { error: 'Rate limit exceeded' }
});

// POST /api/tavus/generate
// body: { avatarId: string, input: { text: string }, options?: object }
app.post('/api/tavus/generate', tavusLimiter, async (req, res) => {
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
      return res.json({ ok: true, cached: true, audio_url: cache.audioPublicUrl(hash, 'mp3') });
    }

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
      console.warn('Failed to cache audio:', e);
    }

    // fallback: forward provider response
    res.json({ ok: true, data });
  } catch (err) {
    console.error('Tavus proxy error', err);
    res.status(500).json({ error: String(err) });
  }
});

const port = process.env.PORT || 3000;
if (require.main === module) {
  app.listen(port, () => console.log(`Tavus proxy listening on ${port}`));
}

export default app;
