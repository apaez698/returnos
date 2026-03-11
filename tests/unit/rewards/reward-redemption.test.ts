import { describe, expect, it } from "vitest";
import { getRewardRedemptionSummary } from "@/lib/rewards/redemption";

describe("Reward Redemption Logic", () => {
  describe("getRewardRedemptionSummary - successful redemption", () => {
    it("allows redemption when customer has exact required points", () => {
      const result = getRewardRedemptionSummary(100, 100);

      expect(result.canRedeem).toBe(true);
      expect(result.currentPoints).toBe(100);
      expect(result.pointsRequired).toBe(100);
      expect(result.pointsAfterRedemption).toBe(0);
    });

    it("allows redemption when customer has more than required points", () => {
      const result = getRewardRedemptionSummary(250, 100);

      expect(result.canRedeem).toBe(true);
      expect(result.currentPoints).toBe(250);
      expect(result.pointsRequired).toBe(100);
      expect(result.pointsAfterRedemption).toBe(150);
    });

    it("returns success status for valid redemption scenarios", () => {
      const result = getRewardRedemptionSummary(500, 200);

      expect(result.canRedeem).toBe(true);
      expect(result.pointsAfterRedemption).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getRewardRedemptionSummary - insufficient points", () => {
    it("prevents redemption when customer has fewer points than required", () => {
      const result = getRewardRedemptionSummary(70, 100);

      expect(result.canRedeem).toBe(false);
      expect(result.currentPoints).toBe(70);
      expect(result.pointsRequired).toBe(100);
    });

    it("prevents redemption when customer has zero points", () => {
      const result = getRewardRedemptionSummary(0, 50);

      expect(result.canRedeem).toBe(false);
      expect(result.pointsAfterRedemption).toBe(0);
    });

    it("prevents redemption and preserves points when insufficient", () => {
      const result = getRewardRedemptionSummary(25, 100);

      expect(result.canRedeem).toBe(false);
      expect(result.pointsAfterRedemption).toBe(result.currentPoints);
    });
  });

  describe("getRewardRedemptionSummary - points deducted correctly", () => {
    it("calculates correct remaining points after redemption", () => {
      const currentPoints = 300;
      const pointsRequired = 75;
      const result = getRewardRedemptionSummary(currentPoints, pointsRequired);

      expect(result.pointsAfterRedemption).toBe(225);
      expect(result.pointsAfterRedemption).toBe(currentPoints - pointsRequired);
    });

    it("does not deduct points when redemption is not possible", () => {
      const currentPoints = 50;
      const pointsRequired = 100;
      const result = getRewardRedemptionSummary(currentPoints, pointsRequired);

      expect(result.pointsAfterRedemption).toBe(currentPoints);
      expect(result.pointsAfterRedemption).not.toBeLessThan(0);
    });

    it("verifies exact point deduction in multiple scenarios", () => {
      const scenarios = [
        { current: 500, required: 100, expected: 400 },
        { current: 1000, required: 250, expected: 750 },
        { current: 150, required: 50, expected: 100 },
      ];

      scenarios.forEach(({ current, required, expected }) => {
        const result = getRewardRedemptionSummary(current, required);
        expect(result.pointsAfterRedemption).toBe(expected);
      });
    });
  });

  describe("getRewardRedemptionSummary - redemption event recorded (via return object)", () => {
    it("returns complete redemption summary for recording", () => {
      const result = getRewardRedemptionSummary(120, 100);

      // All required fields present for event recording
      expect(result).toHaveProperty("currentPoints");
      expect(result).toHaveProperty("pointsRequired");
      expect(result).toHaveProperty("pointsAfterRedemption");
      expect(result).toHaveProperty("canRedeem");
    });

    it("records current state before redemption", () => {
      const result = getRewardRedemptionSummary(500, 150);

      expect(result.currentPoints).toBe(500);
      expect(result.pointsRequired).toBe(150);
    });

    it("records final state after redemption", () => {
      const result = getRewardRedemptionSummary(250, 75);

      expect(result.pointsAfterRedemption).toBe(175);
      expect(result.canRedeem).toBe(true);
    });

    it("returns consistent state data across redemption scenarios", () => {
      const successResult = getRewardRedemptionSummary(200, 100);
      const failureResult = getRewardRedemptionSummary(50, 100);

      // Both should have the required structure
      [successResult, failureResult].forEach((result) => {
        expect(typeof result.canRedeem).toBe("boolean");
        expect(typeof result.currentPoints).toBe("number");
        expect(typeof result.pointsRequired).toBe("number");
        expect(typeof result.pointsAfterRedemption).toBe("number");
      });
    });
  });

  describe("getRewardRedemptionSummary - edge cases", () => {
    it("clamps invalid negative inputs to zero", () => {
      const result = getRewardRedemptionSummary(-20, -10);

      expect(result.canRedeem).toBe(true);
      expect(result.currentPoints).toBe(0);
      expect(result.pointsRequired).toBe(0);
      expect(result.pointsAfterRedemption).toBe(0);
    });

    it("handles large point values correctly", () => {
      const result = getRewardRedemptionSummary(1000000, 500000);

      expect(result.canRedeem).toBe(true);
      expect(result.pointsAfterRedemption).toBe(500000);
    });

    it("preserves zero points when already zero", () => {
      const result = getRewardRedemptionSummary(0, 0);

      expect(result.canRedeem).toBe(true);
      expect(result.pointsAfterRedemption).toBe(0);
    });

    it("handles case where negative current is converted to zero", () => {
      const result = getRewardRedemptionSummary(-50, 100);

      expect(result.currentPoints).toBe(0);
      expect(result.canRedeem).toBe(false);
    });
  });
});
