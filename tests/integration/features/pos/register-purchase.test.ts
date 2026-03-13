/**
 * Integration tests: Purchase Registration Flow
 *
 * Covers the full `registerPosPurchaseAction` path using fixtures drawn
 * from the bakery demo dataset.  Supabase and Next.js cache are mocked at
 * the module level; pure calculation helpers are exercised directly.
 *
 * Scenarios
 *  1. Find customer by name / phone   (pure helper, demo roster)
 *  2. Normal purchase                 (visit created, points recalculated, no reward unlock)
 *  3. Reward unlock                   (threshold crossed → unlocked reward returned)
 *  4. Invalid purchase amount         (Zod validation, no DB writes)
 *  5. Unknown customer                (DB returns null, no visit inserted)
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { registerPosPurchaseAction } from "@/app/dashboard/caja/actions";
import { searchCustomersByNameOrPhone } from "@/lib/pos/calculations";
import { demoCustomers, demoRewardRules } from "@/lib/bakery-demo";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { createServerClient } from "@/lib/supabase/server";
import type { PosPurchaseActionState } from "@/lib/pos/types";

// ─── Module mocks ─────────────────────────────────────────────────────────────
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

vi.mock("@/lib/businesses/current-business", () => ({
  getCurrentBusinessId: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

// ─── Constants ────────────────────────────────────────────────────────────────
const BUSINESS_ID = "demo-biz-001";
const INITIAL_STATE: PosPurchaseActionState = { status: "idle" };

// ─── Bakery demo fixtures ─────────────────────────────────────────────────────
// Pablo Reyes López – 95 pts; a 30-MXN purchase earns 300 pts → 395 pts total.
// 395 pts crosses active thresholds up to 300 pts, so the highest newly unlocked reward is returned.
const pabloReyes = demoCustomers.find((c) => c.name === "Pablo Reyes López")!;

// Sofia González Ruiz – 78 pts; an 80-MXN purchase earns 800 pts → 878 pts total.
// 878 pts crosses active thresholds up to 300 pts, so the highest newly unlocked reward is returned.
const sofiaGonzalez = demoCustomers.find(
  (c) => c.name === "Sofia González Ruiz",
)!;

// Only the three active rules: Pastry Reward (50), Coffee & Pastry Combo (150),
// Premium Gift Card (300).  VIP Experience (500) is inactive and must be excluded.
const activeRewardRules = demoRewardRules.filter((r) => r.is_active);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function makeFormData(customerId: string, amount: string): FormData {
  const fd = new FormData();
  fd.append("customer_id", customerId);
  fd.append("amount", amount);
  return fd;
}

/**
 * Build two Supabase client mocks that reflect the execution order inside
 * `registerPosPurchaseAction`:
 *
 *   supabase1 (first createServerClient() call in the action body):
 *     from("customers") → SELECT … maybeSingle()
 *     from("visits")    → INSERT
 *     from("customers") → UPDATE … eq().eq()
 *
 *   supabase2 (second createServerClient() call inside
 *              getActiveRewardThresholdsForCurrentBusiness):
 *     from("reward_rules") → SELECT … order()
 *
 * Returns the two client mocks together with granular spy references so
 * tests can assert on exact arguments passed to DB write operations.
 */
function buildSupabaseMocks(opts: {
  customer: { id: string; name: string; points: number } | null;
  customerSelectError?: { message: string } | null;
  visitInsertError?: { message: string } | null;
  customerUpdateError?: { message: string } | null;
  rewardRules?: typeof activeRewardRules;
  rewardRulesError?: { message: string } | null;
}) {
  const insertMock = vi
    .fn()
    .mockResolvedValue({ error: opts.visitInsertError ?? null });

  const customerUpdateFn = vi.fn().mockReturnValue({
    eq: vi.fn().mockReturnValue({
      eq: vi
        .fn()
        .mockResolvedValue({ error: opts.customerUpdateError ?? null }),
    }),
  });

  const supabase1 = {
    from: vi
      .fn()
      // Call 1 – customers SELECT
      .mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              limit: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                  data: opts.customer,
                  error: opts.customerSelectError ?? null,
                }),
              }),
            }),
          }),
        }),
      })
      // Call 2 – visits INSERT
      .mockReturnValueOnce({ insert: insertMock })
      // Call 3 – customers UPDATE
      .mockReturnValueOnce({ update: customerUpdateFn }),
  };

  const supabase2 = {
    from: vi.fn().mockReturnValueOnce({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            order: vi.fn().mockResolvedValue({
              data: opts.rewardRules ?? activeRewardRules,
              error: opts.rewardRulesError ?? null,
            }),
          }),
        }),
      }),
    }),
  };

  return { supabase1, supabase2, insertMock, customerUpdateFn };
}

