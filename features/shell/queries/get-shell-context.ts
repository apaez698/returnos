import { requireAuthenticatedBusinessContext } from "@/lib/auth/require-authenticated-business-context";
import { getBusinessTypeLabel } from "@/lib/business/business-branding";
import type { MembershipRole } from "@/lib/auth/membership-types";

export interface ShellContext {
  userId: string;
  userEmail: string;
  businessId: string;
  businessName: string;
  businessType: string;
  businessTypeLabel: string;
  role: MembershipRole | null;
}

/**
 * Resolves and returns the shell context for the authenticated user.
 *
 * Delegates redirect behaviour to requireAuthenticatedBusinessContext —
 * invalid sessions or memberships are redirected before this function returns.
 */
export async function getShellContext(): Promise<ShellContext> {
  const ctx = await requireAuthenticatedBusinessContext();

  return {
    userId: ctx.userId,
    userEmail: ctx.userEmail,
    businessId: ctx.businessId,
    businessName: ctx.business.name,
    businessType: ctx.business.business_type,
    businessTypeLabel: getBusinessTypeLabel(ctx.business.business_type),
    role: ctx.role,
  };
}
