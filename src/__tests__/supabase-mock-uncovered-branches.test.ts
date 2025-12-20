/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock uncovered branch shims', () => {
  it('handles non-object __SEED_DATA without throwing', () => {
    (globalThis as any).__SEED_DATA = 'not-an-object';
    expect(() => createMockSupabase({ seeded: true })).not.toThrow();
    try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
  });

  it('handles fetch returning non-ok response', async () => {
    try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
    (globalThis as any).fetch = async () => ({ ok: false, json: async () => ({}) });
    const mock: any = createMockSupabase({ seeded: true });
    // wait for the non-blocking merge to settle
    await new Promise((r) => setTimeout(r, 20));
    const sel = await mock.from('some_table').select();
    expect(sel.data).toBeInstanceOf(Array);
  });

  it('handles fetch.json returning non-object value', async () => {
    try { delete (globalThis as any).__SEED_DATA; } catch (e) { /* ignore */ }
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => 'string-result' });
    const mock: any = createMockSupabase({ seeded: true });
    await new Promise((r) => setTimeout(r, 20));
    const sel = await mock.from('some_table').select();
    expect(sel.data).toBeInstanceOf(Array);
  });
});
