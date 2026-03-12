export type CampaignType = "reactivation";
export type CampaignAudienceType = "inactive_customers";

export interface CampaignSuggestion {
  title: string;
  message: string;
  campaignType: CampaignType;
  audienceType: CampaignAudienceType;
  targetInactiveDays: number;
}

export interface CampaignRecord {
  id: string;
  business_id: string;
  name: string;
  campaign_type: string;
  audience_type: string;
  message: string;
  target_inactive_days: number | null;
  status: "draft" | "scheduled" | "sent";
  created_at: string;
}

export interface CampaignActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string;
    message?: string;
  };
}

export const initialCampaignActionState: CampaignActionState = {
  status: "idle",
};
