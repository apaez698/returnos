import { describe, expect, it } from "vitest";
import { calculateProgress } from "@/lib/rewards/calculations";
import { CustomerPoints, RewardRule, RewardStatus } from "@/lib/rewards/types";

const buildRule = (
  id: string,
  pointsRequired: number,
  isActive = true,
): RewardRule => ({
  id,
  business_id: "business-1",
  name: `Reward ${pointsRequired}`,
  points_required: pointsRequired,
  reward_description: "Free item",
  is_active: isActive,
  created_at: "2026-03-11T00:00:00.000Z",
});

const buildCustomer = (points: number): CustomerPoints => ({
  customer_id: "customer-1",
  points,
});

describe("calculateProgress", () => {
  it("returns null when there are no active reward rules", () => {
    const result = calculateProgress(buildCustomer(50), [
      buildRule("r1", 100, false),
    ]);

    expect(result).toBeNull();
  });

  it("returns in_progress status when customer points are below threshold", () => {
    const result = calculateProgress(buildCustomer(40), [buildRule("r1", 100)]);

    expect(result).not.toBeNull();
    expect(result!.status).toBe(RewardStatus.in_progress);
    expect(result!.remaining_points).toBe(60);
    expect(result!.progress_percentage).toBe(40);
    expect(result!.reward.id).toBe("r1");
  });

  it("returns redeemable status when customer points meet threshold exactly", () => {
    const result = calculateProgress(buildCustomer(100), [
      buildRule("r1", 100),
    ]);

    expect(result!.status).toBe(RewardStatus.redeemable);
    expect(result!.remaining_points).toBe(0);
    expect(result!.progress_percentage).toBe(100);
  });

  it("returns redeemable status when customer points exceed threshold", () => {
    const result = calculateProgress(buildCustomer(150), [
      buildRule("r1", 100),
    ]);

    expect(result!.status).toBe(RewardStatus.redeemable);
    expect(result!.remaining_points).toBe(0);
    expect(result!.progress_percentage).toBe(100);
  });

  it("targets the nearest reachable rule when multiple rules exist", () => {
    const rules = [buildRule("r1", 100), buildRule("r2", 200)];
    const result = calculateProgress(buildCustomer(50), rules);

    expect(result!.reward.id).toBe("r1");
    expect(result!.status).toBe(RewardStatus.in_progress);
    expect(result!.remaining_points).toBe(50);
  });

  it("targets the highest rule when all thresholds are already exceeded", () => {
    const rules = [buildRule("r1", 100), buildRule("r2", 200)];
    const result = calculateProgress(buildCustomer(300), rules);

    expect(result!.reward.id).toBe("r2");
    expect(result!.status).toBe(RewardStatus.redeemable);
  });

  it("ignores inactive rules", () => {
    const rules = [buildRule("r1", 50, false), buildRule("r2", 200)];
    const result = calculateProgress(buildCustomer(100), rules);

    expect(result!.reward.id).toBe("r2");
    expect(result!.status).toBe(RewardStatus.in_progress);
    expect(result!.remaining_points).toBe(100);
  });
});
