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

function createSupabaseMock() {
  const customersBuilder = createCustomersBuilder([
    { id: "cus-redeemed", name: "Ana", phone: "111", points: 120 },
    { id: "cus-eligible", name: "Luis", phone: "222", points: 110 },
    { id: "cus-near", name: "Marta", phone: "333", points: 85 },
    { id: "cus-active", name: "Pablo", phone: "444", points: 10 },
    { id: "cus-inactive", name: "Nora", phone: "555", points: 0 },
  ]);

  const rewardRulesOrder = vi.fn().mockResolvedValue({
    data: [
      {
        id: "rule-100",
        business_id: BUSINESS_ID,
        name: "Combo",
        points_required: 100,
        reward_description: "Cafe y pan",
        is_active: true,
        created_at: "2026-03-12T00:00:00.000Z",
      },
    ],
    error: null,
  });
  const rewardRulesEqSecond = vi
    .fn()
    .mockReturnValue({ order: rewardRulesOrder });
  const rewardRulesEqFirst = vi
    .fn()
    .mockReturnValue({ eq: rewardRulesEqSecond });

  const redemptionsIn = vi.fn().mockResolvedValue({
    data: [{ customer_id: "cus-redeemed" }],
    error: null,
  });
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

  return { supabase: { from } };
}

describe("searchRewardCustomers status filters", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentBusinessId).mockResolvedValue(BUSINESS_ID);
  });

  it("returns only eligible customers when eligible filter is used", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      createSupabaseMock().supabase as never,
    );

    const result = await searchRewardCustomers({ status: "eligible" });

    expect(result.items.map((item) => item.customer_id)).toEqual([
      "cus-eligible",
    ]);
  });

  it("returns only redeemed customers when redeemed filter is used", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      createSupabaseMock().supabase as never,
    );

    const result = await searchRewardCustomers({ status: "redeemed" });

    expect(result.items.map((item) => item.customer_id)).toEqual([
      "cus-redeemed",
    ]);
  });

  it("returns only near_unlock customers when near_unlock filter is used", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      createSupabaseMock().supabase as never,
    );

    const result = await searchRewardCustomers({ status: "near_unlock" });

    expect(result.items.map((item) => item.customer_id)).toEqual(["cus-near"]);
  });

  it("returns all non-inactive statuses when active filter is used", async () => {
    vi.mocked(createServerClient).mockReturnValue(
      createSupabaseMock().supabase as never,
    );

    const result = await searchRewardCustomers({ status: "active" });

    expect(result.items.map((item) => item.customer_id)).toEqual([
      "cus-redeemed",
      "cus-eligible",
      "cus-near",
      "cus-active",
    ]);
  });
});
