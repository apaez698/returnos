// Quick verification that the bakery demo module exports correctly
import {
  demoBusiness,
  demoCustomers,
  demoVisits,
  demoRewardRules,
  demoCampaigns,
  demoCampaignDeliveries,
  computeDemoMetrics,
  segmentCustomers,
  getReactivationCandidates,
  getCustomersAtRewardTier,
  getRewardMetrics,
} from "@/lib/bakery-demo";

export function verifyBakeryDemo() {
  // Compute metrics to verify data integrity
  const metrics = computeDemoMetrics();
  const segments = segmentCustomers();
  const reactivationCandidates = getReactivationCandidates(60);
  const rewardMetrics = getRewardMetrics();

  return {
    businessName: demoBusiness.name,
    totalCustomers: demoCustomers.length,
    totalVisits: demoVisits.length,
    totalRewardRules: demoRewardRules.length,
    campaigns: demoCampaigns.length,
    campaignDeliveries: demoCampaignDeliveries.length,
    metrics,
    segments,
    reactivationCandidates: reactivationCandidates.length,
    rewardMetrics,
  };
}
