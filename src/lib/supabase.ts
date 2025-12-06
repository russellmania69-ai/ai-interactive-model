import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables.
// In production builds we require `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY`
// to be present; otherwise fail fast so we don't silently use a wrong project.
const envSupabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const envSupabaseKey = import.meta.env.VITE_SUPABASE_KEY;

let supabaseUrl = envSupabaseUrl;
let supabaseKey = envSupabaseKey;

// During local development, keep the existing fallbacks for convenience.
// In production (built with Vite's `--mode production`), throw if missing.
if (import.meta.env.PROD) {
  if (!supabaseUrl || !supabaseKey) {
    // Log an explicit error and throw to prevent creating a client with wrong credentials.
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in production build.');
    throw new Error(
      'Missing VITE_SUPABASE_URL or VITE_SUPABASE_KEY in production build. ' +
        'Add them to `.env.production` and rebuild before deploying.'
    );
  }
} else {
  // Dev fallback (kept as before for local developer experience)
  supabaseUrl = supabaseUrl || 'https://wnytflqoxaxglgetafqn.supabase.co';
  supabaseKey =
    supabaseKey ||
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueXRmbHFveGF4Z2xnZXRhZnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzA1MzEsImV4cCI6MjA3NzU0NjUzMX0.N41ZCmRGaC_MMohjThDrHgjKqAHz7Bmivwmr9DW2NwE';
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };