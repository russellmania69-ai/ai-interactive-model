/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createMockSupabase } from '../lib/supabase-mock';

type MockClient = {
  from: (table: string) => {
    order: () => any;
    eq: () => any;
    limit: () => any;
    select: () => Promise<{ data: Record<string, unknown>[]; error: null }>;
    insert: (payload?: unknown) => Promise<{ data: Record<string, unknown> | null; error: null }>;
    delete: () => Promise<{ data: unknown | null; error: null }>;
    update: (payload?: unknown) => Promise<{ data: Record<string, unknown> | null; error: null }>;
    single: () => Promise<{ data: Record<string, unknown> | null; error: null }>;
    or: () => any;
  };
};

describe('supabase mock extra behaviors', () => {
  beforeEach(() => {
    try { delete (globalThis as any).__SEED_DATA; } catch { /* ignore */ }
    try { delete (globalThis as any).fetch; } catch { /* ignore */ }
  });

  afterEach(() => {
    try { delete (globalThis as any).__SEED_DATA; } catch { /* ignore */ }
    try { delete (globalThis as any).fetch; } catch { /* ignore */ }
  });

  it('supports chaining methods before select', async () => {
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    const res = await mock.from('user_profiles').order().eq().limit().select();
    expect(Array.isArray(res.data)).toBe(true);
  });

  it('delete returns shape (no-op)', async () => {
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    const del = await mock.from('user_profiles').delete();
    expect(del).toHaveProperty('data');
  });

  it('single returns first item when seeded', async () => {
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    const single = await mock.from('user_profiles').single();
    expect(single).toHaveProperty('data');
  });

  it('async fetch fallback merges /seed-data.json when present', async () => {
    // stub global fetch to return a seeded payload
    (globalThis as any).fetch = async () => ({ ok: true, json: async () => ({ user_profiles: [{ id: 'f1', email: 'f@example.com' }] }) });
    const mock = createMockSupabase({ seeded: true }) as unknown as MockClient;
    // wait for the non-blocking fetch to resolve and merge
    await new Promise((r) => setTimeout(r, 20));
    const res = await mock.from('user_profiles').select();
    const found = res.data.find((d) => String((d as any).email) === 'f@example.com');
    expect(found).toBeTruthy();
  });
});
