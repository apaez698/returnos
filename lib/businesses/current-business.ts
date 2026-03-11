import { createServerClient } from "@/lib/supabase/server";

const DEFAULT_BUSINESS_ID =
  process.env.DEFAULT_BUSINESS_ID ??
  process.env.NEXT_PUBLIC_DEFAULT_BUSINESS_ID;

/**
 * Returns the business id currently in scope for dashboard operations.
 * For MVP simplicity, we try the signed-in user's membership first,
 * then fall back to the first business in the database.
 */
export async function getCurrentBusinessId(): Promise<string> {
  if (DEFAULT_BUSINESS_ID) {
    return DEFAULT_BUSINESS_ID;
  }

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: membership } = await supabase
      .from("business_users")
      .select("business_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

    if (membership?.business_id) {
      return membership.business_id;
    }
  }

  const { data: business, error } = await supabase
    .from("businesses")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error("No se pudo resolver el negocio actual.");
  }
  if (!business) {
    throw new Error("No hay negocios registrados todavia.");
  }

  return business.id;
}
