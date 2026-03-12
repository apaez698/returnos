import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OnboardingPage from "@/app/onboarding/page";
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

describe("OnboardingPage integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders onboarding content for users without memberships", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "no-memberships",
      userId: "user-1",
      memberships: [],
      activeMembership: null,
    });

    render(await OnboardingPage());

    expect(
      screen.getByRole("heading", {
        name: /configura tu negocio en menos de 1 minuto/i,
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /crear negocio y continuar/i }),
    ).toBeInTheDocument();

    expect(screen.getByText(/1. crea tu negocio/i)).toBeInTheDocument();
    expect(screen.getByText(/2. configura tu cuenta/i)).toBeInTheDocument();
    expect(screen.getByText(/3. empieza en dashboard/i)).toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "unauthenticated",
      userId: null,
      memberships: [],
      activeMembership: null,
    });

    await expect(OnboardingPage()).rejects.toThrow("NEXT_REDIRECT:/login");
    expect(redirect).toHaveBeenCalledWith("/login");
  });

  it("redirects users with one membership to /dashboard", async () => {
    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-1",
      memberships: [
        {
          businessId: "biz-1",
          role: "owner",
          business: {
            id: "biz-1",
            name: "Panaderia Aurora",
            slug: "panaderia-aurora",
            business_type: "bakery",
            created_at: "2026-03-12T00:00:00Z",
          },
        },
      ],
      activeMembership: {
        businessId: "biz-1",
        role: "owner",
        business: {
          id: "biz-1",
          name: "Panaderia Aurora",
          slug: "panaderia-aurora",
          business_type: "bakery",
          created_at: "2026-03-12T00:00:00Z",
        },
      },
    });

    await expect(OnboardingPage()).rejects.toThrow("NEXT_REDIRECT:/dashboard");
    expect(redirect).toHaveBeenCalledWith("/dashboard");
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
            name: "Panaderia Aurora",
            slug: "panaderia-aurora",
            business_type: "bakery",
            created_at: "2026-03-12T00:00:00Z",
          },
        },
        {
          businessId: "biz-2",
          role: "staff",
          business: {
            id: "biz-2",
            name: "Cafe Centro",
            slug: "cafe-centro",
            business_type: "restaurant",
            created_at: "2026-03-12T00:00:00Z",
          },
        },
      ],
      activeMembership: null,
    });

    await expect(OnboardingPage()).rejects.toThrow(
      "NEXT_REDIRECT:/select-business",
    );
    expect(redirect).toHaveBeenCalledWith("/select-business");
  });
});
