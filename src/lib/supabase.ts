import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
// For development, use vite environment variables
// For production, configure these on your deployment platform
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wnytflqoxaxglgetafqn.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndueXRmbHFveGF4Z2xnZXRhZnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5NzA1MzEsImV4cCI6MjA3NzU0NjUzMX0.N41ZCmRGaC_MMohjThDrHgjKqAHz7Bmivwmr9DW2NwE';

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. Using fallback values.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export { supabase };