// ─── Tests ────────────────────────────────────────────────────────────────────
describe("Purchase Registration Flow – bakery demo dataset", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getCurrentBusinessId).mockResolvedValue(BUSINESS_ID);
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Step 1 – Find customer by name or phone (pure helper)", () => {
    it("finds María García López by name fragment", () => {
      const results = searchCustomersByNameOrPhone(demoCustomers, "García");
      const names = results.map((c) => c.name);
      expect(names).toContain("María García López");
    });

    it("finds Pablo Reyes by exact phone number", () => {
      const results = searchCustomersByNameOrPhone(
        demoCustomers,
        pabloReyes.phone,
      );
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe("Pablo Reyes López");
    });

    it("finds Sofia González by phone partial match", () => {
      const partial = sofiaGonzalez.phone.slice(-6);
      const results = searchCustomersByNameOrPhone(demoCustomers, partial);
      expect(results.some((c) => c.name === "Sofia González Ruiz")).toBe(true);
    });

    it("returns an empty array for a query that matches no customer", () => {
      const results = searchCustomersByNameOrPhone(
        demoCustomers,
        "zzz-nobody-here",
      );
      expect(results).toHaveLength(0);
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Normal purchase – Pablo Reyes (95 pts, buys 30 MXN)", () => {
    let mocks: ReturnType<typeof buildSupabaseMocks>;

    beforeEach(() => {
      mocks = buildSupabaseMocks({
        customer: {
          id: pabloReyes.id,
          name: pabloReyes.name,
          points: pabloReyes.points,
        },
      });
      vi.mocked(createServerClient)
        .mockReturnValueOnce(mocks.supabase1 as never)
        .mockReturnValueOnce(mocks.supabase2 as never);
    });

    it("returns status 'success'", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      expect(result.status).toBe("success");
    });

    it("reports pointsEarned = floor(30 * 10) = 300", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      expect(result.receipt?.pointsEarned).toBe(300);
    });

    it("reports updatedPoints = 95 + 300 = 395", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      expect(result.receipt?.updatedPoints).toBe(395);
    });

    it("reports the highest newly unlocked reward when crossing multiple thresholds", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      expect(result.receipt?.unlockedRewardName).toBe("Premium Gift Card");
    });

    it("writes a visit record with correct fields", async () => {
      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      expect(mocks.insertMock).toHaveBeenCalledOnce();
      expect(mocks.insertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          business_id: BUSINESS_ID,
          customer_id: pabloReyes.id,
          points_earned: 300,
          amount: 30,
          source: "in_store",
        }),
      );
    });

    it("updates the customer's loyalty balance to 395 pts", async () => {
      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      expect(mocks.customerUpdateFn).toHaveBeenCalledOnce();
      expect(mocks.customerUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({
          points: 395,
          last_visit_at: expect.any(String),
        }),
      );
    });

    it("executes DB calls in the expected order: customers→visits→customers→reward_rules", async () => {
      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "30"),
      );
      const tables = mocks.supabase1.from.mock.calls.map((c) => c[0]);
      expect(tables).toEqual(["customers", "visits", "customers"]);
      const rewardTable = mocks.supabase2.from.mock.calls[0][0];
      expect(rewardTable).toBe("reward_rules");
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Reward unlock – Sofia González (78 pts, buys 80 MXN)", () => {
    // 78 + 800 = 878 pts  →  crosses active thresholds up to 300-pt "Premium Gift Card"
    let mocks: ReturnType<typeof buildSupabaseMocks>;

    beforeEach(() => {
      mocks = buildSupabaseMocks({
        customer: {
          id: sofiaGonzalez.id,
          name: sofiaGonzalez.name,
          points: sofiaGonzalez.points,
        },
      });
      vi.mocked(createServerClient)
        .mockReturnValueOnce(mocks.supabase1 as never)
        .mockReturnValueOnce(mocks.supabase2 as never);
    });

    it("returns status 'success'", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(sofiaGonzalez.id, "80"),
      );
      expect(result.status).toBe("success");
    });

    it("reports updatedPoints = 78 + 800 = 878", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(sofiaGonzalez.id, "80"),
      );
      expect(result.receipt?.updatedPoints).toBe(878);
    });

    it("reports the unlocked reward 'Premium Gift Card'", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(sofiaGonzalez.id, "80"),
      );
      expect(result.receipt?.unlockedRewardName).toBe("Premium Gift Card");
    });

    it("does not unlock the inactive VIP Experience rule (500 pts, inactive)", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(sofiaGonzalez.id, "80"),
      );
      expect(result.receipt?.unlockedRewardName).not.toBe("VIP Experience");
    });

    it("writes a visit with points_earned = 800", async () => {
      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(sofiaGonzalez.id, "80"),
      );
      expect(mocks.insertMock).toHaveBeenCalledWith(
        expect.objectContaining({ points_earned: 800 }),
      );
    });

    it("updates the customer's loyalty balance to 878 pts", async () => {
      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(sofiaGonzalez.id, "80"),
      );
      expect(mocks.customerUpdateFn).toHaveBeenCalledWith(
        expect.objectContaining({ points: 878 }),
      );
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Invalid purchase amount", () => {
    it("rejects amount = 0 with a field validation error", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "0"),
      );
      expect(result.status).toBe("error");
      expect(result.fieldErrors?.amount).toBeDefined();
    });

    it("rejects a negative amount with a field validation error", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "-10"),
      );
      expect(result.status).toBe("error");
      expect(result.fieldErrors?.amount).toBeDefined();
    });

    it("rejects a non-numeric amount string with a field validation error", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "abc"),
      );
      expect(result.status).toBe("error");
      expect(result.fieldErrors?.amount).toBeDefined();
    });

    it("never calls createServerClient when amount validation fails", async () => {
      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "0"),
      );
      expect(createServerClient).not.toHaveBeenCalled();
    });

    it("does not report a success message when amount is invalid", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData(pabloReyes.id, "-5"),
      );
      expect(result.receipt).toBeUndefined();
    });
  });

  // ───────────────────────────────────────────────────────────────────────────
  describe("Unknown customer", () => {
    it("returns an error when the customer ID is not found in the database", async () => {
      const { supabase1 } = buildSupabaseMocks({ customer: null });
      vi.mocked(createServerClient).mockReturnValueOnce(supabase1 as never);

      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData("nonexistent-customer-uuid", "50"),
      );

      expect(result.status).toBe("error");
      expect(result.message).toMatch(/cliente/i);
    });

    it("returns a field validation error when customer_id is empty", async () => {
      const result = await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData("", "50"),
      );
      expect(result.status).toBe("error");
      expect(result.fieldErrors?.customer_id).toBeDefined();
    });

    it("does not insert a visit when the customer is not found", async () => {
      const { supabase1, insertMock } = buildSupabaseMocks({ customer: null });
      vi.mocked(createServerClient).mockReturnValueOnce(supabase1 as never);

      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData("ghost-customer-0001", "50"),
      );

      expect(insertMock).not.toHaveBeenCalled();
    });

    it("does not update customer points when the customer is not found", async () => {
      const { supabase1, customerUpdateFn } = buildSupabaseMocks({
        customer: null,
      });
      vi.mocked(createServerClient).mockReturnValueOnce(supabase1 as never);

      await registerPosPurchaseAction(
        INITIAL_STATE,
        makeFormData("ghost-customer-0002", "50"),
      );

      expect(customerUpdateFn).not.toHaveBeenCalled();
    });
  });
});
