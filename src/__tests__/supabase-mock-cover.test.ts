/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

describe('supabase-mock coverage targets', () => {
  it('auth: onAuthStateChange, signInWithPassword, resetPasswordForEmail', async () => {
    const mock: any = createMockSupabase();
    const sub = mock.auth.onAuthStateChange(() => {});
    expect(sub).toHaveProperty('data');
    expect(typeof sub.data.subscription.unsubscribe).toBe('function');

    const signIn = await mock.auth.signInWithPassword({ email: 'x', password: 'p' });
    expect(signIn).toHaveProperty('data');
    expect(signIn.data.user).toBeNull();

    const reset = await mock.auth.resetPasswordForEmail('x@example.com');
    expect(reset).toHaveProperty('data');
    expect(reset.data).toBeNull();
  });

  it('insert without seeded returns null', async () => {
    const mock: any = createMockSupabase();
    const res = await mock.from('some_table').insert({ foo: 'bar' });
    expect(res).toHaveProperty('data');
    expect(res.data).toBeNull();
  });

  it('update on empty seeded table returns null', async () => {
    const mock: any = createMockSupabase({ seeded: true });
    const res = await mock.from('email_logs').update({ foo: 1 });
    expect(res).toHaveProperty('data');
    expect(res.data).toBeNull();
  });

  it('update without seeded returns null', async () => {
    const mock: any = createMockSupabase();
    const res = await mock.from('user_profiles').update({ foo: 1 });
    expect(res).toHaveProperty('data');
    expect(res.data).toBeNull();
  });

  it('single and or chain', async () => {
    const mock: any = createMockSupabase();
    const single = await mock.from('user_profiles').single();
    expect(single).toHaveProperty('data');
    expect(single.data).toBeNull();
    const chain = mock.from('user_profiles').or();
    expect(chain).toBeTruthy();
  });
});
