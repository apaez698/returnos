import { describe, expect, it } from "vitest";
import { calculatePointsEarned } from "@/features/loyalty/calculations/calculate-points-earned";
import {
  createAmountPerPointRule,
  DEFAULT_POINTS_RULE,
} from "@/features/loyalty/types/points-rules";

describe("calculatePointsEarned", () => {
  it("applies the cents-aware default rule: 1 point per $0.10", () => {
    expect(calculatePointsEarned(0.1)).toBe(1);
    expect(calculatePointsEarned(1)).toBe(10);
    expect(calculatePointsEarned(12.34)).toBe(123);
  });

  it("returns an integer using floor for decimal edge cases", () => {
    expect(calculatePointsEarned(0.19)).toBe(1);
    expect(calculatePointsEarned(0.29)).toBe(2);
    expect(calculatePointsEarned(9.99)).toBe(99);
  });

  it("does not lose points due to floating-point precision drift", () => {
    expect(calculatePointsEarned(50.9)).toBe(509);
  });

  it("returns 0 for invalid or non-positive amounts", () => {
    expect(calculatePointsEarned(0)).toBe(0);
    expect(calculatePointsEarned(-5)).toBe(0);
    expect(calculatePointsEarned(Number.NaN)).toBe(0);
    expect(calculatePointsEarned(Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("supports swapping rules without changing calculator consumers", () => {
    const onePointPerDollar = createAmountPerPointRule({
      id: "points-per-dollar-v1",
      description: "1 point per $1.00 spent",
      amountPerPoint: 1,
    });

    expect(calculatePointsEarned(12.34, onePointPerDollar)).toBe(12);
    expect(calculatePointsEarned(12.34, DEFAULT_POINTS_RULE)).toBe(123);
  });

  it("fails safe when a custom rule returns invalid values", () => {
    const invalidRule = {
      id: "invalid-rule",
      description: "Broken rule",
      calculate: () => Number.NaN,
    };

    expect(calculatePointsEarned(10, invalidRule)).toBe(0);
  });
});
