import type { RewardCustomerSearchItem } from "@/lib/rewards/reward-customer-types";
import {
  DEFAULT_NEAR_UNLOCK_THRESHOLD_PERCENT,
  isNearUnlockByThreshold,
  resolveRewardCustomerState,
} from "@/lib/rewards/reward-status";
import type { RewardRule } from "@/lib/rewards/types";

export interface RawRewardCustomerRow {
  id: string;
  name: string | null;
  phone: string | null;
  points: number | null;
}

export interface MapRewardCustomersToViewModelInput {
  customers: RawRewardCustomerRow[] | null | undefined;
  activeRewardRules: RewardRule[] | null | undefined;
  redemptionsCountByCustomerId?: Map<string, number> | Record<string, number>;
  nearUnlockThresholdPercent?: number;
}

function getRedemptionsCount(
  customerId: string,
  source: Map<string, number> | Record<string, number> | undefined,
): number {
  if (!source) {
    return 0;
  }

  if (source instanceof Map) {
    return source.get(customerId) ?? 0;
  }

  return source[customerId] ?? 0;
}

function getRewardMilestones(currentPoints: number, activeRules: RewardRule[]) {
  const redeemableReward =
    [...activeRules]
      .reverse()
      .find((rule) => currentPoints >= rule.points_required) ?? null;

  const nextReward =
    activeRules.find((rule) => currentPoints < rule.points_required) ?? null;

  const remainingPointsToNext = nextReward
    ? Math.max(0, nextReward.points_required - currentPoints)
    : 0;

  const progressPercentageToNext = nextReward
    ? Math.min(
        100,
        Math.max(
          0,
          Math.round((currentPoints / nextReward.points_required) * 100),
        ),
      )
    : redeemableReward
      ? 100
      : 0;

  return {
    redeemableReward,
    nextReward,
    remainingPointsToNext,
    progressPercentageToNext,
  };
}

export function mapRewardCustomersToViewModel({
  customers,
  activeRewardRules,
  redemptionsCountByCustomerId,
  nearUnlockThresholdPercent = DEFAULT_NEAR_UNLOCK_THRESHOLD_PERCENT,
}: MapRewardCustomersToViewModelInput): RewardCustomerSearchItem[] {
  if (!customers || customers.length === 0) {
    return [];
  }

  const sortedActiveRules = [...(activeRewardRules ?? [])].sort(
    (a, b) => a.points_required - b.points_required,
  );

  return customers.map((customer) => {
    const currentPoints = Math.max(0, customer.points ?? 0);
    const redemptionsCount = getRedemptionsCount(
      customer.id,
      redemptionsCountByCustomerId,
    );

    const {
      redeemableReward,
      nextReward,
      remainingPointsToNext,
      progressPercentageToNext,
    } = getRewardMilestones(currentPoints, sortedActiveRules);

    const hasRedeemed = redemptionsCount > 0;
    const isEligible = redeemableReward !== null;
    const isNearUnlock = isNearUnlockByThreshold(
      currentPoints,
      nextReward?.points_required ?? null,
      nearUnlockThresholdPercent,
    );

    const rewardStatus = resolveRewardCustomerState({
      has_redeemed: hasRedeemed,
      is_eligible: isEligible,
      is_near_unlock: isNearUnlock,
      is_active: hasRedeemed || currentPoints > 0,
    });

    return {
      customer_id: customer.id,
      customer_name: customer.name?.trim() || "Cliente desconocido",
      customer_phone: customer.phone,
      current_points: currentPoints,
      redemptions_count: redemptionsCount,
      redeemable_reward_id: redeemableReward?.id ?? null,
      redeemable_reward_name: redeemableReward?.name ?? null,
      redeemable_reward_description:
        redeemableReward?.reward_description ?? null,
      redeemable_reward_points_required:
        redeemableReward?.points_required ?? null,
      next_reward_id: nextReward?.id ?? null,
      next_reward_name: nextReward?.name ?? null,
      next_reward_description: nextReward?.reward_description ?? null,
      next_reward_points_required: nextReward?.points_required ?? null,
      progress_percentage_to_next: progressPercentageToNext,
      remaining_points_to_next: remainingPointsToNext,
      has_redeemed: hasRedeemed,
      is_eligible: isEligible,
      is_near_unlock: isNearUnlock,
      reward_status: rewardStatus,
    };
  });
}
