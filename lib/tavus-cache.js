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

export default { hashText, cacheFilePath, cacheExists, saveAudioBuffer, audioPublicUrl };
