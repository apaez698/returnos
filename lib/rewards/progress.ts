import { CustomerRewardStateResult, RewardRule } from "./types";

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

export function getNextReward(
  customerPoints: number,
  rewardRules: RewardRule[],
): RewardRule | null {
  const activeRules = getActiveSortedRules(rewardRules);

  return (
    activeRules.find((rule) => rule.points_required > customerPoints) ?? null
  );
}

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
