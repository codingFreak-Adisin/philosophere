import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Same build-time constants as src/lib/supabase.ts (injected by vite.config.ts).
const supabaseUrl = __SUPABASE_URL__;
const supabaseAnonKey = __SUPABASE_ANON_KEY__;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Builds a Supabase client that carries the team access code as an
 * `x-admin-code` header on every request. The RLS policies in
 * supabase/migrations/0003_blog_posts_admin.sql check that header to allow
 * inserts/updates/deletes — so the code is the secret and it never has to be
 * baked into the client bundle.
 *
 * Returns null when Supabase isn't configured (local dev without env).
 */
export function createAdminClient(code: string): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { 'x-admin-code': code } },
  });
}
