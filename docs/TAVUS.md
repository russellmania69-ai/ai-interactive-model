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
