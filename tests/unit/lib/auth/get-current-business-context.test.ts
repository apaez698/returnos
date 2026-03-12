import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentBusinessContext } from "@/lib/auth/get-current-business-context";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

vi.mock("@/lib/auth/get-current-membership", () => ({
  getCurrentMembershipResolution: vi.fn(),
}));

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const MOCK_BUSINESS = {
  id: "biz-1",
  name: "Panadería La Esperanza",
  slug: "panaderia-la-esperanza",
  business_type: "bakery" as const,
  created_at: "2025-01-01T00:00:00Z",
};

const MOCK_MEMBERSHIP = {
  businessId: "biz-1",
  role: "owner" as const,
  business: MOCK_BUSINESS,
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("getCurrentBusinessContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns BusinessContext when user has exactly one membership", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [MOCK_MEMBERSHIP],
      activeMembership: MOCK_MEMBERSHIP,
    });

    const result = await getCurrentBusinessContext();

    expect(result).toEqual({
      businessId: "biz-1",
      role: "owner",
      business: MOCK_BUSINESS,
    });
  });

  it("returns null when user is unauthenticated", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "unauthenticated",
      userId: null,
      memberships: [],
      activeMembership: null,
    });

    const result = await getCurrentBusinessContext();

    expect(result).toBeNull();
  });

  it("returns null when user has no memberships", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "no-memberships",
      userId: "user-1",
      memberships: [],
      activeMembership: null,
    });

    const result = await getCurrentBusinessContext();

    expect(result).toBeNull();
  });

  it("returns null when user belongs to multiple businesses", async () => {
    const secondMembership = {
      ...MOCK_MEMBERSHIP,
      businessId: "biz-2",
      business: { ...MOCK_BUSINESS, id: "biz-2" },
    };

    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "multiple-memberships",
      userId: "user-1",
      memberships: [MOCK_MEMBERSHIP, secondMembership],
      activeMembership: null,
    });

    const result = await getCurrentBusinessContext();

    expect(result).toBeNull();
  });

  it("preserves the role from the active membership", async () => {
    const staffMembership = { ...MOCK_MEMBERSHIP, role: "staff" as const };

    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [staffMembership],
      activeMembership: staffMembership,
    });

    const result = await getCurrentBusinessContext();

    expect(result?.role).toBe("staff");
  });

  it("preserves the full business record from the active membership", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [MOCK_MEMBERSHIP],
      activeMembership: MOCK_MEMBERSHIP,
    });

    const result = await getCurrentBusinessContext();

    expect(result?.business).toEqual(MOCK_BUSINESS);
    expect(result?.businessId).toBe("biz-1");
  });
});
