import { createBrowserClient as createSSRBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";

/**
 * Creates a Supabase client for use in browser / Client Components.
 * Uses @supabase/ssr which syncs the session to cookies so server
 * components stay in sync with the browser session.
 */
export function createBrowserClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createSSRBrowserClient(url, anonKey);
}
