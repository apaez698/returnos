import { beforeEach, describe, expect, it, vi } from "vitest";
import { createBusinessOwnerAction } from "@/app/onboarding/actions";
import { createBusinessOwnerSetup } from "@/lib/onboarding/create-business-owner-setup";
import { initialOnboardingActionState } from "@/lib/onboarding/types";
import {
  createServerAuthClient,
  createServerClient,
} from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  }),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(),
  createServerClient: vi.fn(),
}));

function makeFormData(payload?: {
  businessName?: string;
  businessType?: string;
}) {
  const formData = new FormData();
  formData.set("businessName", payload?.businessName ?? "Panaderia Aurora");
  formData.set("businessType", payload?.businessType ?? "bakery");
  return formData;
}

describe("Onboarding create business + owner flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createBusinessOwnerSetup", () => {
    it("creates business and owner membership", async () => {
      const membershipLookup = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      };

      const businessInsert = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "biz-1", slug: "panaderia-aurora" },
              error: null,
            }),
          }),
        }),
      };

      const ownerMembershipInsert = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      const supabase = {
        from: vi
          .fn()
          .mockReturnValueOnce(membershipLookup)
          .mockReturnValueOnce(businessInsert)
          .mockReturnValueOnce(ownerMembershipInsert),
      };

      vi.mocked(createServerClient).mockReturnValue(supabase as never);

      const result = await createBusinessOwnerSetup({
        userId: "user-1",
        businessName: "Panaderia Aurora",
        businessType: "bakery",
      });

      expect(result).toEqual({
        success: true,
        businessId: "biz-1",
        slug: "panaderia-aurora",
        error: null,
      });

      expect(supabase.from).toHaveBeenNthCalledWith(1, "business_users");
      expect(supabase.from).toHaveBeenNthCalledWith(2, "businesses");
      expect(supabase.from).toHaveBeenNthCalledWith(3, "business_users");
      expect(ownerMembershipInsert.insert).toHaveBeenCalledWith({
        business_id: "biz-1",
        user_id: "user-1",
        role: "owner",
      });
    });

    it("retries with an incremental slug when the first slug is taken", async () => {
      const membershipLookup = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      };

      const firstBusinessInsert = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: null,
              error: { code: "23505" },
            }),
          }),
        }),
      };

      const secondBusinessInsert = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "biz-2", slug: "panaderia-aurora-2" },
              error: null,
            }),
          }),
        }),
      };

      const ownerMembershipInsert = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      const supabase = {
        from: vi
          .fn()
          .mockReturnValueOnce(membershipLookup)
          .mockReturnValueOnce(firstBusinessInsert)
          .mockReturnValueOnce(secondBusinessInsert)
          .mockReturnValueOnce(ownerMembershipInsert),
      };

      vi.mocked(createServerClient).mockReturnValue(supabase as never);

      const result = await createBusinessOwnerSetup({
        userId: "user-1",
        businessName: "Panaderia Aurora",
        businessType: "bakery",
      });

      expect(result.success).toBe(true);
      expect(secondBusinessInsert.insert).toHaveBeenCalledWith({
        name: "Panaderia Aurora",
        slug: "panaderia-aurora-2",
        business_type: "bakery",
      });
    });
  });

  describe("createBusinessOwnerAction", () => {
    it("returns field errors when required fields are missing", async () => {
      vi.mocked(createServerAuthClient).mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
      } as never);

      const result = await createBusinessOwnerAction(
        initialOnboardingActionState,
        makeFormData({ businessName: "", businessType: "" }),
      );

      expect(result.status).toBe("error");
      expect(result.fieldErrors?.businessName).toBeDefined();
      expect(result.fieldErrors?.businessType).toBeDefined();
      expect(redirect).not.toHaveBeenCalled();
    });

    it("redirects to dashboard after successful setup", async () => {
      vi.mocked(createServerAuthClient).mockResolvedValue({
        auth: {
          getUser: vi
            .fn()
            .mockResolvedValue({ data: { user: { id: "user-1" } } }),
        },
      } as never);

      const membershipLookup = {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: null, error: null }),
            }),
          }),
        }),
      };

      const businessInsert = {
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: "biz-1", slug: "panaderia-aurora" },
              error: null,
            }),
          }),
        }),
      };

      const ownerMembershipInsert = {
        insert: vi.fn().mockResolvedValue({ error: null }),
      };

      const supabase = {
        from: vi
          .fn()
          .mockReturnValueOnce(membershipLookup)
          .mockReturnValueOnce(businessInsert)
          .mockReturnValueOnce(ownerMembershipInsert),
      };

      vi.mocked(createServerClient).mockReturnValue(supabase as never);

      await expect(
        createBusinessOwnerAction(initialOnboardingActionState, makeFormData()),
      ).rejects.toThrow("NEXT_REDIRECT:/dashboard");

      expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
      expect(redirect).toHaveBeenCalledWith("/dashboard");
    });
  });
});
