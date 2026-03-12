/**
 * Seed Service for Bakery Demo Dataset
 *
 * Manages idempotent insertion of bakery demo data into Supabase
 * in the correct dependency order.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  DemoBusiness,
  DemoCustomer,
  DemoVisit,
  DemoRewardRule,
  DemoCampaign,
  DemoCampaignDelivery,
} from "../../lib/bakery-demo-types";
import {
  demoBusiness,
  demoCustomers,
  demoVisits,
  demoRewardRules,
  demoCampaigns,
  demoCampaignDeliveries,
} from "../../lib/bakery-demo";

/**
 * Seed operation summary
 */
export interface SeedSummary {
  success: boolean;
  timestamp: string;
  operations: {
    businesses: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
    business_users?: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
    customers: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
    reward_rules: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
    visits: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
    campaigns: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
    campaign_deliveries: {
      inserted: number;
      skipped: number;
      errors: string[];
    };
  };
  totalRecords: number;
  errors: string[];
}

/**
 * Initialize a new seed summary
 */
function initSummary(): SeedSummary {
  return {
    success: true,
    timestamp: new Date().toISOString(),
    operations: {
      businesses: { inserted: 0, skipped: 0, errors: [] },
      customers: { inserted: 0, skipped: 0, errors: [] },
      reward_rules: { inserted: 0, skipped: 0, errors: [] },
      visits: { inserted: 0, skipped: 0, errors: [] },
      campaigns: { inserted: 0, skipped: 0, errors: [] },
      campaign_deliveries: { inserted: 0, skipped: 0, errors: [] },
    },
    totalRecords: 0,
    errors: [],
  };
}

/**
 * Seed businesses table
 *
 * Idempotent: Checks by slug to avoid duplicates
 */
async function seedBusinesses(
  supabase: SupabaseClient,
  summary: SeedSummary,
): Promise<string> {
  try {
    // Check if business already exists by slug
    const { data: existing, error: checkError } = await supabase
      .from("businesses")
      .select("id")
      .eq("slug", demoBusiness.slug)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(
        `Failed to check existing business: ${checkError.message}`,
      );
    }

    if (existing) {
      summary.operations.businesses.skipped++;
      return existing.id;
    }

    const { data, error } = await supabase
      .from("businesses")
      .insert([demoBusiness])
      .select("id")
      .single();

    if (error) throw new Error(`Failed to insert business: ${error.message}`);
    if (!data?.id) throw new Error("No business ID returned");

    summary.operations.businesses.inserted++;
    return data.id;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.operations.businesses.errors.push(errorMsg);
    summary.errors.push(`[businesses] ${errorMsg}`);
    summary.success = false;
    throw error;
  }
}

/**
 * Seed customers table
 *
 * Idempotent: Checks by (business_id, phone) unique constraint
 */
