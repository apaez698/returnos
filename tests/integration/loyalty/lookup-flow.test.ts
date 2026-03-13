import { beforeEach, describe, expect, it, vi } from "vitest";
import { lookupLoyaltyCardByPhoneAction } from "@/app/loyalty/lookup/actions";
import { initialLoyaltyLookupState } from "@/app/loyalty/lookup/state";
import { getLoyaltyCardByPhone } from "@/features/loyalty-card/queries/get-loyalty-card-by-phone";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { getBusinessBySlug } from "@/lib/businesses/queries";
import { redirect } from "next/navigation";

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("@/features/loyalty-card/queries/get-loyalty-card-by-phone", () => ({
  getLoyaltyCardByPhone: vi.fn(),
}));

vi.mock("@/lib/businesses/current-business", () => ({
  getCurrentBusinessId: vi.fn(),
}));

vi.mock("@/lib/businesses/queries", () => ({
  getBusinessBySlug: vi.fn(),
}));

function makeFormData(payload?: {
  phone?: string;
  businessId?: string;
  businessSlug?: string;
  redirectTo?: string;
}) {
  const formData = new FormData();
  formData.set("phone", payload?.phone ?? "+52 55 1111 2222");

  if (payload?.businessId) {
    formData.set("business_id", payload.businessId);
  }

  if (payload?.businessSlug) {
    formData.set("business_slug", payload.businessSlug);
  }

  if (payload?.redirectTo) {
    formData.set("redirect_to", payload.redirectTo);
  }

  return formData;
}

describe("Loyalty lookup by phone flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects to loyalty card page when customer exists", async () => {
    vi.mocked(getLoyaltyCardByPhone).mockResolvedValue({
      business: { id: "biz-1" },
      customer: { id: "cus-1", card_token: "tok_abc123" },
    } as never);

    await expect(
      lookupLoyaltyCardByPhoneAction(
        initialLoyaltyLookupState,
        makeFormData({ businessId: "biz-1" }),
      ),
    ).rejects.toThrow("NEXT_REDIRECT:/card/tok_abc123");

    expect(redirect).toHaveBeenCalledWith("/card/tok_abc123");
  });

  it("returns a friendly error when customer is not found", async () => {
    vi.mocked(getLoyaltyCardByPhone).mockResolvedValue(null);

    const result = await lookupLoyaltyCardByPhoneAction(
      initialLoyaltyLookupState,
      makeFormData({ businessId: "biz-1" }),
    );

    expect(result).toEqual({
      status: "not_found",
      message:
        "No encontramos una tarjeta con ese numero. Verifica los digitos e intenta de nuevo.",
    });
  });

  it("uses business slug scope when business_id is missing", async () => {
    vi.mocked(getBusinessBySlug).mockResolvedValue({
      id: "biz-from-slug",
      name: "Panaderia",
      slug: "panaderia-demo",
      business_type: "bakery",
      created_at: "2026-03-12T00:00:00Z",
    });
    vi.mocked(getLoyaltyCardByPhone).mockResolvedValue(null);

    await lookupLoyaltyCardByPhoneAction(
      initialLoyaltyLookupState,
      makeFormData({ businessSlug: "panaderia-demo" }),
    );

    expect(getBusinessBySlug).toHaveBeenCalledWith("panaderia-demo");
    expect(getLoyaltyCardByPhone).toHaveBeenCalledWith({
      businessId: "biz-from-slug",
      phone: "+525511112222",
    });
  });

  it("falls back to current authenticated business when no explicit scope is provided", async () => {
    vi.mocked(getCurrentBusinessId).mockResolvedValue("biz-current");
    vi.mocked(getLoyaltyCardByPhone).mockResolvedValue(null);

    await lookupLoyaltyCardByPhoneAction(
      initialLoyaltyLookupState,
      makeFormData(),
    );

    expect(getCurrentBusinessId).toHaveBeenCalledTimes(1);
    expect(getLoyaltyCardByPhone).toHaveBeenCalledWith({
      businessId: "biz-current",
      phone: "+525511112222",
    });
  });

  it("returns a scope error when business cannot be resolved", async () => {
    vi.mocked(getCurrentBusinessId).mockRejectedValue(new Error("missing"));

    const result = await lookupLoyaltyCardByPhoneAction(
      initialLoyaltyLookupState,
      makeFormData(),
    );

    expect(result.status).toBe("error");
    expect(result.message).toContain("No pudimos identificar el negocio");
    expect(getLoyaltyCardByPhone).not.toHaveBeenCalled();
  });
});
