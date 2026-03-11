import { createServerClient } from "@/lib/supabase/server";

export interface Business {
  id: string;
  name: string;
  slug: string;
  business_type: "restaurant" | "bakery";
  created_at: string;
}

/**
 * Fetches a business by slug from Supabase.
 * Returns the business record or null if not found.
 */
export async function getBusinessBySlug(
  slug: string,
): Promise<Business | null> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("businesses")
    .select("id, name, slug, business_type, created_at")
    .eq("slug", slug)
    .maybeSingle();

  if (error) {
    console.error("Error fetching business by slug:", error);
    return null;
  }

  return data;
}
