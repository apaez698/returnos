import { z } from "zod";

const optionalTrimmedString = z
  .string()
  .trim()
  .optional()
  .transform((value) => value || undefined);

export const visitSourceSchema = z.enum(["manual", "in_store", "qr"]);

export const visitRegistrationSchema = z.object({
  customer_id: z.string().trim().min(1, "Selecciona un cliente."),
  points_earned: z
    .number()
    .int("Los puntos deben ser un numero entero.")
    .min(0, "Los puntos deben ser 0 o mayores."),
  amount: z
    .number()
    .optional()
    .refine(
      (value) => value === undefined || value >= 0,
      "El monto debe ser 0 o mayor.",
    ),
  product_category: optionalTrimmedString,
  source: visitSourceSchema,
});

export type VisitRegistrationInput = z.infer<typeof visitRegistrationSchema>;

// Backward-compatible exports for existing usages.
export const createVisitSchema = visitRegistrationSchema;
export type CreateVisitInput = VisitRegistrationInput;
