/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock final branch coverage', () => {
  it('handles global __SEED_DATA getter throwing without crashing', () => {
    // create a getter that throws when accessed
    Object.defineProperty(globalThis, '__SEED_DATA', {
      configurable: true,
      get() { throw new Error('boom'); }
    });

    // should not throw
    expect(() => createMockSupabase({ seeded: true })).not.toThrow();

    // cleanup
    try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
  });

  it('handles fetch rejection gracefully (promise catch branch)', async () => {
    try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
    (globalThis as any).fetch = async () => { throw new Error('network'); };

    const mock: any = createMockSupabase({ seeded: true });
    // wait for promise chain to settle
    await new Promise((r) => setTimeout(r, 20));

    const sel = await mock.from('user_profiles').select();
    expect(Array.isArray(sel.data)).toBe(true);
  });

  it('insert without payload generates an id when seeded', async () => {
    (globalThis as any).__SEED_DATA = { gen_table: [] };
    const mock: any = createMockSupabase({ seeded: true });
    const res = await mock.from('gen_table').insert();
    expect(res).toHaveProperty('data');
    expect(res.data).toHaveProperty('id');
    try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
  });

  it('getPublicUrl returns empty string for falsy path', () => {
    const mock: any = createMockSupabase();
    const u = mock.storage.from().getPublicUrl('');
    expect(u.data.publicUrl).toBe('');
  });
});
