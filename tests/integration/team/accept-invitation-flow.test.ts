import { beforeEach, describe, expect, it, vi } from "vitest";
import { acceptInvitationAction } from "@/features/team/actions/accept-invitation";
import type { AcceptInvitationActionState } from "@/features/team/actions/types";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import {
  createServerAuthClient,
  createServerClient,
} from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-membership", () => ({
  getCurrentMembershipResolution: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerAuthClient: vi.fn(),
  createServerClient: vi.fn(),
}));

function makeFormData(token = "a".repeat(32)) {
  const formData = new FormData();
  formData.set("token", token);
  return formData;
}

describe("Accept invitation flow", () => {
  const initialState: AcceptInvitationActionState = { status: "idle" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a business_users membership when invitation is valid", async () => {
    vi.mocked(createServerAuthClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-2", email: "staff@demo.com" } },
        }),
      },
    } as never);

    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "no-memberships",
      userId: "user-2",
      memberships: [],
      activeMembership: null,
    });

    const membershipInsertMock = vi.fn().mockResolvedValue({ error: null });

    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({
                    data: {
                      id: "inv-1",
                      business_id: "biz-1",
                      email: "staff@demo.com",
                      role: "admin",
                      status: "pending",
                      expires_at: new Date(
                        Date.now() + 24 * 60 * 60 * 1000,
                      ).toISOString(),
                    },
                    error: null,
                  }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              eq: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  maybeSingle: vi
                    .fn()
                    .mockResolvedValue({ data: null, error: null }),
                }),
              }),
            }),
          }),
        })
        .mockReturnValueOnce({
          insert: membershipInsertMock,
        })
        .mockReturnValueOnce({
          update: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null }),
          }),
        }),
    };

    vi.mocked(createServerClient).mockReturnValue(supabase as never);

    const result = await acceptInvitationAction(initialState, makeFormData());

    expect(result.status).toBe("success");
    expect(membershipInsertMock).toHaveBeenCalledWith({
      business_id: "biz-1",
      user_id: "user-2",
      role: "admin",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard");
  });

  it("blocks staff-only users from changing business associations", async () => {
    vi.mocked(createServerAuthClient).mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "user-3", email: "staff2@demo.com" } },
        }),
      },
    } as never);

    vi.mocked(getCurrentMembershipResolution).mockResolvedValue({
      status: "single-membership",
      userId: "user-3",
      memberships: [
        {
          businessId: "biz-current",
          role: "staff",
          business: {
            id: "biz-current",
            name: "Current",
            slug: "current",
            business_type: "bakery",
            created_at: new Date().toISOString(),
          },
        },
      ],
      activeMembership: {
        businessId: "biz-current",
        role: "staff",
        business: {
          id: "biz-current",
          name: "Current",
          slug: "current",
          business_type: "bakery",
          created_at: new Date().toISOString(),
        },
      },
    });

    const result = await acceptInvitationAction(initialState, makeFormData());

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/no permite cambiar asociaciones/i);
    expect(createServerClient).not.toHaveBeenCalled();
  });
});
