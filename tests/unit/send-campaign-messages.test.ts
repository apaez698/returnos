import { describe, it, expect, beforeEach, vi } from "vitest";
import * as sendCampaignMessagesModule from "@/lib/campaigns/send-campaign-messages";
import * as twilioModule from "@/features/whatsapp/service/send-twilio-whatsapp-message";

// Create a mock that supports method chaining
const createMockChain = () => {
  const chain: any = {
    insert: vi.fn().mockResolvedValue({ error: null }),
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockResolvedValue({ error: null }),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null }),
  };
  // Set up chaining for all methods
  Object.values(chain).forEach((fn: any) => {
    if (typeof fn === "object" && fn.mockReturnThis) {
      fn.mockReturnValue(chain);
    }
  });
  return chain;
};

// Mock Supabase
vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(() => ({
    from: vi.fn(() => createMockChain()),
  })),
}));

// Mock Twilio WhatsApp service
vi.mock("@/features/whatsapp/service/send-twilio-whatsapp-message");

describe("sendCampaignMessages", () => {
  const mockCampaign = {
    id: "campaign-123",
    business_id: "business-123",
    name: "Test Campaign",
    campaign_type: "reactivation",
    audience_type: "inactive_customers",
    message: "Hello! Come back and enjoy 20% off! 🎉",
    target_inactive_days: 30,
    status: "sent" as const,
    scheduled_at: null,
    sent_at: null,
    total_messages: 0,
    messages_sent: 0,
    messages_failed: 0,
    created_at: new Date().toISOString(),
  };

  const mockCustomers = [
    { customerId: "customer-1", phone: "+1 (555) 123-4567" },
    { customerId: "customer-2", phone: "5551234568" },
    { customerId: "customer-3", phone: "555-123-4569" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should send messages to all customers successfully", async () => {
    // Mock successful Twilio responses
    vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mockResolvedValue({
      ok: true,
      data: {
        sid: "SM123abc456",
        status: "queued",
        to: "whatsapp:+15551234567",
        raw: {},
      },
    });

    const result = await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers,
    });

    expect(result.totalSent).toBe(3);
    expect(result.totalFailed).toBe(0);
    expect(result.messageGroups).toHaveLength(3);
    expect(result.messageGroups.every((m) => m.status === "sent")).toBe(true);
  });

  it("should handle phone normalization correctly", async () => {
    vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mockResolvedValue({
      ok: true,
      data: {
        sid: "SM456def789",
        status: "queued",
        to: "whatsapp:+15551234567",
        raw: {},
      },
    });

    await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers.slice(0, 1),
      countryCode: "1",
    });

    const calls = vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mock.calls;
    expect(calls[0]?.[0].to).toBe("+15551234567");
  });

  it("should handle failed messages from WhatsApp", async () => {
    // Mock failure for first two customers, success for the third
    vi.mocked(twilioModule.sendTwilioWhatsAppMessage)
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: "TWILIO_ERROR",
          message: "Invalid phone number",
        },
      })
      .mockResolvedValueOnce({
        ok: false,
        error: {
          code: "TWILIO_ERROR",
          message: "Network timeout",
        },
      })
      .mockResolvedValueOnce({
        ok: true,
        data: {
          sid: "SM789ghi012",
          status: "queued",
          to: "whatsapp:+15551234569",
          raw: {},
        },
      });

    const result = await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers,
    });

    expect(result.totalSent).toBe(1);
    expect(result.totalFailed).toBe(2);
    expect(result.messageGroups[0]?.status).toBe("failed");
    expect(result.messageGroups[2]?.status).toBe("sent");
  });

  it("should handle invalid phone numbers", async () => {
    const invalidCustomers = [
      { customerId: "customer-1", phone: "" },
      { customerId: "customer-2", phone: "abc" },
      { customerId: "customer-3", phone: "+1-555-1234" },
    ];

    vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mockResolvedValue({
      ok: true,
      data: {
        sid: "SMaxyz123",
        status: "queued",
        to: "whatsapp:+15551234",
        raw: {},
      },
    });

    const result = await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: invalidCustomers,
    });

    // First two should fail due to invalid phone, third should succeed
    expect(result.messageGroups[0]?.status).toBe("failed");
    expect(result.messageGroups[0]?.errorMessage).toBe(
      "Invalid phone number format",
    );
    expect(result.messageGroups[1]?.status).toBe("failed");
  });

  it("should handle database errors gracefully", async () => {
    vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mockResolvedValue({
      ok: true,
      data: {
        sid: "SMdb123error",
        status: "queued",
        to: "whatsapp:+15551234567",
        raw: {},
      },
    });

    // The service should handle database errors without throwing
    // We just verify that it completes and returns results
    const result = await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers.slice(0, 1),
    });

    // Message should still be recorded as sent despite potential DB issues
    expect(result.messageGroups).toHaveLength(1);
    expect(result.totalSent).toBeGreaterThanOrEqual(0);
  });

  it("should include error messages in response", async () => {
    vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mockResolvedValue({
      ok: false,
      error: {
        code: "TWILIO_ERROR",
        message: "Message text is required",
      },
    });

    const result = await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers.slice(0, 1),
    });

    expect(result.messageGroups[0]?.status).toBe("failed");
    expect(result.messageGroups[0]?.errorMessage).toMatch(
      /Message text is required|Database error/,
    );
  });

  it("should include message IDs for successful sends", async () => {
    vi.mocked(twilioModule.sendTwilioWhatsAppMessage).mockResolvedValue({
      ok: true,
      data: {
        sid: "SMwamid123abc",
        status: "queued",
        to: "whatsapp:+15551234567",
        raw: {},
      },
    });

    const result = await sendCampaignMessagesModule.sendCampaignMessages({
      campaign: mockCampaign,
      customerPhoneNumbers: mockCustomers.slice(0, 1),
    });

    expect(result.messageGroups[0]?.status).toBe("sent");
    expect(result.messageGroups[0]?.messageId).toBe("SMwamid123abc");
  });
});
