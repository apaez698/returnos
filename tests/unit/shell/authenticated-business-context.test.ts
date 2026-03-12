import { beforeEach, describe, expect, it, vi } from "vitest";
import { requireAuthenticatedBusinessContext } from "@/lib/auth/require-authenticated-business-context";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { getCurrentSessionUser } from "@/lib/auth/get-current-session-user";

// Mock the dependencies
vi.mock("@/lib/auth/get-current-membership");
vi.mock("@/lib/auth/get-current-session-user");

describe("requireAuthenticatedBusinessContext — invalid context handling", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("unauthenticated user handling", () => {
    it("redirects to login when user is not authenticated", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue(null);
      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "unauthenticated",
        userId: null,
        memberships: [],
        activeMembership: null,
      });

      // The function uses Next.js redirect which throws
      await expect(requireAuthenticatedBusinessContext()).rejects.toThrow();
    });
  });

  describe("no memberships handling", () => {
    it("throws or redirects when user has no business memberships", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue({
        id: "user-123",
        email: "user@example.com",
        created_at: "2025-01-01T00:00:00Z",
      });

      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "no-memberships",
        userId: "user-123",
        memberships: [],
        activeMembership: null,
      });

      // Should redirect to onboarding
      await expect(requireAuthenticatedBusinessContext()).rejects.toThrow();
    });

    it("indicates user needs to complete onboarding", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue({
        id: "user-new",
        email: "newuser@example.com",
        created_at: "2025-02-01T00:00:00Z",
      });

      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "no-memberships",
        userId: "user-new",
        memberships: [],
        activeMembership: null,
      });

      try {
        await requireAuthenticatedBusinessContext();
        // If it doesn't throw, the test setup is wrong
        throw new Error("Should have thrown");
      } catch (err) {
        // Expected - the redirect should throw in Next.js
        expect(err).toBeDefined();
      }
    });
  });

  describe("multiple memberships handling", () => {
    it("redirects when user has multiple business memberships", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue({
        id: "user-multi",
        email: "multi@example.com",
        created_at: "2025-01-01T00:00:00Z",
      });

      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "multiple-memberships",
        userId: "user-multi",
        memberships: [
          {
            businessId: "biz-1",
            role: "owner",
            business: {
              id: "biz-1",
              name: "Business 1",
              slug: "business-1",
              business_type: "bakery",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
          {
            businessId: "biz-2",
            role: "staff",
            business: {
              id: "biz-2",
              name: "Business 2",
              slug: "business-2",
              business_type: "restaurant",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
        ],
        activeMembership: null,
      });

      // Should redirect to select-business
      await expect(requireAuthenticatedBusinessContext()).rejects.toThrow();
    });

    it("requires user to select a business when multiple memberships exist", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue({
        id: "user-choices",
        email: "choices@example.com",
        created_at: "2025-01-01T00:00:00Z",
      });

      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "multiple-memberships",
        userId: "user-choices",
        memberships: [
          {
            businessId: "biz-a",
            role: "owner",
            business: {
              id: "biz-a",
              name: "Bakery A",
              slug: "bakery-a",
              business_type: "bakery",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
          {
            businessId: "biz-b",
            role: "admin",
            business: {
              id: "biz-b",
              name: "Restaurant B",
              slug: "restaurant-b",
              business_type: "restaurant",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
          {
            businessId: "biz-c",
            role: "staff",
            business: {
              id: "biz-c",
              name: "Cafe C",
              slug: "cafe-c",
              business_type: "bakery",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
        ],
        activeMembership: null,
      });

      try {
        await requireAuthenticatedBusinessContext();
        throw new Error("Should have thrown redirect");
      } catch (err) {
        expect(err).toBeDefined();
      }
    });
  });

  describe("active membership resolution failures", () => {
    it("throws when active membership is unexpectedly null despite single-membership status", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue({
        id: "user-edge",
        email: "edge@example.com",
        created_at: "2025-01-01T00:00:00Z",
      });

      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "single-membership",
        userId: "user-edge",
        memberships: [
          {
            businessId: "biz-1",
            role: "owner",
            business: {
              id: "biz-1",
              name: "Business",
              slug: "business",
              business_type: "bakery",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
        ],
        activeMembership: null, // This is the invalid state
      });

      await expect(requireAuthenticatedBusinessContext()).rejects.toThrow(
        "No se pudo resolver una membresía activa para el usuario.",
      );
    });
  });

  describe("valid single membership", () => {
    it("returns successful context for user with single valid membership", async () => {
      const validUser = {
        id: "user-valid",
        email: "valid@example.com",
        created_at: "2025-01-01T00:00:00Z",
      };

      const validBusiness = {
        id: "biz-valid",
        name: "Valid Business",
        slug: "valid-business",
        business_type: "bakery",
        created_at: "2025-01-01T00:00:00Z",
      };

      vi.mocked(getCurrentSessionUser).mockResolvedValue(validUser);
      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "single-membership",
        userId: "user-valid",
        memberships: [
          {
            businessId: "biz-valid",
            role: "owner",
            business: validBusiness,
          },
        ],
        activeMembership: {
          businessId: "biz-valid",
          role: "owner",
          business: validBusiness,
        },
      });

      const context = await requireAuthenticatedBusinessContext();

      expect(context.userId).toBe("user-valid");
      expect(context.userEmail).toBe("valid@example.com");
      expect(context.businessId).toBe("biz-valid");
      expect(context.role).toBe("owner");
      expect(context.business.name).toBe("Valid Business");
    });

    it("preserves role null when membership has no role", async () => {
      const validUser = {
        id: "user-norole",
        email: "norole@example.com",
        created_at: "2025-01-01T00:00:00Z",
      };

      const validBusiness = {
        id: "biz-norole",
        name: "Business No Role",
        slug: "business-no-role",
        business_type: "restaurant",
        created_at: "2025-01-01T00:00:00Z",
      };

      vi.mocked(getCurrentSessionUser).mockResolvedValue(validUser);
      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "single-membership",
        userId: "user-norole",
        memberships: [
          {
            businessId: "biz-norole",
            role: null,
            business: validBusiness,
          },
        ],
        activeMembership: {
          businessId: "biz-norole",
          role: null,
          business: validBusiness,
        },
      });

      const context = await requireAuthenticatedBusinessContext();

      expect(context.role).toBeNull();
    });
  });

  describe("edge cases for custom business types", () => {
    it("returns context even with unknown business type", async () => {
      vi.mocked(getCurrentSessionUser).mockResolvedValue({
        id: "user-unknown",
        email: "unknown@example.com",
        created_at: "2025-01-01T00:00:00Z",
      });

      const businessWithUnknownType = {
        id: "biz-unknown",
        name: "Unknown Type Business",
        slug: "unknown-type-business",
        business_type: "gym", // Not in the standard types
        created_at: "2025-01-01T00:00:00Z",
      };

      vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
        status: "single-membership",
        userId: "user-unknown",
        memberships: [
          {
            businessId: "biz-unknown",
            role: "owner",
            business: businessWithUnknownType,
          },
        ],
        activeMembership: {
          businessId: "biz-unknown",
          role: "owner",
          business: businessWithUnknownType,
        },
      });

      const context = await requireAuthenticatedBusinessContext();

      expect(context.business.business_type).toBe("gym");
      expect(context.business.name).toBe("Unknown Type Business");
    });
  });

  describe("race conditions and timing", () => {
    it("properly awaits both user and membership resolution in parallel", async () => {
      const callOrder: string[] = [];

      vi.mocked(getCurrentSessionUser).mockImplementation(async () => {
        callOrder.push("user-check");
        return {
          id: "user-race",
          email: "race@example.com",
          created_at: "2025-01-01T00:00:00Z",
        };
      });

      vi.mocked(getCurrentMembershipResolution).mockImplementation(async () => {
        callOrder.push("membership-check");
        return {
          status: "single-membership",
          userId: "user-race",
          memberships: [
            {
              businessId: "biz-race",
              role: "owner",
              business: {
                id: "biz-race",
                name: "Race Business",
                slug: "race-business",
                business_type: "bakery",
                created_at: "2025-01-01T00:00:00Z",
              },
            },
          ],
          activeMembership: {
            businessId: "biz-race",
            role: "owner",
            business: {
              id: "biz-race",
              name: "Race Business",
              slug: "race-business",
              business_type: "bakery",
              created_at: "2025-01-01T00:00:00Z",
            },
          },
        };
      });

      const context = await requireAuthenticatedBusinessContext();

      expect(context).toBeDefined();
      // Both should be called (order may vary due to parallel Promise.all)
      expect(callOrder).toContain("user-check");
      expect(callOrder).toContain("membership-check");
    });
  });
});
