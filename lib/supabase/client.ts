import { createClient } from "@supabase/supabase-js";
import { getSupabaseEnv } from "./env";

/**
 * Creates a Supabase client for use in browser / Client Components.
 * Call this inside a component or hook — do not store at module level
 * so server bundles never accidentally include browser auth state.
 */
export function createBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey);
}
