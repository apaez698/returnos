export interface LoyaltyStatusRewardRule {
  points_required: number;
  reward_description?: string | null;
  name?: string | null;
}

function normalizePoints(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, value);
}

function getRewardLabel(rule: LoyaltyStatusRewardRule): string | null {
  const description = rule.reward_description?.trim();
  if (description) {
    return description;
  }

  const name = rule.name?.trim();
  if (name) {
    return name;
  }

  return null;
}

export function buildLoyaltyStatusMessage(
  currentPoints: number,
  rewardRule: LoyaltyStatusRewardRule | null | undefined,
): string {
  if (
    !rewardRule ||
    !Number.isFinite(rewardRule.points_required) ||
    rewardRule.points_required <= 0
  ) {
    return "No rewards are available yet";
  }

  const normalizedCurrentPoints = normalizePoints(currentPoints);
  const remainingPoints = Math.max(
    0,
    Math.ceil(rewardRule.points_required - normalizedCurrentPoints),
  );

  if (remainingPoints === 0) {
    return "Your reward is ready to redeem";
  }

  const pointsLabel = remainingPoints === 1 ? "point" : "points";
  const rewardLabel = getRewardLabel(rewardRule);

  if (!rewardLabel) {
    return `You need ${remainingPoints} more ${pointsLabel} for your next reward`;
  }

  return `You need ${remainingPoints} more ${pointsLabel} for your next ${rewardLabel}`;
}
