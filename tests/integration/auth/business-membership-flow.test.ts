import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/auth/callback/route";
import { createServerAuthClient } from "@/lib/supabase/server";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-membership", () => ({
  getCurrentMembershipResolution: vi.fn(),
}));

const mockExchangeCodeForSession = vi.fn();
const mockVerifyOtp = vi.fn();
const mockGetUser = vi.fn();
const mockSignOut = vi.fn();

describe("Auth callback business membership flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(createServerAuthClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
        verifyOtp: mockVerifyOtp,
        getUser: mockGetUser,
        signOut: mockSignOut,
      },
    } as never);

    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
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
  });

  it("redirects to onboarding when user has no memberships", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "no-memberships",
      userId: "user-1",
      memberships: [],
      activeMembership: null,
    });

    const request = new Request(
      "http://localhost:3000/auth/callback?code=abc&next=/dashboard",
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/onboarding",
    );
  });

  it("redirects to select-business when user has multiple memberships", async () => {
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

    const request = new Request(
      "http://localhost:3000/auth/callback?code=abc&next=/dashboard",
    );
    const response = await GET(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/select-business",
    );
  });

  it("redirects to requested next path when user has exactly one membership", async () => {
    const request = new Request(
      "http://localhost:3000/auth/callback?code=abc&next=/dashboard/customers",
    );
    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(response.headers.get("location")).toBe(
      "http://localhost:3000/dashboard/customers",
    );
  });
});
