import "server-only";

export interface TwilioConfig {
  enabled: boolean;
  accountSid: string;
  authToken: string;
  fromPhoneNumber: string; // El número de Twilio WhatsApp Sandbox
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

export function getTwilioConfig(): TwilioConfig {
  const enabled = parseBooleanFlag(process.env.TWILIO_ENABLED, true);
  const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim() ?? "";
  const authToken = process.env.TWILIO_AUTH_TOKEN?.trim() ?? "";
  let fromPhoneNumber = process.env.TWILIO_WHATSAPP_PHONE_NUMBER?.trim() ?? "";

  // Si el número viene con prefijo whatsapp:, lo removemos
  if (fromPhoneNumber.startsWith("whatsapp:")) {
    fromPhoneNumber = fromPhoneNumber.replace("whatsapp:", "");
  }

  if (!enabled) {
    return {
      enabled,
      accountSid,
      authToken,
      fromPhoneNumber,
    };
  }

  if (!accountSid) {
    throw new Error("Missing env var: TWILIO_ACCOUNT_SID");
  }

  if (!authToken) {
    throw new Error("Missing env var: TWILIO_AUTH_TOKEN");
  }

  if (!fromPhoneNumber) {
    throw new Error("Missing env var: TWILIO_WHATSAPP_PHONE_NUMBER");
  }

  return {
    enabled,
    accountSid,
    authToken,
    fromPhoneNumber,
  };
}
