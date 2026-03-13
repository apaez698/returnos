import type { SearchRewardCustomersOptions } from "@/lib/rewards/reward-customer-types";
import {
  DEFAULT_NEAR_UNLOCK_THRESHOLD_PERCENT,
  REWARD_CUSTOMER_STATUS_FILTERS,
  type RewardCustomerState,
  type RewardCustomerStatusFilter,
} from "@/lib/rewards/reward-status";

export interface RewardSearchFilters {
  query: string;
  query_like_pattern: string | null;
  status: RewardCustomerStatusFilter;
  limit: number;
  near_unlock_threshold_percent: number;
}

const STATUS_LABELS: Record<RewardCustomerState, string> = {
  redeemed: "Canjeado",
  eligible: "Canjeable",
  near_unlock: "Cerca de premio",
  active: "Activo",
  inactive: "Sin actividad",
};

function clampInteger(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) {
    return min;
  }

  return Math.min(max, Math.max(min, Math.floor(value)));
}

export function escapeLikePattern(input: string): string {
  return input.replace(/[%_\\]/g, "\\$&");
}

export function getRewardStatusLabel(status: RewardCustomerState): string {
  return STATUS_LABELS[status];
}

export function buildRewardSearchFilters(
  options: SearchRewardCustomersOptions = {},
): RewardSearchFilters {
  const query = options.query?.trim() ?? "";
  const status = REWARD_CUSTOMER_STATUS_FILTERS.includes(
    options.status as RewardCustomerStatusFilter,
  )
    ? (options.status as RewardCustomerStatusFilter)
    : "all";

  const limit =
    options.limit === undefined ? 100 : clampInteger(options.limit, 0, 250);

  const nearUnlockThresholdPercent = clampInteger(
    options.near_unlock_threshold_percent ??
      DEFAULT_NEAR_UNLOCK_THRESHOLD_PERCENT,
    1,
    99,
  );

  return {
    query,
    query_like_pattern:
      query.length > 0 ? `%${escapeLikePattern(query)}%` : null,
    status,
    limit,
    near_unlock_threshold_percent: nearUnlockThresholdPercent,
  };
}
