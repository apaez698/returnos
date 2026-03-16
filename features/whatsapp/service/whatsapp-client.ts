import "server-only";

import {
  getWhatsAppConfig,
  type WhatsAppConfig,
} from "@/features/whatsapp/config/whatsapp-config";
import { buildTextMessage } from "@/features/whatsapp/service/build-text-message";
import { normalizeWhatsAppPhone } from "@/features/whatsapp/utils/normalize-whatsapp-phone";
import {
  getErrorMessage,
  whatsappError,
  whatsappSuccess,
  type WhatsAppResult,
} from "@/features/whatsapp/utils/whatsapp-errors";

interface WhatsAppApiErrorBody {
  error?: {
    message?: string;
    type?: string;
    code?: number;
    fbtrace_id?: string;
  };
}

export interface SendWhatsAppTextInput {
  to: string;
  text: string;
  previewUrl?: boolean;
}

export interface WhatsAppSentMessage {
  id: string;
}

export interface WhatsAppSendMessageResponse {
  messagingProduct: string;
  contacts: Array<{ input?: string; waId?: string }>;
  messages: WhatsAppSentMessage[];
  raw: unknown;
}

export type FetchLike = typeof fetch;

export interface WhatsAppClient {
  sendTextMessage(
    input: SendWhatsAppTextInput,
  ): Promise<WhatsAppResult<WhatsAppSendMessageResponse>>;
}

function buildMessagesUrl(config: WhatsAppConfig): string {
  return `https://graph.facebook.com/${config.apiVersion}/${config.phoneNumberId}/messages`;
}

function parseSendMessageResponse(
  payload: unknown,
): WhatsAppSendMessageResponse {
  const rawPayload = payload as {
    messaging_product?: string;
    contacts?: Array<{ input?: string; wa_id?: string }>;
    messages?: Array<{ id?: string }>;
  };

  return {
    messagingProduct: rawPayload.messaging_product ?? "whatsapp",
    contacts: (rawPayload.contacts ?? []).map((contact) => ({
      input: contact.input,
      waId: contact.wa_id,
    })),
    messages: (rawPayload.messages ?? [])
      .filter((message): message is { id: string } => Boolean(message.id))
      .map((message) => ({ id: message.id })),
    raw: payload,
  };
}

export function createWhatsAppClient(
  config: WhatsAppConfig = getWhatsAppConfig(),
  fetchImpl: FetchLike = fetch,
): WhatsAppClient {
  return {
    async sendTextMessage(
      input: SendWhatsAppTextInput,
    ): Promise<WhatsAppResult<WhatsAppSendMessageResponse>> {
      const to = normalizeWhatsAppPhone(input.to);
      const text = input.text.trim();

      if (!config.enabled) {
        return whatsappError(
          "WHATSAPP_DISABLED",
          "WhatsApp messaging is disabled by configuration.",
        );
      }

      if (!to) {
        return whatsappError(
          "WHATSAPP_VALIDATION_ERROR",
          "Phone number is required to send a WhatsApp message.",
        );
      }

      if (!text) {
        return whatsappError(
          "WHATSAPP_VALIDATION_ERROR",
          "Message text is required to send a WhatsApp message.",
        );
      }

      try {
        const response = await fetchImpl(buildMessagesUrl(config), {
          method: "POST",
          headers: {
            Authorization: `Bearer ${config.accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buildTextMessage({
              to,
              text,
              previewUrl: input.previewUrl,
            }),
          ),
          cache: "no-store",
        });

        const payload = (await response.json()) as unknown;

        if (!response.ok) {
          const errorBody = payload as WhatsAppApiErrorBody;
          const apiMessage =
            errorBody.error?.message ||
            `WhatsApp API request failed with status ${response.status}.`;

          return whatsappError("WHATSAPP_HTTP_ERROR", apiMessage, {
            status: response.status,
            type: errorBody.error?.type,
            code: errorBody.error?.code,
            fbtraceId: errorBody.error?.fbtrace_id,
            raw: payload,
          });
        }

        return whatsappSuccess(parseSendMessageResponse(payload));
      } catch (error) {
        return whatsappError(
          "WHATSAPP_NETWORK_ERROR",
          getErrorMessage(
            error,
            "Could not send WhatsApp message due to a network error.",
          ),
          { raw: error },
        );
      }
    },
  };
}
