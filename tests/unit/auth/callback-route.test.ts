import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "@/app/auth/callback/route";
import { createServerAuthClient } from "@/lib/supabase/server";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

const mockExchangeCodeForSession = vi.fn();
const mockVerifyOtp = vi.fn();
const mockGetUser = vi.fn();
const mockSignOut = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-membership", () => ({
  getCurrentMembershipResolution: vi.fn(),
}));

describe("auth callback route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockExchangeCodeForSession.mockResolvedValue({ error: null });
    mockVerifyOtp.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: "user-1",
          email: "owner@bakery.com",
        },
      },
    });
    mockSignOut.mockResolvedValue({ error: null });

    vi.mocked(createServerAuthClient).mockResolvedValue({
      auth: {
        exchangeCodeForSession: mockExchangeCodeForSession,
        verifyOtp: mockVerifyOtp,
        getUser: mockGetUser,
        signOut: mockSignOut,
      },
    } as never);

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

  it("exchanges PKCE code and redirects to dashboard by default", async () => {
    const request = new Request(
      "https://returnos.app/auth/callback?code=abc123",
    );

    const response = await GET(request);

    expect(mockExchangeCodeForSession).toHaveBeenCalledWith("abc123");
    expect(mockVerifyOtp).not.toHaveBeenCalled();
    expect(getCurrentMembershipResolution).toHaveBeenCalledTimes(1);
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://returnos.app/dashboard",
    );
  });

  it("verifies OTP flow and redirects to provided next path", async () => {
    const request = new Request(
      "https://returnos.app/auth/callback?token_hash=otp123&type=magiclink&next=%2Fdashboard%2Fcustomers",
    );

    const response = await GET(request);

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: "otp123",
      type: "magiclink",
    });
    expect(mockExchangeCodeForSession).not.toHaveBeenCalled();
    expect(getCurrentMembershipResolution).toHaveBeenCalledTimes(1);
    expect(mockSignOut).not.toHaveBeenCalled();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://returnos.app/dashboard/customers",
    );
  });

  it("redirects signup confirmations to login and clears session", async () => {
    const request = new Request(
      "https://returnos.app/auth/callback?token_hash=otp123&type=signup&business_slug=panaderia-central",
    );

    const response = await GET(request);

    expect(mockVerifyOtp).toHaveBeenCalledWith({
      token_hash: "otp123",
      type: "signup",
    });
    expect(getCurrentMembershipResolution).not.toHaveBeenCalled();
    expect(mockSignOut).toHaveBeenCalledTimes(1);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe(
      "https://returnos.app/login?confirmed=1",
    );
  });
});
