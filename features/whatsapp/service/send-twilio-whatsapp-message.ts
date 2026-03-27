import "server-only";

import twilio from "twilio";
import { getTwilioConfig } from "@/features/whatsapp/config/twilio-config";

export interface SendTwilioWhatsAppMessageInput {
  to: string; // Teléfono destino (debe incluir +)
  text: string; // Mensaje a enviar
  mediaUrl?: string; // URL de imagen, video o documento (opcional)
}

export interface TwilioSentMessage {
  sid: string; // Message SID de Twilio
}

export interface TwilioSendMessageResponse {
  sid: string;
  status: string;
  to: string;
  raw: unknown;
}

export type TwilioResult<TData> =
  | { ok: true; data: TData }
  | { ok: false; error: { code: string; message: string; details?: unknown } };

/**
 * Envía un mensaje WhatsApp vía Twilio
 * Usa el Twilio WhatsApp Sandbox (o número aprobado)
 */
export async function sendTwilioWhatsAppMessage(
  input: SendTwilioWhatsAppMessageInput,
): Promise<TwilioResult<TwilioSendMessageResponse>> {
  try {
    const config = getTwilioConfig();

    if (!config.enabled) {
      return {
        ok: false,
        error: {
          code: "TWILIO_DISABLED",
          message: "Twilio WhatsApp is disabled",
        },
      };
    }

    // Crear cliente Twilio
    const client = twilio(config.accountSid, config.authToken);

    // Enviar mensaje
    let message;

    if (input.mediaUrl) {
      message = await client.messages.create({
        from: `whatsapp:${config.fromPhoneNumber}`,
        to: `whatsapp:${input.to}`,
        body: input.text,
        mediaUrl: [input.mediaUrl],
      } as Parameters<typeof client.messages.create>[0]);
    } else {
      message = await client.messages.create({
        from: `whatsapp:${config.fromPhoneNumber}`,
        to: `whatsapp:${input.to}`,
        body: input.text,
      });
    }

    return {
      ok: true,
      data: {
        sid: message.sid,
        status: message.status,
        to: message.to,
        raw: message,
      },
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorCode =
      error instanceof Error && error.constructor.name.includes("Twilio")
        ? "TWILIO_ERROR"
        : "TWILIO_UNKNOWN_ERROR";

    return {
      ok: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: error,
      },
    };
  }
}
