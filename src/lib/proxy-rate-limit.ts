import Redis from 'ioredis';

type InMemoryStore = Map<string, number[]>;

const DEFAULT_WINDOW_MS = 60 * 1000;

let redisClient: Redis | null = null;
let inMemory: InMemoryStore | null = null;

function getInMemory(): InMemoryStore {
  if (!inMemory) inMemory = new Map();
  return inMemory;
}

export async function initRateLimiter() {
  const url = process.env.REDIS_URL;
  if (url) {
    try {
      redisClient = new Redis(url);
      await redisClient.ping();
    } catch (e) {
      console.warn('Redis init failed, falling back to in-memory rate limiter');
      redisClient = null;
    }
  }
}

export async function isRateLimited(key: string, limit = Number(process.env.PROXY_RATE_LIMIT || 20), windowMs = Number(process.env.PROXY_RATE_WINDOW_MS || DEFAULT_WINDOW_MS)) {
  if (redisClient) {
    const bucket = Math.floor(Date.now() / windowMs);
    const redisKey = `rl:${key}:${bucket}`;
    const cur = await redisClient.incr(redisKey);
    if (cur === 1) await redisClient.pexpire(redisKey, windowMs + 2000);
    return cur > limit;
  }

  const store = getInMemory();
  const now = Date.now();
  const arr = store.get(key) || [];
  const kept = arr.filter((t) => now - t <= windowMs);
  if (kept.length >= limit) {
    store.set(key, kept);
    return true;
  }
  kept.push(now);
  store.set(key, kept);
  return false;
}
