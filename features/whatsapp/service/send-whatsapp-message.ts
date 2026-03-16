import "server-only";

import {
  createWhatsAppClient,
  type SendWhatsAppTextInput,
  type WhatsAppClient,
  type WhatsAppSendMessageResponse,
} from "@/features/whatsapp/service/whatsapp-client";
import {
  getErrorMessage,
  whatsappError,
  type WhatsAppResult,
} from "@/features/whatsapp/utils/whatsapp-errors";

export async function sendWhatsAppMessage(
  input: SendWhatsAppTextInput,
  client: WhatsAppClient = createWhatsAppClient(),
): Promise<WhatsAppResult<WhatsAppSendMessageResponse>> {
  try {
    return await client.sendTextMessage(input);
  } catch (error) {
    return whatsappError(
      "WHATSAPP_UNKNOWN_ERROR",
      getErrorMessage(error, "Could not send WhatsApp message."),
      { raw: error },
    );
  }
}
