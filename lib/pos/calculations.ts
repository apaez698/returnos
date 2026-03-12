import { PosCustomer, PosRewardThreshold } from "./types";

export interface PosPurchaseSummary {
  amount: number;
  pointsEarned: number;
  updatedPoints: number;
}

export function calculatePointsFromAmount(amount: number): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  return Math.floor(amount);
}

export function getPurchaseSummary(
  currentPoints: number,
  amount: number,
): PosPurchaseSummary {
  const pointsEarned = calculatePointsFromAmount(amount);

  return {
    amount,
    pointsEarned,
    updatedPoints: currentPoints + pointsEarned,
  };
}

export function calculateUpdatedPoints(
  currentPoints: number,
  amount: number,
): number {
  return getPurchaseSummary(currentPoints, amount).updatedPoints;
}

export function findNewlyUnlockedReward(
  previousPoints: number,
  updatedPoints: number,
  rewards: PosRewardThreshold[],
): PosRewardThreshold | null {
  const activeRewards = rewards
    .filter((reward) => reward.is_active)
    .sort((a, b) => a.points_required - b.points_required);

  const newlyUnlocked = activeRewards.filter(
    (reward) =>
      reward.points_required > previousPoints &&
      reward.points_required <= updatedPoints,
  );

  return newlyUnlocked.length > 0
    ? newlyUnlocked[newlyUnlocked.length - 1]
    : null;
}

export function searchCustomersByNameOrPhone(
  customers: PosCustomer[],
  rawQuery: string,
): PosCustomer[] {
  const query = rawQuery.trim().toLowerCase();

  if (query.length === 0) {
    return customers;
  }

  return customers.filter((customer) => {
    const normalizedName = customer.name.toLowerCase();
    const normalizedPhone = customer.phone.toLowerCase();
    return normalizedName.includes(query) || normalizedPhone.includes(query);
  });
}
