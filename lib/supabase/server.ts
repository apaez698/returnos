import { createClient } from "@supabase/supabase-js";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSupabaseEnv } from "./env";

/**
 * Creates a Supabase client for DB queries in Server Components, Route Handlers,
 * and Server Actions. Does not read auth cookies — use createServerAuthClient
 * when you need to identify the current user from the session.
 */
export function createServerClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient(url, anonKey, {
    auth: { persistSession: false },
  });
}

/**
 * Creates a cookie-aware Supabase client that reads/writes the auth session
 * from Next.js request cookies (via @supabase/ssr). Use this whenever you
 * need to call supabase.auth.getUser() on the server.
 */
export async function createServerAuthClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();
  return createSSRClient(url, anonKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Called from a Server Component — cookies are read-only.
          // The middleware will handle refreshing the session.
        }
      },
    },
  });
}
