/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock seed merge branches', () => {
  it('sync __SEED_DATA merge occurs when present', async () => {
    (globalThis as any).__SEED_DATA = { sync_merge: [ { id: 'm1', val: 1 } ] };
    const mock: any = createMockSupabase({ seeded: true });
    const sel = await mock.from('sync_merge').select();
    expect(sel.data[0].id).toBe('m1');
    try { delete (globalThis as any).__SEED_DATA; } catch {}
  });

  it('fetch fallback merges JSON object when returned', async () => {
    try { delete (globalThis as any).__SEED_DATA; } catch {}
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => ({ fetched_merge: [ { id: 'f1' } ] }) });
    const mock: any = createMockSupabase({ seeded: true });
    // wait for the non-blocking merge
    await new Promise((r) => setTimeout(r, 30));
    const sel = await mock.from('fetched_merge').select();
    expect(sel.data[0].id).toBe('f1');
  });
});
