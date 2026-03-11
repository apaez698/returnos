import { describe, expect, it } from "vitest";
import { calculateRewardProgress } from "@/lib/rewards/progress";
import { RewardRule } from "@/lib/rewards/types";

const buildRule = (
  id: string,
  pointsRequired: number,
  isActive = true,
): RewardRule => ({
  id,
  business_id: "business-1",
  name: `Reward ${pointsRequired}`,
  points_required: pointsRequired,
  reward_description: "Reward description",
  is_active: isActive,
  created_at: "2026-03-11T00:00:00.000Z",
});

describe("calculateRewardProgress", () => {
  it("returns no_reward when there are no active reward rules", () => {
    const result = calculateRewardProgress(40, [buildRule("r1", 50, false)]);

    expect(result).toEqual({
      nearestReward: null,
      progressPercentage: 0,
      remainingPoints: 0,
      status: "no_reward",
    });
  });

  it("returns in_progress with remaining points when below a rule threshold", () => {
    const rules = [buildRule("r1", 100)];

    const result = calculateRewardProgress(40, rules);

    expect(result.nearestReward?.id).toBe("r1");
    expect(result.status).toBe("in_progress");
    expect(result.remainingPoints).toBe(60);
  });

  it("returns eligible when points are exactly equal to a rule threshold", () => {
    const rules = [buildRule("r1", 100)];

    const result = calculateRewardProgress(100, rules);

    expect(result.nearestReward?.id).toBe("r1");
    expect(result.status).toBe("eligible");
    expect(result.remainingPoints).toBe(0);
  });

  it("returns eligible when points are above a rule threshold", () => {
    const rules = [buildRule("r1", 100)];

    const result = calculateRewardProgress(120, rules);

    expect(result.nearestReward?.id).toBe("r1");
    expect(result.status).toBe("eligible");
    expect(result.remainingPoints).toBe(0);
  });

  it("chooses the nearest relevant reward across multiple rules", () => {
    const rules = [
      buildRule("r1", 50),
      buildRule("r2", 100),
      buildRule("r3", 150),
    ];

    const inProgressResult = calculateRewardProgress(120, rules);

    expect(inProgressResult.nearestReward?.id).toBe("r3");
    expect(inProgressResult.status).toBe("in_progress");
    expect(inProgressResult.remainingPoints).toBe(30);

    const eligibleResult = calculateRewardProgress(180, rules);

    expect(eligibleResult.nearestReward?.id).toBe("r3");
    expect(eligibleResult.status).toBe("eligible");
    expect(eligibleResult.remainingPoints).toBe(0);
  });
});
