import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import type { Business } from "@/lib/businesses/queries";
import type { MembershipRole } from "@/lib/auth/membership-types";

export interface BusinessContext {
  businessId: string;
  role: MembershipRole | null;
  business: Business;
}

/**
 * Returns the active business context for the current user.
 *
 * Valid only when the authenticated user has exactly one membership.
 * Returns null for all other states (unauthenticated, no memberships,
 * multiple memberships). Use requireAuthenticatedBusinessContext when
 * you need a guaranteed context with redirect behaviour.
 */
export async function getCurrentBusinessContext(): Promise<BusinessContext | null> {
  const resolution = await getCurrentMembershipResolution();

  if (resolution.status !== "single-membership") {
    return null;
  }

  const { activeMembership } = resolution;

  if (!activeMembership) {
    return null;
  }

  return {
    businessId: activeMembership.businessId,
    role: activeMembership.role,
    business: activeMembership.business,
  };
}
