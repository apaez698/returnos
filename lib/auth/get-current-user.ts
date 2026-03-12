import { createServerAuthClient } from "@/lib/supabase/server";

export interface CurrentUser {
  id: string;
  email: string;
}

/**
 * Returns the authenticated user from the current Supabase session,
 * or null if no valid session exists.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return { id: user.id, email: user.email };
}
