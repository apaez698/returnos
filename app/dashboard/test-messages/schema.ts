import { z } from "zod";

export const sendTestMessageSchema = z.object({
  phone_number: z.string().trim().min(1, "El número de teléfono es requerido"),
  message: z
    .string()
    .trim()
    .min(1, "El mensaje es requerido")
    .max(1024, "El mensaje no puede exceder 1024 caracteres"),
  media_url: z.string().url("URL inválida").optional().or(z.literal("")),
});

export interface SendTestMessageState {
  status: "idle" | "success" | "error";
  message?: string;
  data?: {
    messageSid: string;
    status: string;
    to: string;
    mediaUrl?: string;
  };
  fieldErrors?: {
    phone_number?: string;
    message?: string;
    media?: string;
  };
}

export const initialSendTestMessageState: SendTestMessageState = {
  status: "idle",
};
