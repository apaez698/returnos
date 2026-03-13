import { calculatePointsEarned } from "@/features/loyalty/calculations/calculate-points-earned";

export interface BuildPurchaseSummaryInput {
  purchaseAmount: number;
  currentPoints: number;
  rewardTargetPoints: number;
  rewardName?: string;
}

export interface PurchaseSummary {
  purchaseAmount: number;
  pointsEarned: number;
  totalAccumulatedPoints: number;
  rewardTargetPoints: number;
  progressToRewardPercent: number;
  pointsRemainingToReward: number;
  rewardUnlocked: boolean;
  customerMessage: string;
}

function sanitizeNonNegativeNumber(value: number): number {
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  return value;
}

export function calculatePointsEarnedFromPurchaseAmount(
  purchaseAmount: number,
): number {
  return calculatePointsEarned(sanitizeNonNegativeNumber(purchaseAmount));
}

export function calculateTotalAccumulatedPoints(
  currentPoints: number,
  pointsEarned: number,
): number {
  return (
    Math.floor(sanitizeNonNegativeNumber(currentPoints)) +
    Math.floor(sanitizeNonNegativeNumber(pointsEarned))
  );
}

export function calculateProgressTowardRewardTarget(
  totalAccumulatedPoints: number,
  rewardTargetPoints: number,
): number {
  const safeTarget = Math.floor(sanitizeNonNegativeNumber(rewardTargetPoints));

  if (safeTarget === 0) {
    return 100;
  }

  const progress =
    (Math.floor(sanitizeNonNegativeNumber(totalAccumulatedPoints)) /
      safeTarget) *
    100;

  return Math.min(100, Math.max(0, Math.floor(progress)));
}

export function isRewardUnlocked(
  totalAccumulatedPoints: number,
  rewardTargetPoints: number,
): boolean {
  const safeTarget = Math.floor(sanitizeNonNegativeNumber(rewardTargetPoints));

  if (safeTarget === 0) {
    return true;
  }

  return (
    Math.floor(sanitizeNonNegativeNumber(totalAccumulatedPoints)) >= safeTarget
  );
}

export function buildCustomerRewardMessage(
  totalAccumulatedPoints: number,
  rewardTargetPoints: number,
  rewardName = "reward",
): string {
  if (isRewardUnlocked(totalAccumulatedPoints, rewardTargetPoints)) {
    return "Reward unlocked";
  }

  const safeTarget = Math.floor(sanitizeNonNegativeNumber(rewardTargetPoints));
  const safePoints = Math.floor(
    sanitizeNonNegativeNumber(totalAccumulatedPoints),
  );
  const pointsRemaining = Math.max(0, safeTarget - safePoints);

  return `You need ${pointsRemaining} more points for your ${rewardName}`;
}

export function buildPurchaseSummary(
  input: BuildPurchaseSummaryInput,
): PurchaseSummary {
  const pointsEarned = calculatePointsEarnedFromPurchaseAmount(
    input.purchaseAmount,
  );
  const totalAccumulatedPoints = calculateTotalAccumulatedPoints(
    input.currentPoints,
    pointsEarned,
  );
  const progressToRewardPercent = calculateProgressTowardRewardTarget(
    totalAccumulatedPoints,
    input.rewardTargetPoints,
  );
  const rewardUnlocked = isRewardUnlocked(
    totalAccumulatedPoints,
    input.rewardTargetPoints,
  );

  return {
    purchaseAmount: input.purchaseAmount,
    pointsEarned,
    totalAccumulatedPoints,
    rewardTargetPoints: Math.floor(
      sanitizeNonNegativeNumber(input.rewardTargetPoints),
    ),
    progressToRewardPercent,
    pointsRemainingToReward: Math.max(
      0,
      Math.floor(sanitizeNonNegativeNumber(input.rewardTargetPoints)) -
        totalAccumulatedPoints,
    ),
    rewardUnlocked,
    customerMessage: buildCustomerRewardMessage(
      totalAccumulatedPoints,
      input.rewardTargetPoints,
      input.rewardName,
    ),
  };
}
