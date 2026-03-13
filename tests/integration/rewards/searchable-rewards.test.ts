import { beforeEach, describe, expect, it, vi } from "vitest";
import { searchRewardCustomers } from "@/features/rewards/queries/search-reward-customers";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";

vi.mock("@/lib/businesses/current-business", () => ({
  getCurrentBusinessId: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

const BUSINESS_ID = "biz-1";

function createCustomersBuilder(customers: unknown[]) {
  const response = { data: customers, error: null };
  const promise = Promise.resolve(response);

  const builder = {
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    then: promise.then.bind(promise),
    catch: promise.catch.bind(promise),
    finally: promise.finally.bind(promise),
  };

  return builder;
}

function createSupabaseMock(params: {
  customers: unknown[];
  rewardRules: unknown[];
  redemptions: Array<{ customer_id: string }>;
}) {
  const customersBuilder = createCustomersBuilder(params.customers);

  const rewardRulesOrder = vi
    .fn()
    .mockResolvedValue({ data: params.rewardRules, error: null });
  const rewardRulesEqSecond = vi
    .fn()
    .mockReturnValue({ order: rewardRulesOrder });
  const rewardRulesEqFirst = vi
    .fn()
    .mockReturnValue({ eq: rewardRulesEqSecond });

  const redemptionsIn = vi
    .fn()
    .mockResolvedValue({ data: params.redemptions, error: null });
  const redemptionsEq = vi.fn().mockReturnValue({ in: redemptionsIn });

  const from = vi.fn((table: string) => {
    if (table === "customers") {
      return {
        select: vi.fn().mockReturnValue(customersBuilder),
      };
    }

    if (table === "reward_rules") {
      return {
        select: vi.fn().mockReturnValue({ eq: rewardRulesEqFirst }),
      };
    }

    if (table === "reward_redemptions") {
      return {
        select: vi.fn().mockReturnValue({ eq: redemptionsEq }),
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return {
    supabase: { from },
    customersBuilder,
    rewardRulesEqFirst,
    rewardRulesEqSecond,
    redemptionsEq,
    redemptionsIn,
  };
}

describe("searchRewardCustomers integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentBusinessId).mockResolvedValue(BUSINESS_ID);
  });

  it("searches by name or phone and maps customer results", async () => {
    const mock = createSupabaseMock({
      customers: [{ id: "cus-1", name: "Ana", phone: "555-1111", points: 85 }],
      rewardRules: [
        {
          id: "rule-1",
          business_id: BUSINESS_ID,
          name: "Cafe",
          points_required: 100,
          reward_description: "Cafe gratis",
          is_active: true,
          created_at: "2026-03-12T00:00:00.000Z",
        },
      ],
      redemptions: [],
    });

    vi.mocked(createServerClient).mockReturnValue(mock.supabase as never);

    const result = await searchRewardCustomers({ query: "555" });

    expect(mock.customersBuilder.or).toHaveBeenCalledWith(
      "name.ilike.%555%,phone.ilike.%555%",
    );
    expect(result.total_count).toBe(1);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        customer_id: "cus-1",
        customer_name: "Ana",
        customer_phone: "555-1111",
        reward_status: "near_unlock",
      }),
    );
  });

  it("scopes all reads to active business id", async () => {
    const mock = createSupabaseMock({
      customers: [{ id: "cus-1", name: "Ana", phone: "555", points: 10 }],
      rewardRules: [],
      redemptions: [],
    });

    vi.mocked(createServerClient).mockReturnValue(mock.supabase as never);

    await searchRewardCustomers();

    expect(mock.customersBuilder.eq).toHaveBeenCalledWith(
      "business_id",
      BUSINESS_ID,
    );
    expect(mock.rewardRulesEqFirst).toHaveBeenCalledWith(
      "business_id",
      BUSINESS_ID,
    );
    expect(mock.redemptionsEq).toHaveBeenCalledWith("business_id", BUSINESS_ID);
  });

  it("escapes query for LIKE pattern", async () => {
    const mock = createSupabaseMock({
      customers: [{ id: "cus-1", name: "Ana", phone: "555", points: 10 }],
      rewardRules: [],
      redemptions: [],
    });

    vi.mocked(createServerClient).mockReturnValue(mock.supabase as never);

    await searchRewardCustomers({ query: "ana%_" });

    expect(mock.customersBuilder.or).toHaveBeenCalledWith(
      "name.ilike.%ana\\%\\_%,phone.ilike.%ana\\%\\_%",
    );
  });
});
