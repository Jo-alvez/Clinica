/**
 * Supabase client configuration
 * Reads credentials from Vite env vars (VITE_ prefix exposes them to the browser).
 * Falls back to null when vars are absent, so the app works in local dev
 * with mock users until real credentials are configured.
 */
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey: string = (import.meta as unknown as { env: Record<string, string> }).env.VITE_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não configurados. ' +
    'O login usará os usuários mock locais como fallback.'
  );
}

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;
