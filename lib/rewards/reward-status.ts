export const REWARD_CUSTOMER_STATUS_FILTERS = [
  "all",
  "eligible",
  "redeemed",
  "near_unlock",
  "active",
] as const;

export type RewardCustomerStatusFilter =
  (typeof REWARD_CUSTOMER_STATUS_FILTERS)[number];

export type RewardCustomerState =
  | "eligible"
  | "redeemed"
  | "near_unlock"
  | "active"
  | "inactive";

export const DEFAULT_NEAR_UNLOCK_THRESHOLD_PERCENT = 80;

export interface ResolveRewardCustomerStateInput {
  has_redeemed: boolean;
  is_eligible: boolean;
  is_near_unlock: boolean;
  is_active: boolean;
}

/**
 * Resolve a customer's reward state with deterministic precedence.
 */
export function resolveRewardCustomerState(
  input: ResolveRewardCustomerStateInput,
): RewardCustomerState {
  if (input.has_redeemed) {
    return "redeemed";
  }

  if (input.is_eligible) {
    return "eligible";
  }

  if (input.is_near_unlock) {
    return "near_unlock";
  }

  if (input.is_active) {
    return "active";
  }

  return "inactive";
}

/**
 * "active" filter is intentionally broad: any non-inactive reward state.
 */
export function matchesRewardStatusFilter(
  rewardState: RewardCustomerState,
  filter: RewardCustomerStatusFilter,
): boolean {
  if (filter === "all") {
    return true;
  }

  if (filter === "active") {
    return rewardState !== "inactive";
  }

  return rewardState === filter;
}

/**
 * Returns true when points are close to the next unlock threshold.
 */
export function isNearUnlockByThreshold(
  currentPoints: number,
  nextRewardPointsRequired: number | null,
  nearUnlockThresholdPercent = DEFAULT_NEAR_UNLOCK_THRESHOLD_PERCENT,
): boolean {
  if (nextRewardPointsRequired === null || nextRewardPointsRequired <= 0) {
    return false;
  }

  if (currentPoints >= nextRewardPointsRequired) {
    return false;
  }

  const progressPercent = (currentPoints / nextRewardPointsRequired) * 100;
  return progressPercent >= nearUnlockThresholdPercent;
}
