export interface RewardRule {
  id: string;
  business_id: string;
  name: string;
  points_required: number;
  reward_description: string;
  is_active: boolean;
  created_at: string;
}

export type RewardField =
  | "name"
  | "points_required"
  | "reward_description"
  | "is_active";

export interface RewardActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: Partial<Record<RewardField, string>>;
}

export const initialRewardActionState: RewardActionState = {
  status: "idle",
};

export type RewardProgressStatus = "redeemable" | "in_progress" | "no_reward";

export interface CustomerPoints {
  customer_id: string;
  points: number;
}

export enum RewardStatus {
  no_reward = "no_reward",
  in_progress = "in_progress",
  redeemable = "redeemable",
}

export interface RewardProgress {
  reward: RewardRule;
  status: RewardStatus;
  progress_percentage: number;
  remaining_points: number;
}

export interface CustomerRewardProgress {
  customer_id: string;
  customer_name: string;
  current_points: number;
  nearest_reward: RewardRule | null;
  progress_percentage: number;
  remaining_points: number;
  status: RewardProgressStatus;
}
