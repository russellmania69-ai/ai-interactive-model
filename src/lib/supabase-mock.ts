// Minimal Supabase mock for local development. Provides a small subset of methods
// used by the app so developers can run the UI without a Supabase project.

import type { Session, User } from '@supabase/supabase-js';
import type { PostgrestResponse } from '@supabase/supabase-js';

export function createMockSupabase(options?: { seeded?: boolean }) {
  const auth = {
    async getSession() {
      return { data: { session: null } };
    },
    onAuthStateChange(_cb: (event: string, session: Session | null) => void) {
      return { data: { subscription: { unsubscribe: () => {} } } };
    },
    async signUp(_opts: { email?: string }) {
      return { data: { user: { id: 'mock-user', email: _opts?.email } as User }, error: null };
    },
    async signInWithPassword(_opts: { email?: string; password?: string }) {
      return { data: { user: null }, error: null } as PostgrestResponse<null>;
    },
    async signOut() {
      return { error: null };
    },
    async resetPasswordForEmail(_email: string) {
      return { data: null, error: null };
    }
  };

  // Simple in-memory tables used when `seeded` is enabled.
  const seededData = options?.seeded
    ? {
        user_profiles: [
          { id: 'user_1', email: 'alice@example.com', full_name: 'Alice', role: 'user', avatar_url: '', created_at: new Date().toISOString() },
          { id: 'user_2', email: 'bob@example.com', full_name: 'Bob', role: 'admin', avatar_url: '', created_at: new Date().toISOString() }
        ],
        subscriptions: [
          { id: 'sub_1', user_email: 'alice@example.com', model_name: 'Luna', subscription_price: '9.99', payment_status: 'completed', subscription_start_date: new Date().toISOString(), subscription_end_date: new Date(Date.now() + 2592e6).toISOString() }
        ],
        chat_sessions: [
          { id: 'chat_1', user_email: 'alice@example.com', model_name: 'Luna', created_at: new Date().toISOString() }
        ],
        saved_images: [
          { id: 'img_1', user_email: 'alice@example.com', image_url: '/public/sample1.jpg', prompt: 'A beautiful portrait', created_at: new Date().toISOString() }
        ],
        email_logs: []
      }
    : {} as Record<string, Record<string, unknown>[]>;

  function createFrom(table?: string) {
    type Chain = {
      order: () => Chain;
      eq: () => Chain;
      limit: () => Chain;
      select: () => Promise<{ data: unknown[]; error: null }>;
      insert: () => Promise<{ data: unknown | null; error: null }>;
      delete: () => Promise<{ data: unknown | null; error: null }>;
      update: () => Promise<{ data: unknown | null; error: null }>;
      single: () => Promise<{ data: unknown | null; error: null }>;
      or: () => Chain;
    };

    const chain: Chain = {
      order: function() { return chain; },
      eq: function() { return chain; },
      limit: function() { return chain; },
      select: async () => {
        if (options?.seeded && table && seededData[table]) return { data: seededData[table], error: null };
        return { data: [], error: null };
      },
      insert: async (payload?: unknown) => {
        if (options?.seeded && table) {
          const item = Array.isArray(payload) ? (payload as unknown[])[0] : payload;
          const itemObj = (item as Record<string, unknown> | undefined) || {};
          const id = (itemObj['id'] as string) || `mock_${Math.random().toString(36).slice(2,9)}`;
          const row = { id, ...itemObj } as Record<string, unknown>;
          seededData[table] = seededData[table] || [];
          seededData[table].push(row);
          return { data: row, error: null };
        }
        return { data: null, error: null };
      },
      delete: async () => ({ data: null, error: null }),
      update: async (payload?: unknown) => {
        if (options?.seeded && table && payload) {
          // naive update: merge payload into first item
          seededData[table] = seededData[table] || [];
          if (seededData[table].length === 0) return { data: null, error: null };
          const p = payload as Record<string, unknown>;
          const first = seededData[table][0] as Record<string, unknown>;
          const merged = { ...first, ...p };
          seededData[table][0] = merged;
          return { data: merged, error: null };
        }
        return { data: null, error: null };
      },
      single: async () => {
        if (options?.seeded && table && seededData[table]) return { data: seededData[table][0] || null, error: null };
        return { data: null, error: null };
      },
      or: function() { return chain; }
    };
    return chain as unknown;
  }

  const storage = {
    from: () => ({
      async upload() { return { data: null, error: null }; },
      getPublicUrl: (path: string) => ({ data: { publicUrl: path || '' } })
    })
  };

  const functions = {
    async invoke(_name: string, _opts?: Record<string, unknown> | undefined) {
      return { data: null, error: null };
    }
  };

  return {
    auth,
    from: (_table: string) => createFrom(),
    storage,
    functions
  } as unknown;
}
