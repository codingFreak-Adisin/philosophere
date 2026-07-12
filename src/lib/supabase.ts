import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Vite exposes env vars prefixed with VITE_ to the client bundle.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * True when both Supabase env vars are present. The blog page uses this to
 * decide whether to fetch from Supabase or fall back to local seed data.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null;
