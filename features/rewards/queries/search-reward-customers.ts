import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { buildRewardSearchFilters } from "@/features/rewards/utils/build-reward-search-filters";
import {
  mapRewardCustomersToViewModel,
  type RawRewardCustomerRow,
} from "@/features/rewards/utils/map-reward-customers-to-view-model";
import type {
  SearchRewardCustomersOptions,
  SearchRewardCustomersResult,
} from "@/lib/rewards/reward-customer-types";
import { matchesRewardStatusFilter } from "@/lib/rewards/reward-status";
import type { RewardRule } from "@/lib/rewards/types";
import { createServerClient } from "@/lib/supabase/server";

export async function searchRewardCustomers(
  options: SearchRewardCustomersOptions = {},
): Promise<SearchRewardCustomersResult> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const filters = buildRewardSearchFilters(options);

  if (filters.limit <= 0) {
    return { items: [], total_count: 0 };
  }

  let customersQuery = supabase
    .from("customers")
    .select("id, name, phone, points")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false })
    .limit(filters.limit);

  if (filters.query_like_pattern) {
    customersQuery = customersQuery.or(
      `name.ilike.${filters.query_like_pattern},phone.ilike.${filters.query_like_pattern}`,
    );
  }

  const { data: customers, error: customersError } = await customersQuery;

  if (customersError) {
    console.error("Error searching reward customers:", customersError);
    throw new Error(
      "No se pudieron buscar clientes de recompensas. Por favor, intenta de nuevo.",
    );
  }

  const customerRows = (customers ?? []) as RawRewardCustomerRow[];

  if (customerRows.length === 0) {
    return { items: [], total_count: 0 };
  }

  const customerIds = customerRows.map((customer) => customer.id);

  const [{ data: rewardRules, error: rewardRulesError }, redemptionsResponse] =
    await Promise.all([
      supabase
        .from("reward_rules")
        .select(
          "id, business_id, name, points_required, reward_description, is_active, created_at",
        )
        .eq("business_id", businessId)
        .eq("is_active", true)
        .order("points_required", { ascending: true }),
      supabase
        .from("reward_redemptions")
        .select("customer_id")
        .eq("business_id", businessId)
        .in("customer_id", customerIds),
    ]);

  if (rewardRulesError) {
    console.error(
      "Error fetching reward rules for customer search:",
      rewardRulesError,
    );
    throw new Error(
      "No se pudieron cargar las reglas de recompensas. Por favor, intenta de nuevo.",
    );
  }

  if (redemptionsResponse.error) {
    console.error(
      "Error fetching reward redemptions for customer search:",
      redemptionsResponse.error,
    );
    throw new Error(
      "No se pudieron cargar los canjes de recompensas. Por favor, intenta de nuevo.",
    );
  }

  const activeRules = (rewardRules ?? []) as RewardRule[];

  const redemptionsCountByCustomerId = new Map<string, number>();
  for (const redemption of redemptionsResponse.data ?? []) {
    const customerId = redemption.customer_id as string;
    redemptionsCountByCustomerId.set(
      customerId,
      (redemptionsCountByCustomerId.get(customerId) ?? 0) + 1,
    );
  }

  const mappedItems = mapRewardCustomersToViewModel({
    customers: customerRows,
    activeRewardRules: activeRules,
    redemptionsCountByCustomerId,
    nearUnlockThresholdPercent: filters.near_unlock_threshold_percent,
  });

  const items = mappedItems.filter((item) =>
    matchesRewardStatusFilter(item.reward_status, filters.status),
  );

  return {
    items,
    total_count: items.length,
  };
}
