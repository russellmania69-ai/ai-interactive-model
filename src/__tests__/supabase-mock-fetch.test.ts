/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock fetch fallback and non-seeded paths', () => {
  it('merges seed from fetch fallback when available', async () => {
    // ensure no synchronous global seed
    try { delete (globalThis as any).__SEED_DATA; } catch {}

    // mock global fetch to return seed data
    (globalThis as any).fetch = async () => ({
      ok: true,
      json: async () => ({
        user_profiles: [ { id: 'f1', email: 'fetched@example.com' } ]
      })
    });

    const mock: any = createMockSupabase({ seeded: true });

    // fetch merging is non-blocking; wait a tick for the promise chain to resolve
    await new Promise((r) => setTimeout(r, 20));

    const sel = await mock.from('user_profiles').select();
    expect(Array.isArray(sel.data)).toBe(true);
    // should include fetched row
    const found = sel.data.find((d: any) => d.email === 'fetched@example.com');
    expect(found).toBeTruthy();
  });

  it('non-seeded insert returns null data', async () => {
    const mock: any = createMockSupabase();
    const ins = await mock.from('unseeded_table').insert({ foo: 'bar' });
    expect(ins).toHaveProperty('data');
    expect(ins.data).toBeNull();
  });

  it('onAuthStateChange returns unsubscribeable subscription', () => {
    const mock: any = createMockSupabase();
    const sub = mock.auth.onAuthStateChange(() => {});
    expect(sub).toHaveProperty('data');
    expect(typeof sub.data.subscription.unsubscribe).toBe('function');
  });
});
