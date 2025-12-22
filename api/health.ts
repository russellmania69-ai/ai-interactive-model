import type { VercelRequest, VercelResponse } from '@vercel/node';
import { setSecurityHeadersVercel } from '../src/lib/security-headers';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  try { setSecurityHeadersVercel(res); } catch { /* ignore */ }
  res.status(200).send('OK');
}
