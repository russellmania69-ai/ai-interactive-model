import express from 'express';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

// Simple admin-backed JWT issuer for local/dev demonstrations.
// Environment vars:
// - PROXY_JWT_SECRET: secret used to sign tokens (required)
// - PROXY_ISSUER_ADMIN_KEY or ADMIN_API_KEY: simple admin key to authorize token issuance

const app = express();
app.use(express.json());

app.post('/issuer/token', (req: Request, res: Response) => {
  const ADMIN_KEY = process.env.PROXY_ISSUER_ADMIN_KEY || process.env.ADMIN_API_KEY;
  const JWT_SECRET = process.env.PROXY_JWT_SECRET;

  const provided = req.header('x-admin-key') || '';
  if (!ADMIN_KEY || provided !== ADMIN_KEY) return res.status(401).json({ error: 'Unauthorized' });
  if (!JWT_SECRET) return res.status(501).json({ error: 'PROXY_JWT_SECRET not configured' });

  const sub = String(req.body.sub || 'client');
  const expiresIn = req.body.expiresIn || '1h';
  try {
    const token = jwt.sign({ sub }, JWT_SECRET, { expiresIn });
    return res.json({ token });
  } catch (err: any) {
    return res.status(500).json({ error: 'Signing failed', details: String(err?.message || err) });
  }
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3100);
  app.listen(port, () => console.log(`JWT issuer listening on http://localhost:${port}`));
}

export default app;
