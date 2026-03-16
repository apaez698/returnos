import { describe, expect, it, vi } from "vitest";

import { sendWhatsAppMessage } from "@/features/whatsapp/service/send-whatsapp-message";
import type { WhatsAppClient } from "@/features/whatsapp/service/whatsapp-client";

describe("sendWhatsAppMessage", () => {
  it("returns the exact client result on success", async () => {
    const successResult = {
      ok: true as const,
      data: {
        messagingProduct: "whatsapp",
        contacts: [{ input: "573001112233", waId: "573001112233" }],
        messages: [{ id: "wamid.123" }],
        raw: { ok: true },
      },
    };

    const client: WhatsAppClient = {
      sendTextMessage: vi.fn().mockResolvedValue(successResult),
    };

    const result = await sendWhatsAppMessage(
      { to: "573001112233", text: "Hola" },
      client,
    );

    expect(result).toEqual(successResult);
    expect(client.sendTextMessage).toHaveBeenCalledWith({
      to: "573001112233",
      text: "Hola",
    });
  });

  it("returns WHATSAPP_UNKNOWN_ERROR when client throws", async () => {
    const client: WhatsAppClient = {
      sendTextMessage: vi.fn().mockRejectedValue(new Error("boom")),
    };

    const result = await sendWhatsAppMessage(
      { to: "573001112233", text: "Hola" },
      client,
    );

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.code).toBe("WHATSAPP_UNKNOWN_ERROR");
      expect(result.error.message).toBe("boom");
    }
  });
});
