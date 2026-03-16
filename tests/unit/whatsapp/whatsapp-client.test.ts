import { describe, expect, it, vi } from "vitest";

import {
  createWhatsAppClient,
  type FetchLike,
} from "@/features/whatsapp/service/whatsapp-client";
import type { WhatsAppConfig } from "@/features/whatsapp/config/whatsapp-config";

const baseConfig: WhatsAppConfig = {
  enabled: true,
  phoneNumberId: "123456789",
  accessToken: "token-abc",
  apiVersion: "v23.0",
  verifyToken: "verify-123",
};

function createFetchMock(
  implementation: Parameters<typeof vi.fn>[0],
): FetchLike {
  return vi.fn(implementation) as unknown as FetchLike;
}

describe("createWhatsAppClient", () => {
  it("returns WHATSAPP_DISABLED and does not call fetch when disabled", async () => {
    const fetchMock = createFetchMock(async () => {
      throw new Error("should not run");
    });
    const client = createWhatsAppClient(
      { ...baseConfig, enabled: false },
      fetchMock,
    );

    const result = await client.sendTextMessage({
      to: "573001112233",
      text: "Hola",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("WHATSAPP_DISABLED");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns validation error when to is missing", async () => {
    const fetchMock = createFetchMock(async () => {
      throw new Error("should not run");
    });
    const client = createWhatsAppClient(baseConfig, fetchMock);

    const result = await client.sendTextMessage({ to: "   ", text: "Hola" });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("WHATSAPP_VALIDATION_ERROR");
      expect(result.error.message).toContain("Phone number is required");
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends text message and maps successful response", async () => {
    const apiPayload = {
      messaging_product: "whatsapp",
      contacts: [{ input: "573001112233", wa_id: "573001112233" }],
      messages: [{ id: "wamid.abc123" }],
    };

    const fetchMock = createFetchMock(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => apiPayload,
      } as Response;
    });

    const client = createWhatsAppClient(baseConfig, fetchMock);
    const result = await client.sendTextMessage({
      to: " 573001112233 ",
      text: " Hola desde ReturnOS ",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith(
      "https://graph.facebook.com/v23.0/123456789/messages",
      expect.objectContaining({
        method: "POST",
        headers: {
          Authorization: "Bearer token-abc",
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }),
    );

    const [, requestInit] = (fetchMock as unknown as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    expect(requestInit).toBeDefined();
    const parsedBody = JSON.parse((requestInit as RequestInit).body as string);
    expect(parsedBody).toEqual({
      messaging_product: "whatsapp",
      to: "573001112233",
      type: "text",
      text: {
        body: "Hola desde ReturnOS",
        preview_url: false,
      },
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.messagingProduct).toBe("whatsapp");
      expect(result.data.contacts).toEqual([
        { input: "573001112233", waId: "573001112233" },
      ]);
      expect(result.data.messages).toEqual([{ id: "wamid.abc123" }]);
      expect(result.data.raw).toEqual(apiPayload);
    }
  });

  it("normalizes formatted phone numbers before sending", async () => {
    const fetchMock = createFetchMock(async () => {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          messaging_product: "whatsapp",
          contacts: [],
          messages: [{ id: "wamid.formatted" }],
        }),
      } as Response;
    });

    const client = createWhatsAppClient(baseConfig, fetchMock);

    await client.sendTextMessage({
      to: " +57 (300) 111-22.33 ",
      text: "Hola",
    });

    const [, requestInit] = (fetchMock as unknown as ReturnType<typeof vi.fn>)
      .mock.calls[0];
    const parsedBody = JSON.parse((requestInit as RequestInit).body as string);

    expect(parsedBody.to).toBe("+573001112233");
  });

  it("returns structured HTTP error when API returns non-ok", async () => {
    const fetchMock = createFetchMock(async () => {
      return {
        ok: false,
        status: 400,
        json: async () => ({
          error: {
            message: "Invalid recipient",
            type: "OAuthException",
            code: 100,
            fbtrace_id: "TRACE123",
          },
        }),
      } as Response;
    });

    const client = createWhatsAppClient(baseConfig, fetchMock);
    const result = await client.sendTextMessage({
      to: "573001112233",
      text: "Hola",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("WHATSAPP_HTTP_ERROR");
      expect(result.error.message).toBe("Invalid recipient");
      expect(result.error.details).toEqual(
        expect.objectContaining({
          status: 400,
          type: "OAuthException",
          code: 100,
          fbtraceId: "TRACE123",
        }),
      );
    }
  });

  it("returns network error when fetch throws", async () => {
    const fetchMock = createFetchMock(async () => {
      throw new Error("network down");
    });

    const client = createWhatsAppClient(baseConfig, fetchMock);
    const result = await client.sendTextMessage({
      to: "573001112233",
      text: "Hola",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("WHATSAPP_NETWORK_ERROR");
      expect(result.error.message).toBe("network down");
    }
  });
});
