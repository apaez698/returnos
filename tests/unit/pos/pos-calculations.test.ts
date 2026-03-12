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
  it("calculates points from amount using floor(amount)", () => {
    expect(calculatePointsFromAmount(99.99)).toBe(99);
    expect(calculatePointsFromAmount(100)).toBe(100);
    expect(calculatePointsFromAmount(1.8)).toBe(1);
    expect(calculatePointsFromAmount(0.8)).toBe(0);
  });

  it("returns 0 points for invalid or non-positive amount", () => {
    expect(calculatePointsFromAmount(0)).toBe(0);
    expect(calculatePointsFromAmount(-5)).toBe(0);
    expect(calculatePointsFromAmount(Number.NaN)).toBe(0);
  });

  it("updates points based on current points and amount", () => {
    expect(calculateUpdatedPoints(15, 50)).toBe(65);
  });

  it("builds purchase summary from amount and current points", () => {
    expect(getPurchaseSummary(15, 50.9)).toEqual({
      amount: 50.9,
      pointsEarned: 50,
      updatedPoints: 65,
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

describe("calculatePointsFromAmount – floor behavior", () => {
  it("floors 3.50 to 3 points", () => {
    expect(calculatePointsFromAmount(3.5)).toBe(3);
  });

  it("returns 10 for a whole-number amount of 10", () => {
    expect(calculatePointsFromAmount(10)).toBe(10);
  });

  it("floors 0.99 to 0 points", () => {
    expect(calculatePointsFromAmount(0.99)).toBe(0);
  });
});

describe("getPurchaseSummary – pointsEarned and updatedPoints", () => {
  it("returns pointsEarned = floor(amount)", () => {
    const { pointsEarned } = getPurchaseSummary(0, 3.5);
    expect(pointsEarned).toBe(3);
  });

  it("adds pointsEarned to currentPoints to produce updatedPoints", () => {
    const { updatedPoints } = getPurchaseSummary(100, 3.5);
    expect(updatedPoints).toBe(103);
  });

  it("updatedPoints stays unchanged when amount earns no points", () => {
    const { pointsEarned, updatedPoints } = getPurchaseSummary(50, 0.99);
    expect(pointsEarned).toBe(0);
    expect(updatedPoints).toBe(50);
  });

  it("accumulates correctly from a zero balance", () => {
    const { pointsEarned, updatedPoints } = getPurchaseSummary(0, 10);
    expect(pointsEarned).toBe(10);
    expect(updatedPoints).toBe(10);
  });
});
