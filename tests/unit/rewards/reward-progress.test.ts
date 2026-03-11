import { describe, expect, it } from "vitest";
import {
  calculateRewardProgress,
  getBestRedeemableReward,
  getNextReward,
} from "@/lib/rewards/progress";
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
      redeemableReward: null,
      nextReward: null,
      progressPercentageToNext: 0,
      remainingPointsToNext: 0,
      status: "no_reward",
    });
  });

  it("returns in_progress with remaining points when below a rule threshold", () => {
    const rules = [buildRule("r1", 100)];

    const result = calculateRewardProgress(40, rules);

    expect(result.nextReward?.id).toBe("r1");
    expect(result.redeemableReward).toBeNull();
    expect(result.status).toBe("in_progress");
    expect(result.remainingPointsToNext).toBe(60);
    expect(result.progressPercentageToNext).toBe(40);
  });

  it("returns redeemable and keeps next reward null when at highest rule", () => {
    const rules = [buildRule("r1", 100)];

    const result = calculateRewardProgress(100, rules);

    expect(result.redeemableReward?.id).toBe("r1");
    expect(result.nextReward).toBeNull();
    expect(result.status).toBe("redeemable");
    expect(result.remainingPointsToNext).toBe(0);
    expect(result.progressPercentageToNext).toBe(100);
  });

  it("indicates max reward reached when redeemable exists but no next reward", () => {
    const rules = [buildRule("r1", 100), buildRule("r2", 200)];

    const result = calculateRewardProgress(260, rules);

    expect(result.redeemableReward?.id).toBe("r2");
    expect(result.nextReward).toBeNull();
    expect(result.status).toBe("redeemable");
    expect(result.remainingPointsToNext).toBe(0);
    expect(result.progressPercentageToNext).toBe(100);
  });

  it("returns redeemable and next reward progress when another tier exists", () => {
    const rules = [buildRule("r1", 100), buildRule("r2", 200)];

    const result = calculateRewardProgress(120, rules);

    expect(result.redeemableReward?.id).toBe("r1");
    expect(result.nextReward?.id).toBe("r2");
    expect(result.status).toBe("redeemable");
    expect(result.remainingPointsToNext).toBe(80);
    expect(result.progressPercentageToNext).toBe(60);
  });

  it("prefers best redeemable reward when claimable", () => {
    const rules = [
      buildRule("r1", 50),
      buildRule("r2", 100),
      buildRule("r3", 150),
    ];

    const inProgressResult = calculateRewardProgress(120, rules);

    expect(inProgressResult.redeemableReward?.id).toBe("r2");
    expect(inProgressResult.nextReward?.id).toBe("r3");
    expect(inProgressResult.status).toBe("redeemable");
    expect(inProgressResult.remainingPointsToNext).toBe(30);
    expect(inProgressResult.progressPercentageToNext).toBe(80);

    const redeemableResult = calculateRewardProgress(180, rules);

    expect(redeemableResult.redeemableReward?.id).toBe("r3");
    expect(redeemableResult.nextReward).toBeNull();
    expect(redeemableResult.status).toBe("redeemable");
    expect(redeemableResult.remainingPointsToNext).toBe(0);
    expect(redeemableResult.progressPercentageToNext).toBe(100);
  });
});

describe("getBestRedeemableReward", () => {
  it("returns null when no active rules are redeemable", () => {
    const rules = [buildRule("r1", 100), buildRule("r2", 200)];

    const result = getBestRedeemableReward(50, rules);

    expect(result).toBeNull();
  });

  it("returns the highest redeemable active rule", () => {
    const rules = [
      buildRule("r1", 50),
      buildRule("r2", 100),
      buildRule("r3", 150),
    ];

    const result = getBestRedeemableReward(120, rules);

    expect(result?.id).toBe("r2");
  });

  it("ignores inactive rules before selecting the best redeemable rule", () => {
    const rules = [
      buildRule("r1", 50),
      buildRule("r2", 100, false),
      buildRule("r3", 200),
    ];

    const result = getBestRedeemableReward(150, rules);

    expect(result?.id).toBe("r1");
  });
});

describe("getNextReward", () => {
  it("returns the next active reward above current points", () => {
    const rules = [
      buildRule("r1", 50),
      buildRule("r2", 100),
      buildRule("r3", 150),
    ];

    const result = getNextReward(100, rules);

    expect(result?.id).toBe("r3");
  });

  it("returns null when no active reward is above current points", () => {
    const result = getNextReward(500, [buildRule("r1", 100)]);

    expect(result).toBeNull();
  });
});
