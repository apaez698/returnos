import { createRewardRuleSchema } from "@/lib/rewards/schema";

describe("createRewardRuleSchema", () => {
  const validRewardRule = {
    name: "Free Coffee",
    points_required: 100,
    reward_description: "Redeem for one free coffee.",
    is_active: true,
  };

  it("accepts valid reward rule input", () => {
    const result = createRewardRuleSchema.safeParse(validRewardRule);

    expect(result.success).toBe(true);
  });

  it("fails when name is empty", () => {
    const result = createRewardRuleSchema.safeParse({
      ...validRewardRule,
      name: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["name"]);
    }
  });

  it("fails when points_required is zero", () => {
    const result = createRewardRuleSchema.safeParse({
      ...validRewardRule,
      points_required: 0,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["points_required"]);
    }
  });

  it("fails when points_required is negative", () => {
    const result = createRewardRuleSchema.safeParse({
      ...validRewardRule,
      points_required: -10,
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["points_required"]);
    }
  });

  it("fails when reward_description is empty", () => {
    const result = createRewardRuleSchema.safeParse({
      ...validRewardRule,
      reward_description: "",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["reward_description"]);
    }
  });
});