async function seedCustomers(
  supabase: SupabaseClient,
  businessId: string,
  summary: SeedSummary,
): Promise<void> {
  try {
    for (const customer of demoCustomers) {
      try {
        // Check if customer already exists by business_id and phone
        const { data: existing, error: checkError } = await supabase
          .from("customers")
          .select("id")
          .eq("business_id", businessId)
          .eq("phone", customer.phone)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw new Error(
            `Failed to check existing customer: ${checkError.message}`,
          );
        }

        if (existing) {
          summary.operations.customers.skipped++;
          continue;
        }

        const customerData: DemoCustomer = {
          ...customer,
          business_id: businessId,
        };

        const { error } = await supabase
          .from("customers")
          .insert([customerData]);

        if (error)
          throw new Error(`Failed to insert customer: ${error.message}`);

        summary.operations.customers.inserted++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        summary.operations.customers.errors.push(
          `Customer ${customer.name}: ${errorMsg}`,
        );
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.errors.push(`[customers] ${errorMsg}`);
    summary.success = false;
    throw error;
  }
}

/**
 * Seed reward_rules table
 *
 * Idempotent: Checks by (business_id, name) to avoid duplicates
 */
async function seedRewardRules(
  supabase: SupabaseClient,
  businessId: string,
  summary: SeedSummary,
): Promise<void> {
  try {
    for (const rule of demoRewardRules) {
      try {
        // Check if reward rule already exists by business_id and name
        const { data: existing, error: checkError } = await supabase
          .from("reward_rules")
          .select("id")
          .eq("business_id", businessId)
          .eq("name", rule.name)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw new Error(
            `Failed to check existing reward rule: ${checkError.message}`,
          );
        }

        if (existing) {
          summary.operations.reward_rules.skipped++;
          continue;
        }

        const ruleData: DemoRewardRule = {
          ...rule,
          business_id: businessId,
        };

        const { error } = await supabase
          .from("reward_rules")
          .insert([ruleData]);

        if (error)
          throw new Error(`Failed to insert reward rule: ${error.message}`);

        summary.operations.reward_rules.inserted++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        summary.operations.reward_rules.errors.push(
          `Rule ${rule.name}: ${errorMsg}`,
        );
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.errors.push(`[reward_rules] ${errorMsg}`);
    summary.success = false;
    throw error;
  }
}

/**
 * Seed visits table
 *
 * Idempotent: Does nothing if visits already exist for this business
 * (visits are timestamped transactions, duplicating them would be problematic)
 */
async function seedVisits(
  supabase: SupabaseClient,
  businessId: string,
  summary: SeedSummary,
): Promise<void> {
  try {
    // Check if visits already exist for this business
    const { data: existing, error: checkError } = await supabase
      .from("visits")
      .select("id", { count: "exact", head: true })
      .eq("business_id", businessId);

    if (checkError && checkError.code !== "PGRST116") {
      throw new Error(`Failed to check existing visits: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      summary.operations.visits.skipped += demoVisits.length;
      return;
    }

    for (const visit of demoVisits) {
      try {
        const visitData: DemoVisit = {
          ...visit,
          business_id: businessId,
        };

        const { error } = await supabase.from("visits").insert([visitData]);

        if (error) throw new Error(`Failed to insert visit: ${error.message}`);

        summary.operations.visits.inserted++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        summary.operations.visits.errors.push(`Visit: ${errorMsg}`);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.errors.push(`[visits] ${errorMsg}`);
    summary.success = false;
    throw error;
  }
}

/**
 * Seed campaigns table
 *
 * Idempotent: Checks by (business_id, name) to avoid duplicates
 */
async function seedCampaigns(
  supabase: SupabaseClient,
  businessId: string,
  summary: SeedSummary,
): Promise<Map<string, string>> {
  const campaignIdMap = new Map<string, string>();

  try {
    for (const campaign of demoCampaigns) {
      try {
        // Check if campaign already exists by business_id and name
        const { data: existing, error: checkError } = await supabase
          .from("campaigns")
          .select("id")
          .eq("business_id", businessId)
          .eq("name", campaign.name)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw new Error(
            `Failed to check existing campaign: ${checkError.message}`,
          );
        }

        if (existing) {
          summary.operations.campaigns.skipped++;
          campaignIdMap.set(campaign.id, existing.id);
          continue;
        }

        const campaignData: DemoCampaign = {
          ...campaign,
          business_id: businessId,
        };

        const { data, error } = await supabase
          .from("campaigns")
          .insert([campaignData])
          .select("id")
          .single();

        if (error)
          throw new Error(`Failed to insert campaign: ${error.message}`);
        if (!data?.id) throw new Error("No campaign ID returned");

        campaignIdMap.set(campaign.id, data.id);
        summary.operations.campaigns.inserted++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        summary.operations.campaigns.errors.push(
          `Campaign ${campaign.name}: ${errorMsg}`,
        );
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.errors.push(`[campaigns] ${errorMsg}`);
    summary.success = false;
    throw error;
  }

  return campaignIdMap;
}

/**
 * Seed campaign_deliveries table
 *
 * Idempotent: Checks by (campaign_id, customer_id) unique constraint
 *
 * Requires: campaign ID mapping from seedCampaigns and customer lookup
 */
async function seedCampaignDeliveries(
  supabase: SupabaseClient,
  businessId: string,
  campaignIdMap: Map<string, string>,
  summary: SeedSummary,
): Promise<void> {
  try {
    // Fetch customer IDs for this business
    const { data: customers, error: customerError } = await supabase
      .from("customers")
      .select("id, phone");

    if (customerError) {
      throw new Error(`Failed to fetch customers: ${customerError.message}`);
    }

    const phoneToId = new Map(customers?.map((c) => [c.phone, c.id]) ?? []);

    for (const delivery of demoCampaignDeliveries) {
      try {
        const newCampaignId = campaignIdMap.get(delivery.campaign_id);
        if (!newCampaignId) {
          summary.operations.campaign_deliveries.errors.push(
            `Campaign ID mapping not found for delivery`,
          );
          continue;
        }

        // Find customer ID by matching demo customer IDs to phone
        const demoCustomer = demoCustomers.find(
          (c) => c.id === delivery.customer_id,
        );
        if (!demoCustomer) {
          summary.operations.campaign_deliveries.errors.push(
            `Demo customer not found for delivery`,
          );
          continue;
        }

        const customerId = phoneToId.get(demoCustomer.phone);
        if (!customerId) {
          summary.operations.campaign_deliveries.errors.push(
            `Customer phone not found in database for ${demoCustomer.phone}`,
          );
          continue;
        }

        // Check if delivery already exists
        const { data: existing, error: checkError } = await supabase
          .from("campaign_deliveries")
          .select("id")
          .eq("campaign_id", newCampaignId)
          .eq("customer_id", customerId)
          .single();

        if (checkError && checkError.code !== "PGRST116") {
          throw new Error(
            `Failed to check existing delivery: ${checkError.message}`,
          );
        }

        if (existing) {
          summary.operations.campaign_deliveries.skipped++;
          continue;
        }

        const deliveryData = {
          campaign_id: newCampaignId,
          customer_id: customerId,
          delivery_status: delivery.delivery_status,
          sent_at: delivery.sent_at,
          created_at: delivery.created_at,
        };

        const { error } = await supabase
          .from("campaign_deliveries")
          .insert([deliveryData]);

        if (error)
          throw new Error(`Failed to insert delivery: ${error.message}`);

        summary.operations.campaign_deliveries.inserted++;
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        summary.operations.campaign_deliveries.errors.push(
          `Delivery: ${errorMsg}`,
        );
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.errors.push(`[campaign_deliveries] ${errorMsg}`);
    summary.success = false;
    throw error;
  }
}

/**
 * Main seed function
 *
 * Orchestrates the seeding process in the correct dependency order
 */
export async function seedBakeryDemo(
  supabase: SupabaseClient,
): Promise<SeedSummary> {
  const summary = initSummary();

  try {
    console.log("[Seed] Starting bakery demo dataset seeding...");

    // Step 1: Seed businesses (must come first)
    const businessId = await seedBusinesses(supabase, summary);
    console.log(
      `[Seed] Businesses: ${summary.operations.businesses.inserted} inserted, ${summary.operations.businesses.skipped} skipped`,
    );

    // Step 2: Seed customers (depends on business)
    await seedCustomers(supabase, businessId, summary);
    console.log(
      `[Seed] Customers: ${summary.operations.customers.inserted} inserted, ${summary.operations.customers.skipped} skipped`,
    );

    // Step 3: Seed reward rules (depends on business)
    await seedRewardRules(supabase, businessId, summary);
    console.log(
      `[Seed] Reward Rules: ${summary.operations.reward_rules.inserted} inserted, ${summary.operations.reward_rules.skipped} skipped`,
    );

    // Step 4: Seed visits (depends on customers and business)
    await seedVisits(supabase, businessId, summary);
    console.log(
      `[Seed] Visits: ${summary.operations.visits.inserted} inserted, ${summary.operations.visits.skipped} skipped`,
    );

    // Step 5: Seed campaigns (depends on business)
    const campaignIdMap = await seedCampaigns(supabase, businessId, summary);
    console.log(
      `[Seed] Campaigns: ${summary.operations.campaigns.inserted} inserted, ${summary.operations.campaigns.skipped} skipped`,
    );

    // Step 6: Seed campaign deliveries (depends on campaigns and customers)
    await seedCampaignDeliveries(supabase, businessId, campaignIdMap, summary);
    console.log(
      `[Seed] Campaign Deliveries: ${summary.operations.campaign_deliveries.inserted} inserted, ${summary.operations.campaign_deliveries.skipped} skipped`,
    );

    // Calculate totals
    summary.totalRecords =
      summary.operations.businesses.inserted +
      summary.operations.customers.inserted +
      summary.operations.reward_rules.inserted +
      summary.operations.visits.inserted +
      summary.operations.campaigns.inserted +
      summary.operations.campaign_deliveries.inserted;

    if (summary.success) {
      console.log(
        `[Seed] ✓ Seeding completed successfully. ${summary.totalRecords} new records inserted.`,
      );
    } else {
      console.warn(
        `[Seed] ⚠ Seeding completed with errors. ${summary.totalRecords} records inserted. Check summary for details.`,
      );
    }

    return summary;
  } catch (error) {
    summary.success = false;
    const errorMsg = error instanceof Error ? error.message : String(error);
    summary.errors.push(`Fatal error during seeding: ${errorMsg}`);
    console.error(`[Seed] ✗ Fatal seeding error: ${errorMsg}`);
    return summary;
  }
}
