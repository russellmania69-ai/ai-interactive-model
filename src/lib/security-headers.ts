import type { VercelResponse } from '@vercel/node';

export function setSecurityHeadersVercel(res: VercelResponse) {
  try {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'");
  } catch {
    // ignore in environments where headers can't be set
  }
}

export function defaultNetlifyHeaders() {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'SAMEORIGIN',
    'Referrer-Policy': 'no-referrer-when-downgrade',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'Content-Security-Policy': "default-src 'self'; img-src 'self' data:; script-src 'self' 'unsafe-inline'",
  } as Record<string, string>;
}

export default setSecurityHeadersVercel;
