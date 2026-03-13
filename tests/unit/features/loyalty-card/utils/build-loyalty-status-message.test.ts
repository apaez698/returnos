import { describe, expect, it } from "vitest";
import { buildLoyaltyStatusMessage } from "@/features/loyalty-card/utils/build-loyalty-status-message";

describe("buildLoyaltyStatusMessage", () => {
  it("returns remaining-points message using reward description", () => {
    const result = buildLoyaltyStatusMessage(42, {
      points_required: 50,
      reward_description: "free coffee",
      name: "Coffee Reward",
    });

    expect(result).toBe("You need 8 more points for your next free coffee");
  });

  it("returns ready-to-redeem message when threshold is reached", () => {
    const result = buildLoyaltyStatusMessage(50, {
      points_required: 50,
      reward_description: "free coffee",
    });

    expect(result).toBe("Your reward is ready to redeem");
  });

  it("handles singular point text", () => {
    const result = buildLoyaltyStatusMessage(49, {
      points_required: 50,
      reward_description: "coffee",
    });

    expect(result).toBe("You need 1 more point for your next coffee");
  });

  it("falls back to reward name when description is empty", () => {
    const result = buildLoyaltyStatusMessage(10, {
      points_required: 20,
      reward_description: "   ",
      name: "Pastry",
    });

    expect(result).toBe("You need 10 more points for your next Pastry");
  });

  it("falls back to generic reward text when no label is present", () => {
    const result = buildLoyaltyStatusMessage(10, {
      points_required: 20,
      reward_description: "",
      name: "",
    });

    expect(result).toBe("You need 10 more points for your next reward");
  });

  it("returns no-reward message for missing or invalid rule", () => {
    expect(buildLoyaltyStatusMessage(10, null)).toBe(
      "No rewards are available yet",
    );

    expect(
      buildLoyaltyStatusMessage(10, {
        points_required: 0,
        reward_description: "free coffee",
      }),
    ).toBe("No rewards are available yet");
  });

  it("treats invalid current points as zero", () => {
    const result = buildLoyaltyStatusMessage(Number.NaN, {
      points_required: 10,
      reward_description: "cookie",
    });

    expect(result).toBe("You need 10 more points for your next cookie");
  });
});
