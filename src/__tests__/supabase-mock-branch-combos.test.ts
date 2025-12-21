/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock branch combinations', () => {
  it('ignores non-object __SEED_DATA values', () => {
    (globalThis as any).__SEED_DATA = 'i am a string';
    const mock: any = createMockSupabase({ seeded: true });
    // should not throw and select returns empty array
    return mock.from('whatever').select().then((r: any) => {
      expect(Array.isArray(r.data)).toBe(true);
      expect(r.data.length).toBe(0);
        try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
    });
  });

  it('does not merge when fetch.json returns primitive', async () => {
      try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => 'nope' });
    const mock: any = createMockSupabase({ seeded: true });
    await new Promise((r) => setTimeout(r, 30));
    const sel = await mock.from('maybe').select();
    expect(Array.isArray(sel.data)).toBe(true);
    expect(sel.data.length).toBe(0);
  });

  it('single returns null when seeded array exists but empty', async () => {
    (globalThis as any).__SEED_DATA = { empty_table: [] };
    const mock: any = createMockSupabase({ seeded: true });
    const s = await mock.from('empty_table').single();
    expect(s.data).toBeNull();
      try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
  });
});
