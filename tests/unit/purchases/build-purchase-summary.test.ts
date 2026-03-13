import { describe, expect, it } from "vitest";
import {
  buildCustomerRewardMessage,
  buildPurchaseSummary,
  calculatePointsEarnedFromPurchaseAmount,
  calculateProgressTowardRewardTarget,
  calculateTotalAccumulatedPoints,
  isRewardUnlocked,
} from "@/features/purchases/utils/build-purchase-summary";

describe("purchase summary helpers", () => {
  it("calculates points earned from purchase amount using 1 point per $0.10", () => {
    expect(calculatePointsEarnedFromPurchaseAmount(10.99)).toBe(109);
    expect(calculatePointsEarnedFromPurchaseAmount(1)).toBe(10);
    expect(calculatePointsEarnedFromPurchaseAmount(0.99)).toBe(9);
  });

  it("returns 0 points for invalid or negative purchase amount", () => {
    expect(calculatePointsEarnedFromPurchaseAmount(0)).toBe(0);
    expect(calculatePointsEarnedFromPurchaseAmount(-3)).toBe(0);
    expect(calculatePointsEarnedFromPurchaseAmount(Number.NaN)).toBe(0);
  });

  it("calculates total accumulated points", () => {
    expect(calculateTotalAccumulatedPoints(50, 127)).toBe(177);
    expect(calculateTotalAccumulatedPoints(0, 0)).toBe(0);
  });

  it("calculates progress toward reward target as bounded percentage", () => {
    expect(calculateProgressTowardRewardTarget(82, 100)).toBe(82);
    expect(calculateProgressTowardRewardTarget(120, 100)).toBe(100);
    expect(calculateProgressTowardRewardTarget(20, 0)).toBe(100);
  });

  it("determines if reward is unlocked", () => {
    expect(isRewardUnlocked(100, 100)).toBe(true);
    expect(isRewardUnlocked(101, 100)).toBe(true);
    expect(isRewardUnlocked(99, 100)).toBe(false);
  });

  it("builds customer-friendly reward messages", () => {
    expect(buildCustomerRewardMessage(82, 100, "free coffee")).toBe(
      "You need 18 more points for your free coffee",
    );
    expect(buildCustomerRewardMessage(100, 100, "free coffee")).toBe(
      "Reward unlocked",
    );
  });
});

describe("buildPurchaseSummary", () => {
  it("builds purchase summary with all required outputs", () => {
    expect(
      buildPurchaseSummary({
        purchaseAmount: 12.75,
        currentPoints: 70,
        rewardTargetPoints: 100,
        rewardName: "free coffee",
      }),
    ).toEqual({
      purchaseAmount: 12.75,
      pointsEarned: 127,
      totalAccumulatedPoints: 197,
      rewardTargetPoints: 100,
      progressToRewardPercent: 100,
      pointsRemainingToReward: 0,
      rewardUnlocked: true,
      customerMessage: "Reward unlocked",
    });
  });

  it("returns unlocked summary when target is reached", () => {
    expect(
      buildPurchaseSummary({
        purchaseAmount: 20,
        currentPoints: 85,
        rewardTargetPoints: 100,
        rewardName: "free coffee",
      }),
    ).toEqual({
      purchaseAmount: 20,
      pointsEarned: 200,
      totalAccumulatedPoints: 285,
      rewardTargetPoints: 100,
      progressToRewardPercent: 100,
      pointsRemainingToReward: 0,
      rewardUnlocked: true,
      customerMessage: "Reward unlocked",
    });
  });
});
