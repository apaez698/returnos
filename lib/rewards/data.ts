import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import { RewardRule, CustomerRewardProgress } from "./types";
import { calculateRewardProgress } from "./progress";
import {
  GetReddemptionsOptions,
  ReddemptionsQueryResult,
} from "./redemptions-types";
import {
  mapRedemptionsToViewModel,
  RawRedemptionRow,
} from "./map-redemptions-to-view-model";

export async function getRewardRulesForCurrentBusiness(): Promise<
  RewardRule[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reward_rules")
    .select("*")
    .eq("business_id", businessId)
    .order("points_required", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las reglas de recompensas.");
  }

  return (data ?? []) as RewardRule[];
}

export async function getActiveRewardRulesForCurrentBusiness(): Promise<
  RewardRule[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reward_rules")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  if (error) {
    throw new Error("No se pudieron cargar las reglas de recompensas activas.");
  }

  return (data ?? []) as RewardRule[];
}

export async function getCustomerRewardProgress(
  customerId: string,
): Promise<CustomerRewardProgress | null> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  // Get customer data
  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .select("id, name, points")
    .eq("id", customerId)
    .eq("business_id", businessId)
    .limit(1)
    .maybeSingle();

  if (customerError || !customer) {
    return null;
  }

  // Get active reward rules
  const { data: rewards, error: rewardsError } = await supabase
    .from("reward_rules")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  if (rewardsError) {
    throw new Error("No se pudieron cargar las recompensas disponibles.");
  }

  const activeRewards = (rewards ?? []) as RewardRule[];
  const progress = calculateRewardProgress(customer.points, activeRewards);
  const nearestReward = progress.redeemableReward ?? progress.nextReward;
  const progressPercentageToNext = progress.progressPercentageToNext;
  const remainingPointsToNext = progress.remainingPointsToNext;

  return {
    customer_id: customer.id,
    customer_name: customer.name,
    current_points: customer.points,
    redeemable_reward: progress.redeemableReward,
    next_reward: progress.nextReward,
    progress_percentage_to_next: progressPercentageToNext,
    remaining_points_to_next: remainingPointsToNext,
    // Legacy fields for existing UI consumers.
    nearest_reward: nearestReward,
    progress_percentage: progressPercentageToNext,
    remaining_points: remainingPointsToNext,
    status: progress.status,
  };
}

export async function getCustomerRewardProgressList(): Promise<
  CustomerRewardProgress[]
> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  // Get all customers
  const { data: customers, error: customersError } = await supabase
    .from("customers")
    .select("id, name, points")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (customersError || !customers) {
    throw new Error("No se pudieron cargar los clientes.");
  }

  // Get active reward rules
  const { data: rewards, error: rewardsError } = await supabase
    .from("reward_rules")
    .select("*")
    .eq("business_id", businessId)
    .eq("is_active", true)
    .order("points_required", { ascending: true });

  if (rewardsError) {
    throw new Error("No se pudieron cargar las recompensas disponibles.");
  }

  const activeRewards = (rewards ?? []) as RewardRule[];

  return customers.map((customer) => {
    const progress = calculateRewardProgress(customer.points, activeRewards);
    const nearestReward = progress.redeemableReward ?? progress.nextReward;
    const progressPercentageToNext = progress.progressPercentageToNext;
    const remainingPointsToNext = progress.remainingPointsToNext;

    return {
      customer_id: customer.id,
      customer_name: customer.name,
      current_points: customer.points,
      redeemable_reward: progress.redeemableReward,
      next_reward: progress.nextReward,
      progress_percentage_to_next: progressPercentageToNext,
      remaining_points_to_next: remainingPointsToNext,
      // Legacy fields for existing UI consumers.
      nearest_reward: nearestReward,
      progress_percentage: progressPercentageToNext,
      remaining_points: remainingPointsToNext,
      status: progress.status,
    };
  });
}

export async function getRedemptionsForCurrentBusiness(
  options?: GetReddemptionsOptions,
): Promise<ReddemptionsQueryResult> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  let query = supabase
    .from("reward_redemptions")
    .select(
      `
      id,
      customer_id,
      reward_rule_id,
      points_spent,
      redeemed_at,
      created_at,
      customers (id, name, phone),
      reward_rules (id, name, reward_description)
    `,
      { count: "exact" },
    )
    .eq("business_id", businessId)
    .order("redeemed_at", { ascending: false });

  // Apply filters
  if (options?.customer_search) {
    query = query.or(
      `customers.name.ilike.%${options.customer_search}%,customers.phone.ilike.%${options.customer_search}%`,
    );
  }

  if (options?.reward_id) {
    query = query.eq("reward_rule_id", options.reward_id);
  }

  if (options?.reward_name) {
    query = query.ilike("reward_rules.name", `%${options.reward_name}%`);
  }

  if (options?.start_date) {
    query = query.gte("redeemed_at", options.start_date);
  }

  if (options?.end_date) {
    query = query.lte("redeemed_at", options.end_date);
  }

  const limit = options?.limit ?? 100;
  query = query.limit(limit);

  const { data, error, count } = await query;

  if (error) {
    throw new Error("No se pudieron cargar los canjes de recompensas.");
  }

  const items = mapRedemptionsToViewModel(data as RawRedemptionRow[]);

  return {
    items,
    total_count: count ?? 0,
  };
}
