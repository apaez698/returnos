import { redirect } from "next/navigation";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { getRedirectPathForMembershipStatus } from "@/lib/auth/membership-types";
import type { BusinessMembership } from "@/lib/auth/membership-types";

/**
 * Ensures that the current request has exactly one valid business membership.
 * Redirects unauthenticated users and unresolved membership states.
 */
export async function requireBusinessMembership(): Promise<BusinessMembership> {
  const resolution = await getCurrentMembershipResolution();
  const redirectPath = getRedirectPathForMembershipStatus(resolution.status);

  if (redirectPath) {
    redirect(redirectPath);
  }

  if (!resolution.activeMembership) {
    throw new Error(
      "No se pudo resolver una membresia activa para el usuario.",
    );
  }

  return resolution.activeMembership;
}
