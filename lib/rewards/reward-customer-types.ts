import type {
  RewardCustomerState,
  RewardCustomerStatusFilter,
} from "./reward-status";

export interface SearchRewardCustomersOptions {
  query?: string;
  status?: RewardCustomerStatusFilter;
  limit?: number;
  near_unlock_threshold_percent?: number;
}

export interface RewardCustomerSearchItem {
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  current_points: number;
  redemptions_count: number;
  redeemable_reward_id: string | null;
  redeemable_reward_name: string | null;
  redeemable_reward_description: string | null;
  redeemable_reward_points_required: number | null;
  next_reward_id: string | null;
  next_reward_name: string | null;
  next_reward_description: string | null;
  next_reward_points_required: number | null;
  progress_percentage_to_next: number;
  remaining_points_to_next: number;
  has_redeemed: boolean;
  is_eligible: boolean;
  is_near_unlock: boolean;
  reward_status: RewardCustomerState;
}

export interface SearchRewardCustomersResult {
  items: RewardCustomerSearchItem[];
  total_count: number;
}
