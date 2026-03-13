import type { RewardProgressStatus, RewardRule } from "@/lib/rewards/types";

export type Relation<T> = T | T[] | null | undefined;

export interface LoyaltyCardTokenPayload {
  v: 1;
  business_id: string;
  customer_id: string;
  exp: number;
  iat?: number;
}

export interface RawLoyaltyBusinessRow {
  id: string;
  name: string;
  slug: string;
  business_type: string;
}

export interface RawLoyaltyCustomerRow {
  id: string;
  business_id: string;
  name: string | null;
  phone: string | null;
  points: number | null;
  businesses: Relation<RawLoyaltyBusinessRow>;
}

export type RawLoyaltyRewardRuleRow = RewardRule;

export interface LoyaltyCardRewardSnapshot {
  id: string;
  name: string;
  points_required: number;
  reward_description: string;
}

export interface LoyaltyCardBusinessBranding {
  id: string;
  name: string;
  slug: string;
  business_type: string;
}

export interface LoyaltyCardCustomerProfile {
  id: string;
  name: string;
  phone: string | null;
}

export interface LoyaltyCardProgress {
  status: RewardProgressStatus;
  current_points: number;
  reward_target_points: number | null;
  progress_percentage_to_target: number;
  remaining_points_to_target: number;
  redeemable_reward: LoyaltyCardRewardSnapshot | null;
  next_reward: LoyaltyCardRewardSnapshot | null;
}

export interface LoyaltyCardViewModel {
  customer: LoyaltyCardCustomerProfile;
  business: LoyaltyCardBusinessBranding;
  loyalty: LoyaltyCardProgress;
}

export interface MapLoyaltyCardViewModelInput {
  customer: RawLoyaltyCustomerRow;
  activeRewardRules: RawLoyaltyRewardRuleRow[] | null | undefined;
}
