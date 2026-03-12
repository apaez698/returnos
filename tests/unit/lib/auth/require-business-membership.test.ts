import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireBusinessMembership } from "@/lib/auth/require-business-membership";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { redirect } from "next/navigation";

vi.mock("@/lib/auth/get-current-membership", () => ({
  getCurrentMembershipResolution: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

describe("requireBusinessMembership", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns active membership when exactly one membership exists", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [
        {
          businessId: "biz-1",
          role: "owner",
          business: {
            id: "biz-1",
            name: "Panadería La Esperanza",
            slug: "panaderia-la-esperanza",
            business_type: "bakery",
            created_at: "2025-01-01T00:00:00Z",
          },
        },
      ],
      activeMembership: {
        businessId: "biz-1",
        role: "owner",
        business: {
          id: "biz-1",
          name: "Panadería La Esperanza",
          slug: "panaderia-la-esperanza",
          business_type: "bakery",
          created_at: "2025-01-01T00:00:00Z",
        },
      },
    });

    const result = await requireBusinessMembership();

    expect(result.businessId).toBe("biz-1");
    expect(redirect).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated users to /login", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "unauthenticated",
      userId: null,
      memberships: [],
      activeMembership: null,
    });

    await expect(requireBusinessMembership()).rejects.toThrow(
      "NEXT_REDIRECT:/login",
    );
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects users without memberships to /onboarding", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "no-memberships",
      userId: "user-1",
      memberships: [],
      activeMembership: null,
    });

    await expect(requireBusinessMembership()).rejects.toThrow(
      "NEXT_REDIRECT:/onboarding",
    );
    expect(redirect).toHaveBeenCalledWith("/onboarding");
  });

  it("redirects users with multiple memberships to /select-business", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "multiple-memberships",
      userId: "user-1",
      memberships: [
        {
          businessId: "biz-1",
          role: "owner",
          business: {
            id: "biz-1",
            name: "Panadería La Esperanza",
            slug: "panaderia-la-esperanza",
            business_type: "bakery",
            created_at: "2025-01-01T00:00:00Z",
          },
        },
        {
          businessId: "biz-2",
          role: "staff",
          business: {
            id: "biz-2",
            name: "Café Centro",
            slug: "cafe-centro",
            business_type: "restaurant",
            created_at: "2025-02-01T00:00:00Z",
          },
        },
      ],
      activeMembership: null,
    });

    await expect(requireBusinessMembership()).rejects.toThrow(
      "NEXT_REDIRECT:/select-business",
    );
    expect(redirect).toHaveBeenCalledWith("/select-business");
  });
});
