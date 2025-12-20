/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock edge branches', () => {
  it('insert with array payload uses first element', async () => {
    const mock: any = createMockSupabase({ seeded: true });
    const res = await mock.from('new_table').insert([{ id: 'arr_1', value: 1 }]);
    expect(res).toHaveProperty('data');
    expect(res.data.id).toBe('arr_1');
  });

  it('update on missing seeded table returns null (exercises seededData assignment)', async () => {
    // ensure table does not exist in seededData
    try { delete (globalThis as any).__SEED_DATA; } catch {}
    const mock: any = createMockSupabase({ seeded: true });
    const up = await mock.from('missing_table').update({ test: 'x' });
    expect(up).toHaveProperty('data');
    expect(up.data).toBeNull();
  });

  it('single returns first item when seeded', async () => {
    (globalThis as any).__SEED_DATA = { single_table: [ { id: 's1', nm: 's' } ] };
    const mock: any = createMockSupabase({ seeded: true });
    const s = await mock.from('single_table').single();
    expect(s).toHaveProperty('data');
    expect(s.data.id).toBe('s1');
    // cleanup
    try { delete (globalThis as any).__SEED_DATA; } catch {}
  });

  it('storage.upload returns null data shape', async () => {
    const mock: any = createMockSupabase();
    const up = await mock.storage.from().upload('/path', new Uint8Array());
    expect(up).toHaveProperty('data');
    expect(up.data).toBeNull();
  });
});
