import { calculateRewardProgress } from "@/lib/rewards/progress";
import type {
  LoyaltyCardRewardSnapshot,
  LoyaltyCardViewModel,
  MapLoyaltyCardViewModelInput,
  Relation,
} from "@/features/loyalty-card/types/loyalty-card-types";

function getRelationValue<T>(relation: Relation<T>): T | null {
  if (!relation) {
    return null;
  }

  return Array.isArray(relation) ? (relation[0] ?? null) : relation;
}

function mapRewardSnapshot(
  reward: {
    id: string;
    name: string;
    points_required: number;
    reward_description: string;
  } | null,
): LoyaltyCardRewardSnapshot | null {
  if (!reward) {
    return null;
  }

  return {
    id: reward.id,
    name: reward.name,
    points_required: reward.points_required,
    reward_description: reward.reward_description,
  };
}

export function mapLoyaltyCardViewModel({
  customer,
  activeRewardRules,
}: MapLoyaltyCardViewModelInput): LoyaltyCardViewModel {
  const business = getRelationValue(customer.businesses);
  const currentPoints = Math.max(0, customer.points ?? 0);
  const rewardProgress = calculateRewardProgress(
    currentPoints,
    activeRewardRules ?? [],
  );

  const rewardTargetPoints =
    rewardProgress.nextReward?.points_required ??
    rewardProgress.redeemableReward?.points_required ??
    null;

  return {
    customer: {
      id: customer.id,
      name: customer.name?.trim() || "Unknown customer",
      phone: customer.phone,
    },
    business: {
      id: business?.id ?? customer.business_id,
      name: business?.name ?? "Unknown business",
      slug: business?.slug ?? "",
      business_type: business?.business_type ?? "unknown",
    },
    loyalty: {
      status: rewardProgress.status,
      current_points: currentPoints,
      reward_target_points: rewardTargetPoints,
      progress_percentage_to_target: rewardProgress.progressPercentageToNext,
      remaining_points_to_target: rewardProgress.remainingPointsToNext,
      redeemable_reward: mapRewardSnapshot(rewardProgress.redeemableReward),
      next_reward: mapRewardSnapshot(rewardProgress.nextReward),
    },
  };
}
