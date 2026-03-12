import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { getCustomersWithPointsForCurrentBusiness } from "@/lib/customers/data";
import {
  getInactiveCustomers,
  type InactiveCustomer,
} from "@/lib/customers/inactivity";
import { createServerClient } from "@/lib/supabase/server";
import { getRecentVisitsForCurrentBusiness } from "@/lib/visits/data";

// ============================================================
// Types
// ============================================================

export interface DashboardMetrics {
  totalCustomers: number;
  totalVisits: number;
  rewardsRedeemed: number;
  campaignReach: number;
}

export interface DashboardActivityItem {
  id: string;
  type: "visit" | "redemption";
  customerName: string;
  description: string;
  createdAt: string;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  inactiveSummary: InactiveCustomer[];
  recentActivity: DashboardActivityItem[];
}

// ============================================================
// Helpers
// ============================================================

/**
 * Extracts name from Supabase relation response.
 * Handles null, single objects, and arrays of objects.
 */
function extractRelationName(
  relation: { name: string } | { name: string }[] | null,
): string {
  if (!relation) return "Cliente";
  if (Array.isArray(relation)) return relation[0]?.name ?? "Cliente";
  return relation.name;
}

// ============================================================
// Metric Queries
// ============================================================

/**
 * Fetch total customer count for a business.
 */
export async function getTotalCustomersForBusiness(
  businessId: string,
): Promise<number> {
  const supabase = createServerClient();

  const { count, error } = await supabase
    .from("customers")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (error) return 0;
  return count ?? 0;
}

/**
 * Fetch total visit count for a business (last 30 days).
 */
export async function getTotalVisitsForBusiness(
  businessId: string,
  days: number = 30,
): Promise<number> {
  const supabase = createServerClient();
  const daysAgoIso = new Date(
    Date.now() - days * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { count, error } = await supabase
    .from("visits")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId)
    .gte("created_at", daysAgoIso);

  if (error) return 0;
  return count ?? 0;
}

/**
 * Fetch total reward redemption count for a business.
 */
export async function getTotalRewardsRedeemedForBusiness(
  businessId: string,
): Promise<number> {
  const supabase = createServerClient();

  const { count, error } = await supabase
    .from("reward_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);

  if (error) return 0;
  return count ?? 0;
}

/**
 * Fetch campaign reach (total campaign deliveries) for a business.
 */
export async function getCampaignReachForBusiness(
  businessId: string,
): Promise<number> {
  const supabase = createServerClient();

  // Get all campaign IDs for this business
  const { data: campaigns, error: campaignsError } = await supabase
    .from("campaigns")
    .select("id")
    .eq("business_id", businessId);

  if (campaignsError || !campaigns || campaigns.length === 0) return 0;

  const campaignIds = campaigns.map((campaign) => campaign.id);

  // Count deliveries across all campaigns
  const { count, error: deliveriesError } = await supabase
    .from("campaign_deliveries")
    .select("id", { count: "exact", head: true })
    .in("campaign_id", campaignIds);

  if (deliveriesError) return 0;
  return count ?? 0;
}

/**
 * Fetch all metrics for a business in a single operation.
 */
export async function getDashboardMetricsForBusiness(
  businessId: string,
): Promise<DashboardMetrics> {
  const [totalCustomers, totalVisits, rewardsRedeemed, campaignReach] =
    await Promise.all([
      getTotalCustomersForBusiness(businessId),
      getTotalVisitsForBusiness(businessId),
      getTotalRewardsRedeemedForBusiness(businessId),
      getCampaignReachForBusiness(businessId),
    ]);

  return {
    totalCustomers,
    totalVisits,
    rewardsRedeemed,
    campaignReach,
  };
}

// ============================================================
// Inactive Customers
// ============================================================

/**
 * Fetch top N inactive customers for the current business.
 */
export async function getTopInactiveCustomersForCurrentBusiness(
  limit: number = 5,
): Promise<InactiveCustomer[]> {
  try {
    const customers = await getCustomersWithPointsForCurrentBusiness();
    const inactiveCustomers = getInactiveCustomers(customers);
    return inactiveCustomers.slice(0, limit);
  } catch {
    return [];
  }
}

// ============================================================
// Recent Activity
// ============================================================

type RedemptionRow = {
  id: string;
  points_spent: number;
  redeemed_at: string;
  customers: { name: string } | { name: string }[] | null;
  reward_rules: { name: string } | { name: string }[] | null;
};

/**
 * Convert visits to dashboard activity items.
 */
function formatVisitActivity(
  visits: Awaited<ReturnType<typeof getRecentVisitsForCurrentBusiness>>,
): DashboardActivityItem[] {
  return visits.map((visit) => ({
    id: visit.id,
    type: "visit" as const,
    customerName: visit.customer_name,
    description: `${visit.customer_name} visit (+${visit.points_earned} pts)`,
    createdAt: visit.created_at,
  }));
}

/**
 * Fetch and format recent reward redemptions.
 */
async function getRecentRedemptionsForCurrentBusiness(
  limit: number = 10,
): Promise<DashboardActivityItem[]> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("reward_redemptions")
    .select(
      "id, points_spent, redeemed_at, customers(name), reward_rules(name)",
    )
    .eq("business_id", businessId)
    .order("redeemed_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  const rows = (data ?? []) as RedemptionRow[];
  return rows.map((row) => ({
    id: row.id,
    type: "redemption" as const,
    customerName: extractRelationName(row.customers),
    description: `${extractRelationName(row.customers)} redeemed ${extractRelationName(row.reward_rules)} (${row.points_spent} pts)`,
    createdAt: row.redeemed_at,
  }));
}

/**
 * Fetch combined recent activity (visits + redemptions) for the current business.
 */
export async function getRecentActivityForCurrentBusiness(
  visitsLimit: number = 10,
  redemptionsLimit: number = 10,
  activityLimit: number = 10,
): Promise<DashboardActivityItem[]> {
  try {
    const [recentVisits, recentRedemptions] = await Promise.all([
      getRecentVisitsForCurrentBusiness(visitsLimit).catch(() => []),
      getRecentRedemptionsForCurrentBusiness(redemptionsLimit).catch(() => []),
    ]);

    const visitActivity = formatVisitActivity(recentVisits);
    const combinedActivity = [...visitActivity, ...recentRedemptions];

    return combinedActivity
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, activityLimit);
  } catch {
    return [];
  }
}

// ============================================================
// Composite Query
// ============================================================

/**
 * Fetch complete dashboard data for the current business.
 * Combines metrics, inactive customers, and recent activity.
 */
export async function getDashboardDataForCurrentBusiness(): Promise<DashboardData> {
  const businessId = await getCurrentBusinessId();

  const [metrics, inactiveSummary, recentActivity] = await Promise.all([
    getDashboardMetricsForBusiness(businessId),
    getTopInactiveCustomersForCurrentBusiness(5),
    getRecentActivityForCurrentBusiness(10, 10, 10),
  ]);

  return {
    metrics,
    inactiveSummary,
    recentActivity,
  };
}
