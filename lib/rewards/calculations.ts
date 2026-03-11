import {
  CustomerPoints,
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
