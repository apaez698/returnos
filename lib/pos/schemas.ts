import { z } from "zod";

export const posPurchaseSchema = z.object({
  customer_id: z.string().trim().min(1, "Selecciona un cliente."),
  amount: z
    .number({ error: "El monto es obligatorio." })
    .positive("Ingresa un monto mayor a 0."),
});

export type PosPurchaseInput = z.infer<typeof posPurchaseSchema>;
