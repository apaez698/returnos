import { calculateUpdatedCustomerPoints } from "@/lib/visits/points";
import { describe, expect, it } from "vitest";

describe("calculateUpdatedCustomerPoints", () => {
  it("adds zero points", () => {
    expect(calculateUpdatedCustomerPoints(10, 0)).toBe(10);
  });

  it("adds positive points", () => {
    expect(calculateUpdatedCustomerPoints(10, 25)).toBe(35);
  });

  it("keeps current points unchanged when earned is zero", () => {
    const currentPoints = 42;

    expect(calculateUpdatedCustomerPoints(currentPoints, 0)).toBe(
      currentPoints,
    );
  });
});
