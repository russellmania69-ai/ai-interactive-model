/* eslint-disable react-refresh/only-export-components */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

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

    // Fetch session with timeout
    const sessionPromise = Promise.race([
      supabase.auth.getSession(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Session fetch timeout')), 5000)
      )
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
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    return await supabase.auth.signInWithPassword({ email, password });
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
