/**
 * Types for reward redemptions
 */

export type RedemptionStatus = "pending" | "completed" | "cancelled";

/**
 * Raw redemption record from database
 */
export interface RedemptionRecord {
  id: string;
  business_id: string;
  customer_id: string;
  reward_rule_id: string;
  points_spent: number;
  redeemed_at: string;
  created_at: string;
}

/**
 * View model for redemptions with joined customer and reward information
 */
export interface RedemptionItem {
  id: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string | null;
  reward_id: string;
  reward_name: string;
  reward_description: string;
  points_spent: number;
  redeemed_at: string;
  created_at: string;
}

/**
 * Options for querying redemptions with optional filters
 */
export interface GetReddemptionsOptions {
  customer_search?: string; // Search by customer name or phone
  reward_id?: string; // Filter by specific reward rule
  reward_name?: string; // Search by reward name (ilike)
  start_date?: string; // ISO date string for start of date range
  end_date?: string; // ISO date string for end of date range
  limit?: number; // Limit results (default: 100)
}

/**
 * Query result with redemptions and metadata
 */
export interface ReddemptionsQueryResult {
  items: RedemptionItem[];
  total_count: number;
}
