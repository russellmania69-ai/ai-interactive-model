Tavus Integration
=================

This project includes a simple proxy endpoint that forwards generate requests to Tavus.

Setup
-----

1. Add environment variables to your environment or `.env`:

```
TAVUS_API_KEY=sk-...
TAVUS_API_URL=https://api.tavus.ai/v1/generate   # optional override
```

2. Start the proxy server (or include it in your app):

```
node server-tavus.js
```

3. Open the demo:

```
http://localhost:3000/tavus.html
```

Notes
-----
- This proxy forwards the Tavus API response directly. The shape of the response may vary;
  the demo looks for `audio_url` in the returned JSON but may need adjustments for your account.
- For production, validate inputs, add authentication, rate limiting, and store/serve generated assets from your CDN.

Caching & Rate limiting
------------------------

- The project includes a simple file-based cache in `public/tavus-cache` and a helper at `lib/tavus-cache.js`.
  Generated audio is stored using a SHA256 hash of the input text and served from `/tavus-cache/<hash>.mp3`.
- The proxy implements a basic per-IP rate limiter using `express-rate-limit` configurable via env vars:
  - `TAVUS_RATE_WINDOW_MS` (default 60000) — window in ms
  - `TAVUS_RATE_MAX` (default 6) — max requests per window

Redis-backed rate limiting
--------------------------

The proxy can optionally use Redis for a distributed rate limiter. To enable it, set `REDIS_URL`
and install the Redis store package:

```bash
npm i rate-limit-redis ioredis
```

When Redis is configured the proxy will use a Redis-backed store; otherwise it falls back to an
in-memory rate limiter.

Cache cleanup and admin purge
----------------------------

- You can control cache TTL via `TAVUS_CACHE_TTL_DAYS` (default 7 days). On startup the proxy will run an initial cleanup and a daily scheduled cleanup.
- An admin endpoint is available to purge cached audio immediately:

  - `POST /api/tavus/cache/purge` — requires `x-admin-secret` header or `?secret=` query param matching `TAVUS_ADMIN_SECRET` env var.

  Example:

  ```bash
  curl -X POST -H "x-admin-secret: your-secret" http://localhost:3000/api/tavus/cache/purge
  ```

  The endpoint returns a JSON object containing the list of removed files.

Security & Production
---------------------
- Ensure you add authentication and stricter rate limiting before exposing the demo publicly.
- Consider moving cached assets to a CDN and deleting old cache files periodically.
