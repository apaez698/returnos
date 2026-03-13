import { describe, expect, it } from "vitest";
import { mapRewardCustomersToViewModel } from "@/features/rewards/utils/map-reward-customers-to-view-model";
import type { RewardRule } from "@/lib/rewards/types";

const REWARD_RULES: RewardRule[] = [
  {
    id: "rule-50",
    business_id: "biz-1",
    name: "Cafe",
    points_required: 50,
    reward_description: "Cafe gratis",
    is_active: true,
    created_at: "2026-03-10T00:00:00.000Z",
  },
  {
    id: "rule-100",
    business_id: "biz-1",
    name: "Combo",
    points_required: 100,
    reward_description: "Cafe y pan",
    is_active: true,
    created_at: "2026-03-10T00:00:00.000Z",
  },
];

describe("mapRewardCustomersToViewModel", () => {
  it("maps customers into the reward search view model", () => {
    const result = mapRewardCustomersToViewModel({
      customers: [
        {
          id: "cus-1",
          name: "Ana",
          phone: "555-1111",
          points: 120,
        },
      ],
      activeRewardRules: REWARD_RULES,
      redemptionsCountByCustomerId: { "cus-1": 1 },
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(
      expect.objectContaining({
        customer_id: "cus-1",
        customer_name: "Ana",
        customer_phone: "555-1111",
        current_points: 120,
        has_redeemed: true,
        is_eligible: true,
        reward_status: "redeemed",
        redeemable_reward_name: "Combo",
        next_reward_name: null,
      }),
    );
  });

  it("derives near_unlock when threshold is reached but still not eligible", () => {
    const result = mapRewardCustomersToViewModel({
      customers: [
        {
          id: "cus-near",
          name: "Luis",
          phone: null,
          points: 81,
        },
      ],
      activeRewardRules: [REWARD_RULES[1]],
      nearUnlockThresholdPercent: 80,
    });

    expect(result[0].is_eligible).toBe(false);
    expect(result[0].is_near_unlock).toBe(true);
    expect(result[0].reward_status).toBe("near_unlock");
  });

  it("uses safe defaults for missing names and negative points", () => {
    const result = mapRewardCustomersToViewModel({
      customers: [
        {
          id: "cus-unknown",
          name: "   ",
          phone: null,
          points: -10,
        },
      ],
      activeRewardRules: [],
    });

    expect(result[0].customer_name).toBe("Cliente desconocido");
    expect(result[0].current_points).toBe(0);
    expect(result[0].reward_status).toBe("inactive");
  });

  it("returns empty array for nullish customer input", () => {
    expect(
      mapRewardCustomersToViewModel({
        customers: null,
        activeRewardRules: REWARD_RULES,
      }),
    ).toEqual([]);

    expect(
      mapRewardCustomersToViewModel({
        customers: undefined,
        activeRewardRules: REWARD_RULES,
      }),
    ).toEqual([]);
  });
});
