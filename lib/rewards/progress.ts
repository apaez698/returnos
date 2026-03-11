import { RewardProgressStatus, RewardRule } from "./types";

export interface RewardProgressCalculation {
  nearestReward: RewardRule | null;
  progressPercentage: number;
  remainingPoints: number;
  status: RewardProgressStatus;
}

export function calculateRewardProgress(
  customerPoints: number,
  rewardRules: RewardRule[],
): RewardProgressCalculation {
  const activeRules = rewardRules
    .filter((rule) => rule.is_active)
    .sort((a, b) => a.points_required - b.points_required);

  if (activeRules.length === 0) {
    return {
      nearestReward: null,
      progressPercentage: 0,
      remainingPoints: 0,
      status: "no_reward",
    };
  }

  const nearestRule =
    activeRules.find((rule) => customerPoints <= rule.points_required) ??
    activeRules[activeRules.length - 1];

  const isEligible = customerPoints >= nearestRule.points_required;
  const remainingPoints = Math.max(
    0,
    nearestRule.points_required - customerPoints,
  );
  const progressPercentage = isEligible
    ? 100
    : Math.min(
        100,
        Math.max(
          0,
          Math.round((customerPoints / nearestRule.points_required) * 100),
        ),
      );

  return {
    nearestReward: nearestRule,
    progressPercentage,
    remainingPoints,
    status: isEligible ? "eligible" : "in_progress",
  };
}
