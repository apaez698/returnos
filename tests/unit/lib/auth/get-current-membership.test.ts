import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { createServerAuthClient } from "@/lib/supabase/server";

const mockEq = vi.fn();
const mockSelect = vi.fn(() => ({ eq: mockEq }));
const mockFrom = vi.fn(() => ({ select: mockSelect }));
const mockGetUser = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(),
}));

describe("getCurrentMembershipResolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(createServerAuthClient).mockResolvedValue({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    } as never);
  });

  it("returns unauthenticated when there is no authenticated user", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });

    const result = await getCurrentMembershipResolution();

    expect(result.status).toBe("unauthenticated");
    expect(result.activeMembership).toBeNull();
    expect(result.memberships).toEqual([]);
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it("returns no-memberships when user has zero business links", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockEq.mockResolvedValue({ data: [], error: null });

    const result = await getCurrentMembershipResolution();

    expect(result.status).toBe("no-memberships");
    expect(result.userId).toBe("user-1");
    expect(result.memberships).toHaveLength(0);
    expect(result.activeMembership).toBeNull();
  });

  it("returns single-membership and active membership when exactly one exists", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockEq.mockResolvedValue({
      data: [
        {
          business_id: "biz-1",
          role: "owner",
          businesses: {
            id: "biz-1",
            name: "Panadería La Esperanza",
            slug: "panaderia-la-esperanza",
            business_type: "bakery",
            created_at: "2025-01-01T00:00:00Z",
          },
        },
      ],
      error: null,
    });

    const result = await getCurrentMembershipResolution();

    expect(result.status).toBe("single-membership");
    expect(result.activeMembership?.businessId).toBe("biz-1");
    expect(result.activeMembership?.business.name).toBe(
      "Panadería La Esperanza",
    );
  });

  it("returns multiple-memberships and no active membership when more than one exists", async () => {
    mockGetUser.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mockEq.mockResolvedValue({
      data: [
        {
          business_id: "biz-1",
          role: "owner",
          businesses: {
            id: "biz-1",
            name: "Panadería La Esperanza",
            slug: "panaderia-la-esperanza",
            business_type: "bakery",
            created_at: "2025-01-01T00:00:00Z",
          },
        },
        {
          business_id: "biz-2",
          role: "staff",
          businesses: {
            id: "biz-2",
            name: "Café Centro",
            slug: "cafe-centro",
            business_type: "restaurant",
            created_at: "2025-02-01T00:00:00Z",
          },
        },
      ],
      error: null,
    });

    const result = await getCurrentMembershipResolution();

    expect(result.status).toBe("multiple-memberships");
    expect(result.memberships).toHaveLength(2);
    expect(result.activeMembership).toBeNull();
  });
});
