export type FetchOptions = RequestInit & { timeoutMs?: number; retries?: number; backoffMs?: number };

export async function fetchWithRetry(input: RequestInfo, init: FetchOptions = {}) {
  const { timeoutMs = 5000, retries = 2, backoffMs = 200, ...fetchInit } = init;

  let attempt = 0;
  while (true) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const res = await fetch(input, { ...fetchInit, signal: controller.signal } as RequestInit);
      clearTimeout(id);
      // Retry on 5xx server errors
      if (res.status >= 500 && attempt <= retries) {
        await new Promise((r) => setTimeout(r, backoffMs * attempt));
        continue;
      }
      return res;
    } catch (err: unknown) {
      clearTimeout(id);
      const e = err as { name?: string; code?: string };
      const isAbort = !!(e && (e.name === 'AbortError' || e.code === 'ABORT_ERR'));
      if (attempt > retries) throw err;
      // retry on network errors / aborts
      if (isAbort || e?.code === 'ECONNRESET' || e?.code === 'ENOTFOUND' || e?.code === 'ETIMEDOUT') {
        await new Promise((r) => setTimeout(r, backoffMs * attempt));
        continue;
      }
      throw err;
    }
  }
}

export default fetchWithRetry;
