/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('createMockSupabase additional behavior', () => {
  beforeEach(() => {
    // clear any global seed between tests
    try { delete (globalThis as any).__SEED_DATA; } catch { }
  });

  afterEach(() => {
    try { delete (globalThis as any).__SEED_DATA; } catch { }
  });

  it('auth methods exist and return expected shapes', async () => {
    const mock = createMockSupabase();
    const sess = await (mock as any).auth.getSession();
    expect(sess).toHaveProperty('data');
    const signUp = await (mock as any).auth.signUp({ email: 'x@example.com' });
    expect(signUp).toHaveProperty('data');
    const signOut = await (mock as any).auth.signOut();
    expect(signOut).toHaveProperty('error');
  });

  it('storage.getPublicUrl returns path and upload resolves', async () => {
    const mock = createMockSupabase();
    const url = (mock as any).storage.from('bucket').getPublicUrl('/path.png');
    expect(url).toHaveProperty('data');
    const upload = await (mock as any).storage.from('bucket').upload();
    expect(upload).toHaveProperty('error');
  });

  it('functions.invoke returns shape', async () => {
    const mock = createMockSupabase();
    const res = await (mock as any).functions.invoke('name');
    expect(res).toHaveProperty('data');
  });

  it('when not seeded, from().select returns empty array', async () => {
    const mock = createMockSupabase({ seeded: false }) as any;
    const res = await mock.from('user_profiles').select();
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBe(0);
  });

  it('reads global __SEED_DATA when present before instantiation', async () => {
    (globalThis as any).__SEED_DATA = {
      user_profiles: [{ id: 'g1', email: 'g@example.com' }]
    };
    const mock = createMockSupabase({ seeded: true }) as any;
    const res = await mock.from('user_profiles').select();
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0].email).toBe('g@example.com');
  });
});
