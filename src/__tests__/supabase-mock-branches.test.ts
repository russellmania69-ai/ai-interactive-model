/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock additional branches', () => {
  beforeEach(() => {
    // clear any global seed between tests
    try { (globalThis as any).__SEED_DATA = undefined; } catch { /* ignore */ }
  });

  it('auth: signUp, getSession, signOut', async () => {
    const mock: any = createMockSupabase();
    const su = await mock.auth.signUp({ email: 'new@ex.com' });
    expect(su).toHaveProperty('data');
    expect(su.data.user.email).toBe('new@ex.com');

    const sess = await mock.auth.getSession();
    expect(sess).toHaveProperty('data');
    expect(sess.data.session).toBeNull();

    const out = await mock.auth.signOut();
    expect(out).toHaveProperty('error');
    expect(out.error).toBeNull();
  });

  it('storage and functions', async () => {
    const mock: any = createMockSupabase();
    const url = mock.storage.from().getPublicUrl('/path/to/file.jpg');
    expect(url).toHaveProperty('data');
    expect(url.data.publicUrl).toBe('/path/to/file.jpg');

    const fn = await mock.functions.invoke('do-nothing');
    expect(fn).toHaveProperty('data');
    expect(fn.data).toBeNull();
  });

  it('global __SEED_DATA merge and insert/update flows', async () => {
    // provide synchronous seed
    (globalThis as any).__SEED_DATA = {
      user_profiles: [ { id: 'sync_1', email: 'sync@example.com' } ],
      email_logs: []
    };

    const mock: any = createMockSupabase({ seeded: true });

    // select should return seeded row
    const sel = await mock.from('user_profiles').select();
    expect(Array.isArray(sel.data)).toBe(true);
    expect(sel.data[0].email).toBe('sync@example.com');

    // insert should create and return a row when seeded
    const ins = await mock.from('user_profiles').insert({ full_name: 'Z' });
    expect(ins).toHaveProperty('data');
    expect(ins.data).toHaveProperty('id');

    // update should merge into first item
    const upd = await mock.from('user_profiles').update({ role: 'tester' });
    expect(upd).toHaveProperty('data');
    expect(upd.data.role).toBe('tester');
  });
});
