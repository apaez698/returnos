import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import { RewardRule, CustomerRewardProgress } from "./types";
import { calculateRewardProgress } from "./progress";

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

  return {
    customer_id: customer.id,
    customer_name: customer.name,
    current_points: customer.points,
    nearest_reward: progress.nearestReward,
    progress_percentage: progress.progressPercentage,
    remaining_points: progress.remainingPoints,
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

    return {
      customer_id: customer.id,
      customer_name: customer.name,
      current_points: customer.points,
      nearest_reward: progress.nearestReward,
      progress_percentage: progress.progressPercentage,
      remaining_points: progress.remainingPoints,
      status: progress.status,
    };
  });
}
