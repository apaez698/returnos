export interface RewardRedemptionSummary {
  currentPoints: number;
  pointsRequired: number;
  pointsAfterRedemption: number;
  canRedeem: boolean;
}

export function getRewardRedemptionSummary(
  currentPoints: number,
  pointsRequired: number,
): RewardRedemptionSummary {
  const safeCurrentPoints = Math.max(0, currentPoints);
  const safePointsRequired = Math.max(0, pointsRequired);
  const canRedeem = safeCurrentPoints >= safePointsRequired;

  return {
    currentPoints: safeCurrentPoints,
    pointsRequired: safePointsRequired,
    pointsAfterRedemption: canRedeem
      ? safeCurrentPoints - safePointsRequired
      : safeCurrentPoints,
    canRedeem,
  };
}
