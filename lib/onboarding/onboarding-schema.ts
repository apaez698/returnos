import { z } from "zod";

export const businessTypeSchema = z.enum(["bakery", "restaurant"], {
  error: "Selecciona el tipo de negocio.",
});

export const createBusinessOwnerInputSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Escribe el nombre de tu negocio.")
    .max(80, "El nombre es demasiado largo."),
  businessType: businessTypeSchema,
});

export type CreateBusinessOwnerInput = z.infer<
  typeof createBusinessOwnerInputSchema
>;
