import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('public'));

const TAVUS_KEY = process.env.TAVUS_API_KEY;
const TAVUS_URL = process.env.TAVUS_API_URL || 'https://api.tavus.ai/v1/generate';

if (!TAVUS_KEY) {
  console.warn('Warning: TAVUS_API_KEY is not set — /api/tavus will return 500');
}

// POST /api/tavus/generate
// body: { avatarId: string, input: { text: string }, options?: object }
app.post('/api/tavus/generate', async (req, res) => {
  if (!TAVUS_KEY) return res.status(500).json({ error: 'TAVUS_API_KEY not configured' });
  const { avatarId, input, options } = req.body || {};
  if (!avatarId || !input || typeof input.text !== 'string') {
    return res.status(400).json({ error: 'avatarId and input.text required' });
  }

  try {
    const payload = {
      avatar_id: avatarId,
      input: { text: input.text },
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

    // Return the provider response to the client. Typical Tavus responses include
    // an audio URL or base64 — we forward whatever the API returns.
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
