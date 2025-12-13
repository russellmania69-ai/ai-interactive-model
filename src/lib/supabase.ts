import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables
// Vite exposes env vars as `import.meta.env.VITE_...`
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
	// Warn in dev/local when env vars are missing — avoid throwing at import time.
	// In production, ensure your deployment provider sets these variables.
	// eslint-disable-next-line no-console
	console.warn('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

const supabase = createClient(supabaseUrl ?? '', supabaseKey ?? '');

export { supabase };