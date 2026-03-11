import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

function isPastOrToday(dateInput: string): boolean {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return date <= today;
}

export const createCustomerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "El nombre es obligatorio y debe tener al menos 2 caracteres."),
  phone: z.string().trim().min(1, "El telefono es obligatorio."),
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
