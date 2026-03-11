import { z } from "zod";

export const createRewardRuleSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  points_required: z
    .number()
    .int("Points must be an integer.")
    .gt(0, "Points must be greater than 0."),
  reward_description: z
    .string()
    .trim()
    .min(2, "Reward description must be at least 2 characters."),
  is_active: z.boolean().default(true),
});

export type CreateRewardRuleInput = z.infer<typeof createRewardRuleSchema>;

export const updateRewardRuleSchema = createRewardRuleSchema.extend({
  id: z.string().uuid("Invalid reward rule ID."),
});

export type UpdateRewardRuleInput = z.infer<typeof updateRewardRuleSchema>;
