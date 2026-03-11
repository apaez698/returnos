import { describe, expect, it } from "vitest";
import { calculateRewardProgress } from "@/lib/rewards/calculations";
import { RewardRule } from "@/lib/rewards/types";

const buildRule = (
  id: string,
  pointsRequired: number,
  isActive = true,
): RewardRule => ({
  id,
  business_id: "business-1",
  name: `Reward at ${pointsRequired} points`,
  points_required: pointsRequired,
  reward_description: "Free item",
  is_active: isActive,
  created_at: "2026-03-11T00:00:00.000Z",
});

describe("calculateRewardProgress", () => {
  describe("no active rules", () => {
    it("returns no_reward status with null rewards", () => {
      const result = calculateRewardProgress(50, [buildRule("r1", 100, false)]);

      expect(result.status).toBe("no_reward");
      expect(result.redeemableReward).toBeNull();
      expect(result.nextReward).toBeNull();
      expect(result.progressPercentageToNext).toBe(0);
      expect(result.remainingPointsToNext).toBe(0);
    });
  });

  describe("points below first reward", () => {
    it("returns in_progress status with nextReward set", () => {
      const rules = [buildRule("r1", 100)];
      const result = calculateRewardProgress(40, rules);

      expect(result.status).toBe("in_progress");
      expect(result.redeemableReward).toBeNull();
      expect(result.nextReward?.id).toBe("r1");
      expect(result.nextReward?.points_required).toBe(100);
      expect(result.progressPercentageToNext).toBe(40);
      expect(result.remainingPointsToNext).toBe(60);
    });
  });

  describe("points exactly equal to reward", () => {
    it("returns redeemable status with redeemableReward and nextReward if one exists", () => {
      const rules = [buildRule("r1", 100), buildRule("r2", 200)];
      const result = calculateRewardProgress(100, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r1");
      expect(result.redeemableReward?.points_required).toBe(100);
      expect(result.nextReward?.id).toBe("r2");
      expect(result.nextReward?.points_required).toBe(200);
      expect(result.progressPercentageToNext).toBe(50);
      expect(result.remainingPointsToNext).toBe(100);
    });

    it("returns redeemable with no nextReward if it's the highest reward", () => {
      const rules = [buildRule("r1", 100)];
      const result = calculateRewardProgress(100, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r1");
      expect(result.nextReward).toBeNull();
      expect(result.progressPercentageToNext).toBe(100);
      expect(result.remainingPointsToNext).toBe(0);
    });
  });

  describe("points above one reward and below another", () => {
    it("returns both redeemableReward and nextReward with progress metrics", () => {
      const rules = [buildRule("r1", 100), buildRule("r2", 200)];
      const result = calculateRewardProgress(150, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r1");
      expect(result.redeemableReward?.points_required).toBe(100);
      expect(result.nextReward?.id).toBe("r2");
      expect(result.nextReward?.points_required).toBe(200);
      expect(result.progressPercentageToNext).toBe(75);
      expect(result.remainingPointsToNext).toBe(50);
    });

    it("correctly calculates progress when far below next reward", () => {
      const rules = [
        buildRule("r1", 100),
        buildRule("r2", 200),
        buildRule("r3", 500),
      ];
      const result = calculateRewardProgress(120, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r1");
      expect(result.nextReward?.id).toBe("r2");
      expect(result.progressPercentageToNext).toBe(60);
      expect(result.remainingPointsToNext).toBe(80);
    });
  });

  describe("points above highest reward", () => {
    it("returns redeemable with no nextReward and 100% progress", () => {
      const rules = [buildRule("r1", 100), buildRule("r2", 200)];
      const result = calculateRewardProgress(300, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r2");
      expect(result.redeemableReward?.points_required).toBe(200);
      expect(result.nextReward).toBeNull();
      expect(result.progressPercentageToNext).toBe(100);
      expect(result.remainingPointsToNext).toBe(0);
    });

    it("returns redeemable with no nextReward for significantly high points", () => {
      const rules = [buildRule("r1", 50), buildRule("r2", 100)];
      const result = calculateRewardProgress(500, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r2");
      expect(result.nextReward).toBeNull();
      expect(result.progressPercentageToNext).toBe(100);
      expect(result.remainingPointsToNext).toBe(0);
    });
  });

  describe("inactive rules are ignored", () => {
    it("filters out inactive rules when determining progress", () => {
      const rules = [
        buildRule("r1", 50, false),
        buildRule("r2", 100),
        buildRule("r3", 150, false),
      ];
      const result = calculateRewardProgress(75, rules);

      expect(result.status).toBe("in_progress");
      expect(result.nextReward?.id).toBe("r2");
      expect(result.nextReward?.points_required).toBe(100);
      expect(result.progressPercentageToNext).toBe(75);
      expect(result.remainingPointsToNext).toBe(25);
    });

    it("returns no_reward when all rules are inactive", () => {
      const rules = [buildRule("r1", 100, false), buildRule("r2", 200, false)];
      const result = calculateRewardProgress(50, rules);

      expect(result.status).toBe("no_reward");
      expect(result.redeemableReward).toBeNull();
      expect(result.nextReward).toBeNull();
    });
  });

  describe("reward rule sort order", () => {
    it("handles unsorted rules by sorting by points required", () => {
      const rules = [
        buildRule("r3", 300),
        buildRule("r1", 100),
        buildRule("r2", 200),
      ];
      const result = calculateRewardProgress(150, rules);

      expect(result.nextReward?.id).toBe("r2");
      expect(result.nextReward?.points_required).toBe(200);
      expect(result.progressPercentageToNext).toBe(75);
    });
  });

  describe("edge cases", () => {
    it("returns in_progress with 0 points, 0% progress", () => {
      const rules = [buildRule("r1", 100), buildRule("r2", 200)];
      const result = calculateRewardProgress(0, rules);

      expect(result.status).toBe("in_progress");
      expect(result.progressPercentageToNext).toBe(0);
      expect(result.remainingPointsToNext).toBe(100);
    });

    it("handles single high-value reward correctly", () => {
      const rules = [buildRule("r1", 1000)];
      const result = calculateRewardProgress(500, rules);

      expect(result.status).toBe("in_progress");
      expect(result.redeemableReward).toBeNull();
      expect(result.nextReward?.points_required).toBe(1000);
      expect(result.progressPercentageToNext).toBe(50);
      expect(result.remainingPointsToNext).toBe(500);
    });

    it("handles many reward tiers", () => {
      const rules = [
        buildRule("r1", 50),
        buildRule("r2", 100),
        buildRule("r3", 150),
        buildRule("r4", 200),
        buildRule("r5", 250),
      ];
      const result = calculateRewardProgress(125, rules);

      expect(result.status).toBe("redeemable");
      expect(result.redeemableReward?.id).toBe("r2");
      expect(result.nextReward?.id).toBe("r3");
      expect(result.progressPercentageToNext).toBe(83);
      expect(result.remainingPointsToNext).toBe(25);
    });
  });
});
