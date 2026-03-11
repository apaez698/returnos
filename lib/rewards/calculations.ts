import {
  CustomerPoints,
  CustomerRewardStateResult,
  RewardProgress,
  RewardRule,
  RewardStatus,
} from "./types";

export function calculateProgress(
  customer: CustomerPoints,
  rules: RewardRule[],
): RewardProgress | null {
  const activeRules = rules
    .filter((rule) => rule.is_active)
    .sort((a, b) => a.points_required - b.points_required);

  if (activeRules.length === 0) {
    return null;
  }

  const nearestRule =
    activeRules.find((rule) => customer.points <= rule.points_required) ??
    activeRules[activeRules.length - 1];

  const isRedeemable = customer.points >= nearestRule.points_required;
  const remaining_points = Math.max(
    0,
    nearestRule.points_required - customer.points,
  );
  const progress_percentage = isRedeemable
    ? 100
    : Math.min(
        100,
        Math.max(
          0,
          Math.round((customer.points / nearestRule.points_required) * 100),
        ),
      );

  return {
    reward: nearestRule,
    status: isRedeemable ? RewardStatus.redeemable : RewardStatus.in_progress,
    progress_percentage,
    remaining_points,
  };
}

export function getNextReward(
  customerPoints: number,
  rewardRules: RewardRule[],
): RewardRule | null {
  return (
    rewardRules
      .filter((rule) => rule.points_required > customerPoints)
      .sort((a, b) => a.points_required - b.points_required)[0] ?? null
  );
}

function getActiveSortedRules(rewardRules: RewardRule[]): RewardRule[] {
  return rewardRules
    .filter((rule) => rule.is_active)
    .sort((a, b) => a.points_required - b.points_required);
}

export function getRedeemableReward(
  customerPoints: number,
  rewardRules: RewardRule[],
): RewardRule | null {
  const activeRules = getActiveSortedRules(rewardRules);

  const redeemableRules = activeRules.filter(
    (rule) => rule.points_required <= customerPoints,
  );

  return redeemableRules.length > 0
    ? redeemableRules[redeemableRules.length - 1]
    : null;
}

export const getBestRedeemableReward = getRedeemableReward;

export function calculateRewardProgress(
  customerPoints: number,
  rewardRules: RewardRule[],
): CustomerRewardStateResult {
  const activeRules = getActiveSortedRules(rewardRules);

  if (activeRules.length === 0) {
    return {
      redeemableReward: null,
      nextReward: null,
      progressPercentageToNext: 0,
      remainingPointsToNext: 0,
      status: "no_reward",
    };
  }

  const redeemableReward = getRedeemableReward(customerPoints, activeRules);
  const nextReward = getNextReward(customerPoints, activeRules);

  if (redeemableReward && !nextReward) {
    return {
      redeemableReward,
      nextReward: null,
      progressPercentageToNext: 100,
      remainingPointsToNext: 0,
      status: "redeemable",
    };
  }

  if (!nextReward) {
    return {
      redeemableReward,
      nextReward: null,
      progressPercentageToNext: 0,
      remainingPointsToNext: 0,
      status: "no_reward",
    };
  }

  const remainingPointsToNext = Math.max(
    0,
    nextReward.points_required - customerPoints,
  );
  const progressPercentageToNext = Math.min(
    100,
    Math.max(
      0,
      Math.round((customerPoints / nextReward.points_required) * 100),
    ),
  );

  return {
    redeemableReward,
    nextReward,
    progressPercentageToNext,
    remainingPointsToNext,
    status: redeemableReward ? "redeemable" : "in_progress",
  };
}
