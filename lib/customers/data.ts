import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import { CustomerListItem } from "./types";

export async function getCustomersForCurrentBusiness(): Promise<
  CustomerListItem[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select(
      "id, name, phone, email, birthday, consent_marketing, last_visit_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los clientes.");
  }

  return (data ?? []) as CustomerListItem[];
}

export async function getCustomersWithPointsForCurrentBusiness(): Promise<
  (Pick<CustomerListItem, "id" | "name" | "phone" | "last_visit_at"> & {
    points: number;
  })[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("customers")
    .select("id, name, phone, last_visit_at, points")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar los clientes.");
  }

  return (data ?? []) as (Pick<
    CustomerListItem,
    "id" | "name" | "phone" | "last_visit_at"
  > & { points: number })[];
}
