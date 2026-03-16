export type WhatsAppErrorCode =
  | "WHATSAPP_DISABLED"
  | "WHATSAPP_CONFIG_ERROR"
  | "WHATSAPP_VALIDATION_ERROR"
  | "WHATSAPP_HTTP_ERROR"
  | "WHATSAPP_NETWORK_ERROR"
  | "WHATSAPP_UNKNOWN_ERROR";

export interface WhatsAppErrorDetails {
  type?: string;
  code?: number;
  fbtraceId?: string;
  status?: number;
  raw?: unknown;
}

export interface WhatsAppErrorResult {
  ok: false;
  error: {
    code: WhatsAppErrorCode;
    message: string;
    details?: WhatsAppErrorDetails;
  };
}

export interface WhatsAppSuccessResult<TData> {
  ok: true;
  data: TData;
}

export type WhatsAppResult<TData> =
  | WhatsAppSuccessResult<TData>
  | WhatsAppErrorResult;

export function whatsappSuccess<TData>(
  data: TData,
): WhatsAppSuccessResult<TData> {
  return { ok: true, data };
}

export function whatsappError(
  code: WhatsAppErrorCode,
  message: string,
  details?: WhatsAppErrorDetails,
): WhatsAppErrorResult {
  return {
    ok: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
