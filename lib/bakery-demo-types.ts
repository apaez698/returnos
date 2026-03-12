/**
 * Type definitions for the Bakery & Cafeteria demo dataset.
 * These types mirror the core Supabase tables with demo-friendly structure.
 */

export interface DemoBusiness {
  id: string;
  name: string;
  slug: string;
  business_type: "restaurant" | "bakery";
  created_at: string;
}

export interface DemoCustomer {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email: string | null;
  birthday: string | null;
  consent_marketing: boolean;
  points: number;
  last_visit_at: string | null;
  created_at: string;
}

export interface DemoVisit {
  id: string;
  business_id: string;
  customer_id: string;
  points_earned: number;
  amount: number | null;
  product_category: string | null;
  source: "in_store" | "qr" | "manual";
  created_at: string;
}

export interface DemoRewardRule {
  id: string;
  business_id: string;
  name: string;
  points_required: number;
  reward_description: string;
  is_active: boolean;
  created_at: string;
}

export interface DemoCampaign {
  id: string;
  business_id: string;
  name: string;
  campaign_type: "manual" | "reactivation" | "birthday" | "promotion";
  audience_type: "all_customers" | "inactive_customers" | "birthday_customers";
  message: string;
  target_inactive_days: number | null;
  status: "draft" | "scheduled" | "sent";
  created_at: string;
}

export interface DemoCampaignDelivery {
  id: string;
  campaign_id: string;
  customer_id: string;
  delivery_status: "pending" | "simulated" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
}

/**
 * Summary metrics computed from demo data
 */
export interface DemoMetricsSummary {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  newCustomers: number;
  frequentCustomers: number;
  totalVisits: number;
  totalSales: number;
  totalPointsIssued: number;
  potentialRewardUnlocks: number;
  customersWithRedeemableRewards: number;
  averagePurchaseValue: number;
  averagePointsPerCustomer: number;
}

/**
 * Helper type for categorizing customers by loyalty segment
 */
export type CustomerSegment =
  | "inactive"
  | "new"
  | "regular"
  | "frequent"
  | "vip";

export interface CustomerSegmentationResult {
  segment: CustomerSegment;
  customerId: string;
  customerName: string;
  points: number;
  visitCount: number;
  lastVisitDaysAgo: number | null;
  totalSpent: number;
}
