import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import { RecentVisitItem, VisitSource } from "./types";

type VisitRow = {
  id: string;
  customer_id: string;
  points_earned: number;
  amount: number | null;
  product_category: string | null;
  source: VisitSource;
  created_at: string;
  customers: { name: string } | { name: string }[] | null;
};

function extractCustomerName(relation: VisitRow["customers"]): string {
  if (!relation) {
    return "Cliente";
  }

  if (Array.isArray(relation)) {
    return relation[0]?.name ?? "Cliente";
  }

  return relation.name;
}

export async function getRecentVisitsForCurrentBusiness(
  limit = 20,
): Promise<RecentVisitItem[]> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("visits")
    .select(
      "id, customer_id, points_earned, amount, product_category, source, created_at, customers(name)",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("No se pudieron cargar las visitas recientes.");
  }

  const rows = (data ?? []) as VisitRow[];

  return rows.map((row) => ({
    id: row.id,
    customer_id: row.customer_id,
    customer_name: extractCustomerName(row.customers),
    points_earned: row.points_earned,
    amount: row.amount,
    product_category: row.product_category,
    source: row.source,
    created_at: row.created_at,
  }));
}
