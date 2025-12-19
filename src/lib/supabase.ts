import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using environment variables (Vite: import.meta.env)
// Vite exposes env vars as `import.meta.env.VITE_...`.
// Prefer `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for client usage.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!supabaseUrl || !supabaseKey) {
	// Warn in dev/local when env vars are missing — avoid throwing at import time.
	// In production, ensure your deployment provider sets these variables.
	 
	console.warn('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
}

let supabaseClient: ReturnType<typeof createClient> | null = null;
if (supabaseUrl && supabaseKey) {
	supabaseClient = createClient(supabaseUrl, supabaseKey);
}

// If Supabase isn't configured, provide a lightweight shim with the
// minimal methods our app calls so importing code doesn't crash at runtime.
const noopError = (msg = 'Supabase not configured') => ({ data: null, error: new Error(msg) });

const supabaseShim = {
	// expose the url so callers can still read it (may be undefined)
	supabaseUrl: supabaseUrl ?? '',
	auth: {
		getSession: async () => ({ data: { session: null } }),
		onAuthStateChange: (_cb: any) => ({ data: { subscription: null } }),
		signUp: async () => noopError(),
		signInWithPassword: async () => noopError(),
		signOut: async () => ({ error: null }),
		resetPasswordForEmail: async () => noopError(),
	},
	functions: {
		invoke: async () => noopError(),
	},
	from: () => ({
		insert: async () => noopError(),
		update: () => ({ eq: async () => noopError() }),
	}),
} as const;

export const supabase = supabaseClient ?? (supabaseShim as unknown as ReturnType<typeof createClient>);

export default supabase;