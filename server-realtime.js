import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(express.static('public'));

const OPENAI_KEY = process.env.OPENAI_API_KEY;
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const TAVUS_KEY = process.env.TAVUS_API_KEY;
const TAVUS_URL = process.env.TAVUS_API_URL || 'https://api.tavus.ai/v1/generate';

if (!OPENAI_KEY) {
  console.error('Missing OPENAI_API_KEY');
  process.exit(1);
}

// Simple SSE endpoint that proxies OpenAI streaming chat completions.
// Client opens an EventSource GET /api/realtime?prompt=... and receives
// server-sent "data: <text>\n\n" events carrying incremental assistant tokens.
app.get('/api/realtime', async (req, res) => {
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
              const tavusBody = {
                avatar_id: avatarId,
                input: { text: assistantFull },
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
                const payloadObj = { audio_url: audio_url || null, audio_base64: audio_b64 || null, raw: tavusData };
                res.write(`event: audio\ndata: ${JSON.stringify(payloadObj)}\n\n`);
              } else {
                res.write(`event: audio_error\ndata: ${JSON.stringify({ status: tr.status, body: tavusData })}\n\n`);
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

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Realtime proxy listening on ${port}`));
