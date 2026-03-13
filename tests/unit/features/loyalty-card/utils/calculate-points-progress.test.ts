import { describe, expect, it } from "vitest";
import { calculatePointsProgress } from "@/features/loyalty-card/utils/calculate-points-progress";

describe("calculatePointsProgress", () => {
  it("returns 0 when target points are null, undefined, or invalid", () => {
    expect(calculatePointsProgress(20, null)).toBe(0);
    expect(calculatePointsProgress(20, undefined)).toBe(0);
    expect(calculatePointsProgress(20, 0)).toBe(0);
    expect(calculatePointsProgress(20, -10)).toBe(0);
    expect(calculatePointsProgress(20, Number.NaN)).toBe(0);
  });

  it("calculates and rounds progress percentage", () => {
    expect(calculatePointsProgress(3, 8)).toBe(38);
    expect(calculatePointsProgress(15, 40)).toBe(38);
  });

  it("clamps progress between 0 and 100", () => {
    expect(calculatePointsProgress(-5, 10)).toBe(0);
    expect(calculatePointsProgress(120, 100)).toBe(100);
  });

  it("treats non-finite current points as zero", () => {
    expect(calculatePointsProgress(Number.NaN, 10)).toBe(0);
    expect(calculatePointsProgress(Number.POSITIVE_INFINITY, 10)).toBe(0);
  });
});
