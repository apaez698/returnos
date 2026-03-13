import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import type {
  GetPurchaseSummaryDataInput,
  PurchaseSummaryData,
  PurchaseSummaryRewardRule,
} from "@/features/purchases/types/purchase-summary-types";

type SupabaseClient = ReturnType<typeof createServerClient>;

type RawVisitRow = {
  id: string;
  business_id: string;
  customer_id: string;
  points_earned: number;
  amount: number | null;
  source: "manual" | "in_store" | "qr";
  created_at: string;
};

type RawCustomerRow = {
  id: string;
  name: string | null;
  points: number;
};

type RawRewardRuleRow = {
  id: string;
  business_id: string;
  name: string;
  points_required: number;
  reward_description: string;
  is_active: boolean;
};

export interface GetPurchaseSummaryDataOptions {
  supabase?: SupabaseClient;
}

function calculatePointsEarned(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  // MVP rule for POS purchases: 1 point per whole currency unit.
  return Math.floor(amount);
}

function selectActiveRewardRuleForCustomer(
  activeRules: RawRewardRuleRow[],
  totalAccumulatedPoints: number,
): RawRewardRuleRow | null {
  if (activeRules.length === 0) {
    return null;
  }

  const sortedRules = [...activeRules].sort(
    (a, b) => a.points_required - b.points_required,
  );

  const nextRule = sortedRules.find(
    (rule) => rule.points_required > totalAccumulatedPoints,
  );

  return nextRule ?? sortedRules[sortedRules.length - 1] ?? null;
}

function mapRewardRule(row: RawRewardRuleRow): PurchaseSummaryRewardRule {
  return {
    id: row.id,
    businessId: row.business_id,
    name: row.name,
    pointsRequired: row.points_required,
    rewardDescription: row.reward_description,
  };
}

export async function getPurchaseSummaryData(
  input: GetPurchaseSummaryDataInput,
  options: GetPurchaseSummaryDataOptions = {},
): Promise<PurchaseSummaryData> {
  const visitId = input.visitId.trim();

  if (!visitId) {
    throw new Error("visitId is required to build purchase summary data.");
  }

  const businessId = input.businessId?.trim() || (await getCurrentBusinessId());
  const supabase = options.supabase ?? createServerClient();

  const { data: visitData, error: visitError } = await supabase
    .from("visits")
    .select(
      "id, business_id, customer_id, points_earned, amount, source, created_at",
    )
    .eq("id", visitId)
    .eq("business_id", businessId)
    .limit(1)
    .maybeSingle();

  if (visitError) {
    console.error("Error fetching purchase visit summary data:", visitError);
    throw new Error("No se pudo cargar la visita recién creada.");
  }

  const visit = visitData as RawVisitRow | null;

  if (!visit) {
    throw new Error("No se encontró la visita para el resumen de compra.");
  }

  const [{ data: customerData, error: customerError }, rewardRulesResponse] =
    await Promise.all([
      supabase
        .from("customers")
        .select("id, name, points")
        .eq("id", visit.customer_id)
        .eq("business_id", businessId)
        .limit(1)
        .maybeSingle(),
      supabase
        .from("reward_rules")
        .select(
          "id, business_id, name, points_required, reward_description, is_active",
        )
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("points_required", { ascending: true }),
    ]);

  if (customerError) {
    console.error("Error fetching purchase summary customer:", customerError);
    throw new Error("No se pudieron cargar los puntos acumulados del cliente.");
  }

  if (rewardRulesResponse.error) {
    console.error(
      "Error fetching purchase summary reward rules:",
      rewardRulesResponse.error,
    );
    throw new Error("No se pudieron cargar las reglas de recompensa activas.");
  }

  const customer = customerData as RawCustomerRow | null;

  if (!customer) {
    throw new Error("No se encontró el cliente de la visita registrada.");
  }

  const totalAccumulatedPoints = customer.points;
  const purchaseAmount = visit.amount ?? 0;
  const calculatedPointsEarned = calculatePointsEarned(purchaseAmount);
  const pointsEarned =
    calculatedPointsEarned === visit.points_earned
      ? calculatedPointsEarned
      : visit.points_earned;
  const activeRules = (rewardRulesResponse.data ?? []) as RawRewardRuleRow[];
  const selectedRule = selectActiveRewardRuleForCustomer(
    activeRules,
    totalAccumulatedPoints,
  );

  return {
    visit: {
      id: visit.id,
      businessId: visit.business_id,
      customerId: visit.customer_id,
      amount: purchaseAmount,
      source: visit.source,
      createdAt: visit.created_at,
    },
    customerName: customer.name ?? "Cliente",
    pointsEarned,
    totalAccumulatedPoints,
    activeRewardRule: selectedRule ? mapRewardRule(selectedRule) : null,
    pointsToNextReward: selectedRule
      ? Math.max(0, selectedRule.points_required - totalAccumulatedPoints)
      : null,
  };
}
