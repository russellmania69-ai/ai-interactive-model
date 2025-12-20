import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createMockSupabase } from './supabase-mock';

// Initialize Supabase client using environment variables (Vite: import.meta.env)
// Vite exposes env vars as `import.meta.env.VITE_...`.
// Prefer `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for client usage.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

// Provide a top-level `supabase` binding assigned conditionally so we never use
// `export` inside a block (which is invalid syntax).
let supabase: SupabaseClient | unknown;

export const supabaseEnabled = !!(supabaseUrl && supabaseKey);

if (!supabaseUrl || !supabaseKey) {
	console.warn('Missing Supabase env vars: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');

	// In development, provide a lightweight mock so the UI can run without a
	// configured Supabase project. In production, keep the previous behaviour
	// (proxy that throws) to avoid silently using a mock in CI/prod.
	const mockFlag = import.meta.env.VITE_USE_SUPABASE_MOCK;
	const useMock = import.meta.env.DEV || !!mockFlag;
	const seededMock = mockFlag === 'seed' || mockFlag === 'seeded';

	if (useMock) {
	  // use mock implementation; allow `VITE_USE_SUPABASE_MOCK=seed` to enable seeded data
	  supabase = createMockSupabase({ seeded: seededMock });
	} else {
		const missingHandler: ProxyHandler<unknown> = {
			get: (_target, prop) => new Proxy(() => {
				throw new Error(
					`Supabase client not initialized. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Attempted to access ${String(
						prop
					)}`
				);
			}, missingHandler),
			apply: () => {
				throw new Error('Supabase client not initialized. Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY.');
			}
		};

		supabase = new Proxy({}, missingHandler);
	}
} else {
	supabase = createClient(supabaseUrl, supabaseKey) as SupabaseClient;
}

export { supabase };