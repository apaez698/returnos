export type WhatsAppMessageType = "text";

export interface WhatsAppBaseMessagePayload {
  messaging_product: "whatsapp";
  to: string;
  type: WhatsAppMessageType;
}

export interface WhatsAppTextMessageBody {
  body: string;
  preview_url: boolean;
}

export interface WhatsAppTextMessagePayload extends WhatsAppBaseMessagePayload {
  type: "text";
  text: WhatsAppTextMessageBody;
}
