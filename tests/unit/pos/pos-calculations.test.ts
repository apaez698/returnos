import { describe, expect, it } from "vitest";
import {
  calculatePointsFromAmount,
  calculateUpdatedPoints,
  findNewlyUnlockedReward,
  getPurchaseSummary,
} from "@/lib/pos/calculations";
import { PosRewardThreshold } from "@/lib/pos/types";

const rewardRules: PosRewardThreshold[] = [
  { id: "r1", name: "Cafe gratis", points_required: 20, is_active: true },
  { id: "r2", name: "Postre", points_required: 40, is_active: true },
  { id: "r3", name: "Inactiva", points_required: 30, is_active: false },
];

describe("POS calculations", () => {
  it("calculates points from amount using 1 point per $0.10", () => {
    expect(calculatePointsFromAmount(99.99)).toBe(999);
    expect(calculatePointsFromAmount(100)).toBe(1000);
    expect(calculatePointsFromAmount(1.8)).toBe(18);
    expect(calculatePointsFromAmount(0.8)).toBe(8);
  });

  it("returns 0 points for invalid or non-positive amount", () => {
    expect(calculatePointsFromAmount(0)).toBe(0);
    expect(calculatePointsFromAmount(-5)).toBe(0);
    expect(calculatePointsFromAmount(Number.NaN)).toBe(0);
  });

  it("updates points based on current points and amount", () => {
    expect(calculateUpdatedPoints(15, 50)).toBe(515);
  });

  it("builds purchase summary from amount and current points", () => {
    expect(getPurchaseSummary(15, 50.9)).toEqual({
      amount: 50.9,
      pointsEarned: 509,
      updatedPoints: 524,
    });
  });

  it("detects newly unlocked reward after purchase", () => {
    const unlocked = findNewlyUnlockedReward(18, 25, rewardRules);
    expect(unlocked?.name).toBe("Cafe gratis");
  });

  it("returns null when no new reward is unlocked", () => {
    const unlocked = findNewlyUnlockedReward(22, 25, rewardRules);
    expect(unlocked).toBeNull();
  });

  it("returns highest unlocked reward when crossing multiple tiers", () => {
    const unlocked = findNewlyUnlockedReward(15, 50, rewardRules);
    expect(unlocked?.name).toBe("Postre");
  });
});

describe("calculatePointsFromAmount – cents-aware behavior", () => {
  it("returns 35 points for 3.50", () => {
    expect(calculatePointsFromAmount(3.5)).toBe(35);
  });

  it("returns 100 for a whole-number amount of 10", () => {
    expect(calculatePointsFromAmount(10)).toBe(100);
  });

  it("returns 9 points for 0.99", () => {
    expect(calculatePointsFromAmount(0.99)).toBe(9);
  });
});

describe("getPurchaseSummary – pointsEarned and updatedPoints", () => {
  it("returns pointsEarned = floor(amount * 10)", () => {
    const { pointsEarned } = getPurchaseSummary(0, 3.5);
    expect(pointsEarned).toBe(35);
  });

  it("adds pointsEarned to currentPoints to produce updatedPoints", () => {
    const { updatedPoints } = getPurchaseSummary(100, 3.5);
    expect(updatedPoints).toBe(135);
  });

  it("adds points when amount has positive cents value", () => {
    const { pointsEarned, updatedPoints } = getPurchaseSummary(50, 0.99);
    expect(pointsEarned).toBe(9);
    expect(updatedPoints).toBe(59);
  });

  it("accumulates correctly from a zero balance", () => {
    const { pointsEarned, updatedPoints } = getPurchaseSummary(0, 10);
    expect(pointsEarned).toBe(100);
    expect(updatedPoints).toBe(100);
  });
});
