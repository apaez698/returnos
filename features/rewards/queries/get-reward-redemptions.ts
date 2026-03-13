/**
 * Query helper to retrieve reward redemptions for the current business
 * with support for filtering by customer, reward, and date range
 */

import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import {
  GetReddemptionsOptions,
  ReddemptionsQueryResult,
} from "@/lib/rewards/redemptions-types";
import {
  mapRedemptionsToViewModel,
  RawRedemptionRow,
} from "@/lib/rewards/map-redemptions-to-view-model";

/**
 * Helper to escape special LIKE pattern characters for safe searches
 */
function escapeLikePattern(str: string): string {
  return str.replace(/[%_\\]/g, "\\$&");
}

/**
 * Retrieve reward redemptions for the current business with optional filters
 *
 * Features:
 * - Joins customer information (name, phone)
 * - Joins reward rule information (name, description)
 * - Supports multi-field customer search (name or phone with case-insensitive match)
 * - Supports filtering by reward ID or reward name
 * - Supports date range filtering
 * - Returns results ordered by redemption date (newest first)
 * - Returns typed view model suitable for UI consumption
 *
 * @param options - Optional filtering and pagination options
 * @returns Query result with redemption items and total count
 * @throws Error if business context cannot be resolved or query fails
 */
export async function getRewardRedemptions(
  options: GetReddemptionsOptions = {},
): Promise<ReddemptionsQueryResult> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const {
    customer_search,
    reward_id,
    reward_name,
    start_date,
    end_date,
    limit = 100,
  } = options;

  try {
    // Start building the query with joins to customer and reward_rules
    let query = supabase.from("reward_redemptions").select(
      `
        id,
        business_id,
        customer_id,
        reward_rule_id,
        points_spent,
        redeemed_at,
        created_at,
        customers(name, phone),
        reward_rules(id, name, reward_description)
      `,
    );

    // Apply business filter (multi-tenant isolation)
    query = query.eq("business_id", businessId);

    // Apply customer search filter (name or phone with case-insensitive search)
    if (customer_search && customer_search.trim().length > 0) {
      const escapedSearch = escapeLikePattern(customer_search.trim());
      const likePattern = `%${escapedSearch}%`;
      query = query.or(
        `customers.name.ilike.${likePattern},customers.phone.ilike.${likePattern}`,
      );
    }

    // Apply reward ID filter
    if (reward_id && reward_id.trim().length > 0) {
      query = query.eq("reward_rule_id", reward_id.trim());
    }

    // Apply reward name filter (case-insensitive search)
    if (reward_name && reward_name.trim().length > 0) {
      const escapedRewardName = escapeLikePattern(reward_name.trim());
      const likePattern = `%${escapedRewardName}%`;
      query = query.filter("reward_rules.name", "ilike", likePattern);
    }

    // Apply date range filters
    if (start_date && start_date.trim().length > 0) {
      query = query.gte("redeemed_at", start_date.trim());
    }
    if (end_date && end_date.trim().length > 0) {
      // Add one day to end_date to include all records on that day
      const endDateObj = new Date(end_date.trim());
      endDateObj.setDate(endDateObj.getDate() + 1);
      query = query.lt("redeemed_at", endDateObj.toISOString());
    }

    // Order by redemption date (newest first) and apply limit
    query = query.order("redeemed_at", { ascending: false }).limit(limit);

    // Execute query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching reward redemptions:", error);
      throw new Error(
        "No se pudieron cargar los canjes de recompensas. Por favor, intenta de nuevo.",
      );
    }

    const items = mapRedemptionsToViewModel(data as RawRedemptionRow[]);

    return {
      items,
      total_count: count ?? items.length,
    };
  } catch (err) {
    if (err instanceof Error && err.message.includes("canjes")) {
      throw err; // Re-throw our custom errors
    }

    console.error("Unexpected error in getRewardRedemptions:", err);
    throw new Error(
      "Error inesperado al cargar los canjes de recompensas. Por favor, contacta con soporte.",
    );
  }
}

/**
 * Retrieve redemptions for a specific customer
 *
 * @param customerId - The customer ID
 * @param options - Optional filtering options (date range, reward filters)
 * @returns Query result with customer's redemption items
 * @throws Error if business context cannot be resolved or query fails
 */
export async function getCustomerRedemptions(
  customerId: string,
  options: Omit<GetReddemptionsOptions, "customer_search"> = {},
): Promise<ReddemptionsQueryResult> {
  return getRewardRedemptions({
    ...options,
    customer_search: undefined, // Ignore customer_search when querying specific customer
  }).then((result) => ({
    ...result,
    items: result.items.filter((item) => item.customer_id === customerId),
  }));
}

/**
 * Retrieve redemptions for a specific reward rule
 *
 * @param rewardId - The reward rule ID
 * @param options - Optional filtering options (customer search, date range)
 * @returns Query result with redemptions for that reward
 * @throws Error if business context cannot be resolved or query fails
 */
export async function getRewardRedemptionsByReward(
  rewardId: string,
  options: Omit<GetReddemptionsOptions, "reward_id" | "reward_name"> = {},
): Promise<ReddemptionsQueryResult> {
  return getRewardRedemptions({
    ...options,
    reward_id: rewardId,
  });
}

/**
 * Get redemptions for a specific date range
 *
 * @param startDate - ISO date string for start of range
 * @param endDate - ISO date string for end of range
 * @param options - Optional filtering options (customer search, reward filters)
 * @returns Query result with redemptions in the date range
 * @throws Error if business context cannot be resolved or query fails
 */
export async function getRedemptionsByDateRange(
  startDate: string,
  endDate: string,
  options: Omit<GetReddemptionsOptions, "start_date" | "end_date"> = {},
): Promise<ReddemptionsQueryResult> {
  return getRewardRedemptions({
    ...options,
    start_date: startDate,
    end_date: endDate,
  });
}
