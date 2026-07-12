import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Build-time constants injected by vite.config.ts (define). These are NOT
// read from import.meta.env, so they don't surface as named env vars in the
// browser console. The anon key is public/RLS-protected by design.
const supabaseUrl = __SUPABASE_URL__;
const supabaseAnonKey = __SUPABASE_ANON_KEY__;

/**
 * True when both Supabase values were present at build time. The blog page
 * uses this to decide whether to fetch from Supabase or fall back to seed data.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;
