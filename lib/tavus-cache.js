import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = process.env.TAVUS_CACHE_DIR || path.join(process.cwd(), 'public', 'tavus-cache');

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

export function hashText(text) {
  return crypto.createHash('sha256').update(text).digest('hex');
}

export function cacheFilePath(hash, ext = 'mp3') {
  ensureDir();
  return path.join(CACHE_DIR, `${hash}.${ext}`);
}

export function cacheExists(hash, ext = 'mp3') {
  const p = cacheFilePath(hash, ext);
  return fs.existsSync(p) ? p : null;
}

export function saveAudioBuffer(hash, buffer, ext = 'mp3') {
  ensureDir();
  const p = cacheFilePath(hash, ext);
  fs.writeFileSync(p, buffer);
  return p;
}

export function audioPublicUrl(hash, ext = 'mp3') {
  // public path served from /tavus-cache/<file>
  return `/tavus-cache/${hash}.${ext}`;
}

export function cleanupOldFiles(ttlDays = 7, ext = 'mp3') {
  ensureDir();
  const files = fs.readdirSync(CACHE_DIR).filter(f => f.endsWith(`.${ext}`));
  const now = Date.now();
  const removed = [];
  const ms = Number(ttlDays) * 24 * 60 * 60 * 1000;
  for (const f of files) {
    try {
      const p = path.join(CACHE_DIR, f);
      const stat = fs.statSync(p);
      const age = now - stat.mtimeMs;
      if (age > ms) {
        fs.unlinkSync(p);
        removed.push(f);
      }
    } catch (e) {
      // ignore errors per-file
    }
  }
  return removed;
}

export default { hashText, cacheFilePath, cacheExists, saveAudioBuffer, audioPublicUrl, cleanupOldFiles };
