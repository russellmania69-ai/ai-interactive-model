// Expose a small helper to read the configured default LLM for clients.
export function getDefaultLLM(): string | undefined {
  // Vite exposes env vars via import.meta.env
  const v = (import.meta as { env?: Record<string, string | undefined> }).env;
  return v?.VITE_DEFAULT_LLM || undefined;
}

export const DEFAULT_LLM = getDefaultLLM();
