import { beforeEach, describe, expect, it, vi } from "vitest";
import { inviteCollaboratorAction } from "@/features/team/actions/invite-collaborator";
import type { InviteCollaboratorActionState } from "@/features/team/actions/types";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requireBusinessMembership } from "@/lib/auth/require-business-membership";
import { createServerClient } from "@/lib/supabase/server";
import { sendInvitationEmail } from "@/lib/team/send-invitation-email";
import { revalidatePath } from "next/cache";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth/require-business-membership", () => ({
  requireBusinessMembership: vi.fn(),
}));

vi.mock("@/lib/auth/get-current-user", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/supabase/server", () => ({
  createServerClient: vi.fn(),
}));

vi.mock("@/lib/team/send-invitation-email", () => ({
  sendInvitationEmail: vi.fn().mockResolvedValue({
    success: true,
    error: null,
  }),
}));

function makeFormData(payload?: { email?: string; role?: string }) {
  const formData = new FormData();
  formData.set("email", payload?.email ?? "colab@demo.com");
  formData.set("role", payload?.role ?? "admin");
  return formData;
}

describe("Invite collaborator flow", () => {
  const initialState: InviteCollaboratorActionState = { status: "idle" };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("prevents staff users from inviting collaborators", async () => {
    vi.mocked(requireBusinessMembership).mockResolvedValue({
      businessId: "biz-1",
      role: "staff",
      business: {
        id: "biz-1",
        name: "Demo",
        slug: "demo",
        business_type: "bakery",
        created_at: new Date().toISOString(),
      },
    } as never);

    const result = await inviteCollaboratorAction(initialState, makeFormData());

    expect(result.status).toBe("error");
    expect(result.message).toMatch(/owner o admin/i);
    expect(createServerClient).not.toHaveBeenCalled();
  });

  it("creates a pending invitation for owner/admin", async () => {
    vi.mocked(requireBusinessMembership).mockResolvedValue({
      businessId: "biz-1",
      role: "owner",
      business: {
        id: "biz-1",
        name: "Demo",
        slug: "demo",
        business_type: "bakery",
        created_at: new Date().toISOString(),
      },
    } as never);

    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "user-1",
      email: "owner@demo.com",
    });

    const insertMock = vi.fn().mockResolvedValue({ error: null });

    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce({
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
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
          }),
        })
        .mockReturnValueOnce({
          insert: insertMock,
        }),
    };

    vi.mocked(createServerClient).mockReturnValue(supabase as never);

    const result = await inviteCollaboratorAction(
      initialState,
      makeFormData({ email: "NEW.COLAB@DEMO.COM", role: "admin" }),
    );

    expect(result.status).toBe("success");
    expect(insertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        business_id: "biz-1",
        email: "new.colab@demo.com",
        role: "admin",
        invited_by: "user-1",
        status: "pending",
      }),
    );
    expect(sendInvitationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        toEmail: "new.colab@demo.com",
        invitedByEmail: "owner@demo.com",
        businessName: "Demo",
        role: "admin",
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/dashboard/settings/team");
  });
});
