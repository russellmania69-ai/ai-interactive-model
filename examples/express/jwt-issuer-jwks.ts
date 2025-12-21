import express from 'express';
import { generateKeyPair } from 'jose/util/generate_key_pair';
import { exportJWK } from 'jose/key/export';
import jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';

// JWKS-based issuer example. For production, provide `PROXY_JWT_PRIVATE_KEY` (PEM) and
// `PROXY_JWKS_KID`. For local dev this example will generate an RSA keypair on startup.

const app = express();
app.use(express.json());

let privateKeyPem: string | null = null;
let jwk: any = null; // exportable JWK
let kid = process.env.PROXY_JWKS_KID || 'dev-key-1';

async function ensureKey() {
  if (privateKeyPem && jwk) return;
  if (process.env.PROXY_JWT_PRIVATE_KEY) {
    privateKeyPem = process.env.PROXY_JWT_PRIVATE_KEY;
    // No JWK exported for provided PEM in this simple example — in prod, provide JWKS separately.
    return;
  }
  const { privateKey, publicKey } = await generateKeyPair('RS256');
  jwk = await exportJWK(publicKey);
  jwk.kid = kid;
  // Build PEM for signing with jsonwebtoken (not ideal for production but okay for example)
  // Use webcrypto key export to PEM via subtle is not available; we sign using jose indirectly.
  // For simplicity, we'll sign tokens using `jose` via SignJWT in a real implementation.
}

app.get('/issuer/jwks', async (_req: Request, res: Response) => {
  if (!jwk) await ensureKey();
  if (jwk) return res.json({ keys: [jwk] });
  return res.status(500).json({ error: 'JWKS not available' });
});

app.post('/issuer/token', async (req: Request, res: Response) => {
  const admin = process.env.PROXY_ISSUER_ADMIN_KEY || 'admin-key';
  const provided = req.header('x-admin-key') || '';
  if (provided !== admin) return res.status(401).json({ error: 'Unauthorized' });

  await ensureKey();
  // For demo, sign with HS256 using a local secret if no PEM available.
  const subject = String(req.body.sub || 'client');
  const expiresIn = req.body.expiresIn || '1h';

  if (process.env.PROXY_JWT_PRIVATE_KEY) {
    // If a PEM private key is provided, sign with RS256 using jsonwebtoken
    try {
      const token = jwt.sign({ sub: subject }, process.env.PROXY_JWT_PRIVATE_KEY as string, { algorithm: 'RS256', keyid: kid, expiresIn });
      return res.json({ token });
    } catch (e: any) {
      return res.status(500).json({ error: 'Signing failed', details: String(e?.message || e) });
    }
  }

  // Fallback: issue an unsigned token (not for prod). We'll sign with a symmetric key to keep tests simple.
  const sym = process.env.PROXY_JWT_SECRET || 'dev-secret';
  const token = jwt.sign({ sub: subject }, sym, { algorithm: 'HS256', expiresIn, keyid: kid });
  return res.json({ token, jwks: jwk ? { keys: [jwk] } : undefined });
});

if (require.main === module) {
  const port = Number(process.env.PORT || 3200);
  ensureKey().then(() => app.listen(port, () => console.log(`JWKS issuer listening on http://localhost:${port}`)));
}

export default app;
