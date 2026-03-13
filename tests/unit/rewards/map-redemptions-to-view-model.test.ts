import { describe, expect, it } from "vitest";
import {
  mapRedemptionToViewModel,
  mapRedemptionsToViewModel,
  RawRedemptionRow,
} from "@/lib/rewards/map-redemptions-to-view-model";

function buildBaseRow(
  overrides: Partial<RawRedemptionRow> = {},
): RawRedemptionRow {
  return {
    id: "red-1",
    customer_id: "cus-1",
    reward_rule_id: "rule-1",
    points_spent: 120,
    redeemed_at: "2026-03-12T18:45:00.000Z",
    created_at: "2026-03-12T18:40:00.000Z",
    customers: {
      name: "Ana",
      phone: "+52 555 000 1111",
    },
    reward_rules: {
      id: "rule-1",
      name: "Café gratis",
      reward_description: "1 pieza",
    },
    ...overrides,
  };
}

describe("mapRedemptionToViewModel", () => {
  it("maps a standard joined row", () => {
    const result = mapRedemptionToViewModel(buildBaseRow());

    expect(result).toEqual({
      id: "red-1",
      customer_id: "cus-1",
      customer_name: "Ana",
      customer_phone: "+52 555 000 1111",
      reward_id: "rule-1",
      reward_name: "Café gratis",
      reward_description: "1 pieza",
      points_spent: 120,
      redeemed_at: "2026-03-12T18:45:00.000Z",
      created_at: "2026-03-12T18:40:00.000Z",
    });
  });

  it("supports relation arrays returned by Supabase", () => {
    const result = mapRedemptionToViewModel(
      buildBaseRow({
        customers: [{ name: "Luis", phone: null }],
        reward_rules: [
          {
            id: "rule-2",
            name: "Pan dulce",
            reward_description: "2 piezas",
          },
        ],
        reward_rule_id: undefined,
      }),
    );

    expect(result.customer_name).toBe("Luis");
    expect(result.customer_phone).toBeNull();
    expect(result.reward_id).toBe("rule-2");
    expect(result.reward_name).toBe("Pan dulce");
    expect(result.reward_description).toBe("2 piezas");
  });

  it("applies safe defaults when relations are missing", () => {
    const result = mapRedemptionToViewModel(
      buildBaseRow({
        id: null,
        customer_id: null,
        reward_rule_id: null,
        points_spent: Number.NaN,
        redeemed_at: null,
        created_at: null,
        customers: null,
        reward_rules: null,
      }),
    );

    expect(result.id).toBe("");
    expect(result.customer_id).toBe("");
    expect(result.customer_name).toBe("Desconocido");
    expect(result.customer_phone).toBeNull();
    expect(result.reward_id).toBe("");
    expect(result.reward_name).toBe("Recompensa no disponible");
    expect(result.reward_description).toBe("");
    expect(result.points_spent).toBe(0);
    expect(result.redeemed_at).toBe("");
    expect(result.created_at).toBe("");
  });

  it("falls back to defaults when relation arrays are empty", () => {
    const result = mapRedemptionToViewModel(
      buildBaseRow({
        customers: [],
        reward_rules: [],
      }),
    );

    expect(result.customer_name).toBe("Desconocido");
    expect(result.customer_phone).toBeNull();
    expect(result.reward_name).toBe("Recompensa no disponible");
    expect(result.reward_description).toBe("");
  });

  it("prefers reward_rule_id from row over relation id", () => {
    const result = mapRedemptionToViewModel(
      buildBaseRow({
        reward_rule_id: "rule-from-row",
        reward_rules: {
          id: "rule-from-relation",
          name: "Reward",
          reward_description: null,
        },
      }),
    );

    expect(result.reward_id).toBe("rule-from-row");
  });
});

describe("mapRedemptionsToViewModel", () => {
  it("maps an array of rows", () => {
    const result = mapRedemptionsToViewModel([
      buildBaseRow({ id: "red-1" }),
      buildBaseRow({ id: "red-2" }),
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("red-1");
    expect(result[1].id).toBe("red-2");
  });

  it("returns an empty array for nullish input", () => {
    expect(mapRedemptionsToViewModel(undefined)).toEqual([]);
    expect(mapRedemptionsToViewModel(null)).toEqual([]);
  });
});
