import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const CACHE_DIR = process.env.TAVUS_CACHE_DIR || path.join(process.cwd(), 'public', 'tavus-cache');
const S3_BUCKET = process.env.TAVUS_S3_BUCKET || process.env.AWS_S3_BUCKET || '';
const S3_REGION = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || '';
const S3_PUBLIC_URL_BASE = process.env.TAVUS_S3_PUBLIC_URL || '';

let s3Client = null;
let s3Available = false;
async function ensureS3() {
  if (!S3_BUCKET) return false;
  if (s3Client !== null) return s3Available;
  try {
    const { S3Client } = await import('@aws-sdk/client-s3');
    s3Client = new S3Client({ region: S3_REGION || undefined });
    s3Available = true;
  } catch (e) {
    s3Available = false;
  }
  return s3Available;
}

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

export async function cacheExists(hash, ext = 'mp3') {
  if (await ensureS3()) {
    try {
      const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
      await s3Client.send(new HeadObjectCommand({ Bucket: S3_BUCKET, Key: `${hash}.${ext}` }));
      return `${hash}.${ext}`; // indicate exists in S3
    } catch (e) {
      return null;
    }
  }
  const p = cacheFilePath(hash, ext);
  return fs.existsSync(p) ? p : null;
}

export async function saveAudioBuffer(hash, buffer, ext = 'mp3') {
  if (await ensureS3()) {
    try {
      const { PutObjectCommand } = await import('@aws-sdk/client-s3');
      await s3Client.send(new PutObjectCommand({ Bucket: S3_BUCKET, Key: `${hash}.${ext}`, Body: buffer, ContentType: 'audio/mpeg' }));
      return `${hash}.${ext}`;
    } catch (e) {
      // fallback to disk
    }
  }
  ensureDir();
  const p = cacheFilePath(hash, ext);
  fs.writeFileSync(p, buffer);
  return p;
}

export function audioPublicUrl(hash, ext = 'mp3') {
  if (S3_BUCKET && S3_PUBLIC_URL_BASE) {
    return `${S3_PUBLIC_URL_BASE.replace(/\/$/, '')}/${hash}.${ext}`;
  }
  // public path served from /tavus-cache/<file>
  return `/tavus-cache/${hash}.${ext}`;
}

export function cleanupOldFiles(ttlDays = 7, ext = 'mp3') {
  // Only cleanup local disk cache; S3 lifecycle should be managed by bucket policy
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
