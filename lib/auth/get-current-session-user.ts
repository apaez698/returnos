import { createServerAuthClient } from "@/lib/supabase/server";

export interface SessionUser {
  id: string;
  email: string;
}

/**
 * Returns the authenticated user from the current Supabase session,
 * or null if no valid session exists.
 */
export async function getCurrentSessionUser(): Promise<SessionUser | null> {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  return { id: user.id, email: user.email };
}
