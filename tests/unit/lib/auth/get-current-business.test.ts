import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentBusiness } from "@/lib/auth/get-current-business";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

vi.mock("@/lib/auth/get-current-membership", () => ({
  getCurrentMembershipResolution: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_BUSINESS = {
  id: "biz-1",
  name: "Panadería La Esperanza",
  slug: "panaderia-la-esperanza",
  business_type: "bakery" as const,
  created_at: "2025-01-01T00:00:00Z",
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getCurrentBusiness", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns business when resolution has exactly one membership", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [
        {
          businessId: "biz-1",
          role: "owner",
          business: MOCK_BUSINESS,
        },
      ],
      activeMembership: {
        businessId: "biz-1",
        role: "owner",
        business: MOCK_BUSINESS,
      },
    });

    const result = await getCurrentBusiness();

    expect(result).toEqual(MOCK_BUSINESS);
  });

  it("returns null when user has no memberships", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "no-memberships",
      userId: "user-1",
      memberships: [],
      activeMembership: null,
    });

    const result = await getCurrentBusiness();

    expect(result).toBeNull();
  });

  it("returns null when user has multiple memberships", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "multiple-memberships",
      userId: "user-1",
      memberships: [
        {
          businessId: "biz-1",
          role: "owner",
          business: MOCK_BUSINESS,
        },
        {
          businessId: "biz-2",
          role: "staff",
          business: {
            ...MOCK_BUSINESS,
            id: "biz-2",
            name: "Panadería Centro",
            slug: "panaderia-centro",
          },
        },
      ],
      activeMembership: null,
    });

    const result = await getCurrentBusiness();

    expect(result).toBeNull();
  });

  it("returns null when user is unauthenticated", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "unauthenticated",
      userId: null,
      memberships: [],
      activeMembership: null,
    });

    const result = await getCurrentBusiness();

    expect(result).toBeNull();
  });

  it("returns the business name and type for display in the shell", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [
        {
          businessId: "biz-1",
          role: "owner",
          business: MOCK_BUSINESS,
        },
      ],
      activeMembership: {
        businessId: "biz-1",
        role: "owner",
        business: MOCK_BUSINESS,
      },
    });

    const result = await getCurrentBusiness();

    expect(result?.name).toBe("Panadería La Esperanza");
    expect(result?.business_type).toBe("bakery");
  });
});
