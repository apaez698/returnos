import "server-only";

export interface WhatsAppConfig {
  enabled: boolean;
  phoneNumberId: string;
  accessToken: string;
  apiVersion: string;
  verifyToken: string;
}

function parseBooleanFlag(
  value: string | undefined,
  fallback: boolean,
): boolean {
  if (!value) {
    return fallback;
  }

  return value.trim().toLowerCase() === "true";
}

export function getWhatsAppConfig(): WhatsAppConfig {
  const enabled = parseBooleanFlag(process.env.WHATSAPP_ENABLED, true);
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim() ?? "";
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN?.trim() ?? "";
  const apiVersion = process.env.WHATSAPP_API_VERSION?.trim() || "v23.0";
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim() ?? "";

  if (!enabled) {
    return {
      enabled,
      phoneNumberId,
      accessToken,
      apiVersion,
      verifyToken,
    };
  }

  if (!phoneNumberId) {
    throw new Error("Missing env var: WHATSAPP_PHONE_NUMBER_ID");
  }

  if (!accessToken) {
    throw new Error("Missing env var: WHATSAPP_ACCESS_TOKEN");
  }

  if (!verifyToken) {
    throw new Error("Missing env var: WHATSAPP_VERIFY_TOKEN");
  }

  return {
    enabled,
    phoneNumberId,
    accessToken,
    apiVersion,
    verifyToken,
  };
}
