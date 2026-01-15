/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, supabaseEnabled } from '@/lib/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

type SignInResponse = { data?: { user?: User; session?: Session } };

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<unknown>;
  signIn: (email: string, password: string) => Promise<unknown>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<unknown>;
  updateProfile: (data: Record<string, unknown>) => Promise<unknown>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const hasAuthSupport = !!supabaseEnabled;

    if (!hasAuthSupport) {
      // Supabase not configured — app is running with the in-repo mock.
      // For E2E determinism, allow auto sign-in when the URL contains
      // `?mock_signin=1`. This will call the mock's signInWithPassword and
      // populate `user`/`session` so UI elements like "My Profile" appear.
      setLoading(false);

      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('mock_signin') === '1') {
          (async () => {
            try {
              // seeded credentials used by the E2E scripts
              const email = 'russellmania69@gmail.com';
              const password = 'duxhe8-cEdruf-hejxym';
              // call mock supabase sign-in
              const res = await (supabase as unknown as SupabaseClient).auth.signInWithPassword({ email, password }) as unknown as SignInResponse;
              if (res && res.data && res.data.user) {
                const u = res.data.user as User;
                if (isMounted) {
                  setUser(u);
                  setSession(res.data.session ?? null);
                  setLoading(false);
                  try { console.log('AUTO_MOCK_SIGNIN_OK', u?.email ?? 'unknown'); } catch (e) { /* ignore */ }
                }
              }
            } catch (err) {
              console.error('Auto mock signin failed:', err);
            }
          })();
        }
      } catch (e) {
        // ignore URL parsing errors in constrained environments
      }

      return () => {
        isMounted = false;
      };
    }

    // Fetch session with timeout
    const sessionPromise = Promise.race([
      (supabase as unknown as SupabaseClient).auth.getSession(),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Session fetch timeout')), 5000))
    ]);

    sessionPromise
      .then((res: { data: { session: Session | null } }) => {
        const { session } = res.data;
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error('Auth session error:', error);
        if (isMounted) {
          // Allow app to render even if auth fails
          setLoading(false);
        }
      });

    // Subscribe to auth changes
    try {
      const { data: { subscription } } = (supabase as unknown as SupabaseClient).auth.onAuthStateChange((_event: string, session: Session | null) => {
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      });

      return () => {
        isMounted = false;
        subscription?.unsubscribe();
      };
    } catch (error) {
      console.error('Auth subscription error:', error);
      return () => {
        isMounted = false;
      };
    }
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    });
    
    if (!error && data.user) {
      await supabase.from('user_profiles').insert({
        id: data.user.id,
        email: data.user.email,
        full_name: fullName
      });
    }
    
    return { data, error };
  };

  const signIn = async (email: string, password: string) => {
    const res = await supabase.auth.signInWithPassword({ email, password });

    // If the app is running without real Supabase (mocked), the auth
    // subscription path above is skipped. In that case, update local state
    // directly from the sign-in result so UI updates (My Profile etc.) work
    // in seeded/mock E2E runs.
    try {
      // supabase mock returns { data: { user: ... } } shape when seeded
      if (!supabaseEnabled) {
        const resTyped = res as unknown as SignInResponse;
        if (resTyped && resTyped.data && resTyped.data.user) {
          const u = resTyped.data.user as User;
          setUser(u);
          setSession(resTyped.data.session ?? null);
          setLoading(false);
          try {
            // E2E debug marker: log and write a temporary localStorage flag so tests can detect mock signin
            // This is intentionally minimal and only runs when the supabase mock is active.
            // Remove when not needed for E2E debugging.
            console.log('MOCK_SIGNIN_OK', u?.email ?? 'unknown');
            try { localStorage.setItem('mock_session', '1'); } catch (e) { /* ignore */ }
          } catch (e) {
            // ignore any errors from logging/storage
          }
        }
      }
    } catch (e) {
      // swallow errors here to avoid breaking sign-in flow
    }

    return res;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email);
  };

  const updateProfile = async (updates: Record<string, unknown>) => {
    if (!user) return { error: 'No user' };
    return await supabase.from('user_profiles').update(updates).eq('id', user.id);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut, resetPassword, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
