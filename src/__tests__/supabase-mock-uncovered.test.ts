/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('attempt to exercise remaining merge arms', () => {
  it('calls createMockSupabase multiple times with sync seed', () => {
    (globalThis as any).__SEED_DATA = { a: [ { id: 'a1' } ] };
    const m1: any = createMockSupabase({ seeded: true });
    // ensure it's usable
    return m1.from('a').select().then((r: any) => {
      expect(r.data[0].id).toBe('a1');
      try { delete (globalThis as any).__SEED_DATA; } catch {}
      // call again without seed
      const m2: any = createMockSupabase({ seeded: true });
      return m2.from('a').select().then((r2: any) => {
        expect(Array.isArray(r2.data)).toBe(true);
      });
    });
  });

  it('fetch.json returns after a slight delay and merges', async () => {
    try { delete (globalThis as any).__SEED_DATA; } catch {}
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => { await new Promise(r => setTimeout(r, 10)); return { delayed: [ { id: 'd1' } ] }; } });
    const mock: any = createMockSupabase({ seeded: true });
    await new Promise((r) => setTimeout(r, 30));
    const sel = await mock.from('delayed').select();
    expect(sel.data[0].id).toBe('d1');
  });
});
