 
import { describe, it, expect } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

type MockClient = {
  from: (table: string) => {
    select: () => Promise<{ data: Record<string, unknown>[]; error: null }>;
    insert: (payload?: unknown) => Promise<{ data: Record<string, unknown> | null; error: null }>;
    update: (payload?: unknown) => Promise<{ data: Record<string, unknown> | null; error: null }>;
  };
};

describe('createMockSupabase seeded mode', () => {
  it('returns seeded user_profiles on select', async () => {
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    const res = await mock.from('user_profiles').select();
    expect(res).toHaveProperty('data');
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);
    expect(res.data[0]).toHaveProperty('email');
  });

  it('can insert a new row into a seeded table', async () => {
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    const insertRes = await mock.from('user_profiles').insert({ email: 'new@example.com', full_name: 'New User' });
    expect(insertRes).toHaveProperty('data');
    const after = await mock.from('user_profiles').select();
    const found = after.data.find((r: Record<string, unknown>) => String(r.email ?? r['email']) === 'new@example.com');
    expect(found).toBeTruthy();
  });

  it('can update an existing seeded row', async () => {
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    const orig = await mock.from('subscriptions').select();
    if (orig.data.length === 0) {
      // insert a subscription first if missing
      await mock.from('subscriptions').insert({ user_email: 'alice@example.com', model_name: 'Luna' });
    }
    const updateRes = await mock.from('subscriptions').update({ subscription_price: '19.99' });
    expect(updateRes).toHaveProperty('data');
    expect(updateRes.data).toHaveProperty('subscription_price');
    expect(String((updateRes.data as Record<string, unknown>)['subscription_price'])).toBe('19.99');
  });
});
