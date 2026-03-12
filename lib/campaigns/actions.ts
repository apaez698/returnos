"use server";

import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import type { CampaignSuggestion } from "@/lib/campaigns/types";
import { createServerClient } from "@/lib/supabase/server";

export interface CreateCampaignResult {
  success: boolean;
  error: string | null;
  message: string | null;
}

/**
 * Creates a campaign from a campaign suggestion.
 * Inserts the campaign into the campaigns table with draft status.
 */
export async function createCampaignFromSuggestion(
  suggestion: CampaignSuggestion,
): Promise<CreateCampaignResult> {
  try {
    const businessId = await getCurrentBusinessId();
    const supabase = createServerClient();

    const { error } = await supabase.from("campaigns").insert({
      business_id: businessId,
      name: suggestion.title,
      message: suggestion.message,
      campaign_type: suggestion.campaignType,
      audience_type: suggestion.audienceType,
      target_inactive_days: suggestion.targetInactiveDays,
      status: "draft",
    });

    if (error) {
      return {
        success: false,
        error: error.message,
        message: null,
      };
    }

    return {
      success: true,
      error: null,
      message: "Campaña creada exitosamente.",
    };
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : "Error desconocido";

    return {
      success: false,
      error: errorMessage,
      message: null,
    };
  }
}
