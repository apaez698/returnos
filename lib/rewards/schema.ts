import { z } from "zod";

export const createRewardRuleSchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres."),
  points_required: z
    .number()
    .int("Los puntos deben ser un número entero.")
    .gt(0, "Los puntos deben ser mayores que 0."),
  reward_description: z
    .string()
    .trim()
    .min(2, "La descripción debe tener al menos 2 caracteres."),
  is_active: z.boolean().default(true),
});

export type CreateRewardRuleInput = z.infer<typeof createRewardRuleSchema>;

export const updateRewardRuleSchema = createRewardRuleSchema.extend({
  id: z.string().uuid("Invalid reward rule ID."),
});

export type UpdateRewardRuleInput = z.infer<typeof updateRewardRuleSchema>;
