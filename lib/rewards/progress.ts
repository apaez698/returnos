import { RewardProgressStatus, RewardRule } from "./types";

export interface RewardProgressCalculation {
  reward: RewardRule | null;
  progress_percentage: number;
  remaining_points: number;
  status: RewardProgressStatus;
}

function getActiveSortedRules(rewardRules: RewardRule[]): RewardRule[] {
  return rewardRules
    .filter((rule) => rule.is_active)
    .sort((a, b) => a.points_required - b.points_required);
}

export function getBestRedeemableReward(
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
): RewardProgressCalculation {
  const activeRules = getActiveSortedRules(rewardRules);

  if (activeRules.length === 0) {
    return {
      reward: null,
      progress_percentage: 0,
      remaining_points: 0,
      status: "no_reward",
    };
  }

  const redeemableReward = getBestRedeemableReward(customerPoints, activeRules);
  if (redeemableReward) {
    return {
      reward: redeemableReward,
      progress_percentage: 100,
      remaining_points: 0,
      status: "redeemable",
    };
  }

  const nextReward = getNextReward(customerPoints, activeRules);
  if (!nextReward) {
    return {
      reward: null,
      progress_percentage: 0,
      remaining_points: 0,
      status: "no_reward",
    };
  }

  const remainingPoints = Math.max(
    0,
    nextReward.points_required - customerPoints,
  );
  const progressPercentage = Math.min(
    100,
    Math.max(
      0,
      Math.round((customerPoints / nextReward.points_required) * 100),
    ),
  );

  return {
    reward: nextReward,
    progress_percentage: progressPercentage,
    remaining_points: remainingPoints,
    status: "in_progress",
  };
}
