import { z } from "zod";
import { normalizeWhatsAppPhone } from "@/features/whatsapp/utils/normalize-whatsapp-phone";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

function isPastOrToday(dateInput: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateInput);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);
  if (
    Number.isNaN(date.getTime()) ||
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  date.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date <= today;
}

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio y debe tener al menos 2 caracteres."),
  phone: z
    .string()
    .transform((value) => normalizeWhatsAppPhone(value))
    .refine((value) => value.length > 0, "El telefono es obligatorio."),
  email: optionalTrimmedString.refine(
    (value) => !value || z.email().safeParse(value).success,
    "Ingresa un correo valido.",
  ),
  birthday: optionalTrimmedString.refine(
    (value) => !value || isPastOrToday(value),
    "La fecha de cumpleanos debe ser hoy o una fecha pasada.",
  ),
  consent_marketing: z.boolean().default(false),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
