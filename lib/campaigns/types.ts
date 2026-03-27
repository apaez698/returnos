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
  scheduled_at: string | null;
  sent_at: string | null;
  total_messages: number;
  messages_sent: number;
  messages_failed: number;
  created_at: string;
}

export interface CampaignMessageRecord {
  id: string;
  campaign_id: string;
  customer_id: string;
  delivery_status: "pending" | "simulated" | "sent" | "failed";
  sent_at: string | null;
  created_at: string;
}

export interface CampaignStatsRecord {
  id: string;
  campaign_id: string;
  total_messages: number;
  messages_sent: number;
  messages_failed: number;
  messages_pending: number;
  last_message_processed_at: string | null;
  created_at: string;
  updated_at: string;
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
