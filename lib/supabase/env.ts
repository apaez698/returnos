/**
 * Validates and returns required Supabase environment variables.
 * Throws early with a clear message if anything is missing.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const apiKey = publishableKey || anonKey;

  if (!url) {
    throw new Error("Missing env var: NEXT_PUBLIC_SUPABASE_URL");
  }
  if (!apiKey) {
    throw new Error(
      "Missing env var: NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return { url, anonKey: apiKey };
}
