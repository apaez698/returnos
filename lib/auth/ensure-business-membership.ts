import { createServerClient } from "@/lib/supabase/server";

type Role = "owner" | "staff";

export interface EnsureBusinessMembershipInput {
  userId: string;
  preferredBusinessId?: string | null;
  preferredBusinessSlug?: string | null;
  role?: Role;
}

async function resolveBusinessId(
  preferredBusinessId?: string | null,
  preferredBusinessSlug?: string | null,
): Promise<string | null> {
  const supabase = createServerClient();

  if (preferredBusinessId) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", preferredBusinessId)
      .maybeSingle();

    if (data?.id) {
      return data.id;
    }
  }

  if (preferredBusinessSlug) {
    const { data } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", preferredBusinessSlug)
      .maybeSingle();

    if (data?.id) {
      return data.id;
    }
  }

  return null;
}

export async function ensureBusinessMembership({
  userId,
  preferredBusinessId,
  preferredBusinessSlug,
  role = "owner",
}: EnsureBusinessMembershipInput): Promise<string | null> {
  const supabase = createServerClient();

  const { data: existingMembership } = await supabase
    .from("business_users")
    .select("business_id")
    .eq("user_id", userId)
    .limit(1)
    .maybeSingle();

  if (existingMembership?.business_id) {
    return existingMembership.business_id;
  }

  const businessId = await resolveBusinessId(
    preferredBusinessId,
    preferredBusinessSlug,
  );

  if (!businessId) {
    return null;
  }

  const { error } = await supabase.from("business_users").upsert(
    {
      business_id: businessId,
      user_id: userId,
      role,
    },
    {
      onConflict: "business_id,user_id",
      ignoreDuplicates: true,
    },
  );

  if (error) {
    throw new Error("No se pudo vincular el usuario con el negocio.");
  }

  return businessId;
}
