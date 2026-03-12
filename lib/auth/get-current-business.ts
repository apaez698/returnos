import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import type { Business } from "@/lib/businesses/queries";

/**
 * Returns the full Business record for the currently authenticated user.
 *
 * Returns a business only when the authenticated user has exactly one
 * membership. No fallback business is used.
 *
 * Returns null if no business can be resolved.
 */
export async function getCurrentBusiness(): Promise<Business | null> {
  const resolution = await getCurrentMembershipResolution();

  if (resolution.status !== "single-membership") {
    return null;
  }

  return resolution.activeMembership?.business ?? null;
}
