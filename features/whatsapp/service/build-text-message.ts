import type { WhatsAppTextMessagePayload } from "@/features/whatsapp/service/whatsapp-message-types";

export interface BuildTextMessageInput {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export function buildTextMessage(
  input: BuildTextMessageInput,
): WhatsAppTextMessagePayload {
  return {
    messaging_product: "whatsapp",
    to: input.to.trim(),
    type: "text",
    text: {
      body: input.text.trim(),
      preview_url: input.previewUrl ?? false,
    },
  };
}
