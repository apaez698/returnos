import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import { PosCustomer, PosRewardThreshold } from "./types";

function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, "\\$&");
}

export async function getPosCustomersForCurrentBusiness(): Promise<
  PosCustomer[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, points, last_visit_at")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar clientes para caja.");
  }

  return (data ?? []) as PosCustomer[];
}

export async function searchPosCustomersForCurrentBusiness(
  rawQuery: string,
  maxResults = 8,
): Promise<PosCustomer[]> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const query = rawQuery.trim();

  if (query.length === 0) {
    const { data, error } = await supabase
      .from("customers")
      .select("id, name, phone, points, last_visit_at")
      .eq("business_id", businessId)
      .order("created_at", { ascending: false })
      .limit(maxResults);

    if (error) {
      throw new Error("No se pudieron buscar clientes para caja.");
    }

    return (data ?? []) as PosCustomer[];
  }

  const escapedQuery = escapeLikePattern(query);
  const likePattern = `%${escapedQuery}%`;

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, points, last_visit_at")
    .eq("business_id", businessId)
    .or(`name.ilike.${likePattern},phone.ilike.${likePattern}`)
    .order("name", { ascending: true })
    .limit(maxResults);

  if (error) {
    throw new Error("No se pudieron buscar clientes para caja.");
  }

  return (data ?? []) as PosCustomer[];
}

export async function getActiveRewardThresholdsForCurrentBusiness(): Promise<
  PosRewardThreshold[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reward_rules")
    .select("id, name, points_required, is_active")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar recompensas activas para caja.");
  }

  return (data ?? []) as PosRewardThreshold[];
}
