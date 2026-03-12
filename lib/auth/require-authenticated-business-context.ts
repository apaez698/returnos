import { redirect } from "next/navigation";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { getRedirectPathForMembershipStatus } from "@/lib/auth/membership-types";
import { getCurrentSessionUser } from "@/lib/auth/get-current-session-user";
import type { Business } from "@/lib/businesses/queries";
import type { MembershipRole } from "@/lib/auth/membership-types";

export interface AuthenticatedBusinessContext {
  userId: string;
  userEmail: string;
  businessId: string;
  role: MembershipRole | null;
  business: Business;
}

/**
 * Resolves the full authenticated business context needed by protected pages
 * and the app shell layout.
 *
 * Redirects to /login when the user has no valid session.
 * Redirects to /onboarding or /select-business when the membership state
 * cannot be resolved to a single active business.
 *
 * Throws when the active membership is unexpectedly absent after a valid
 * single-membership resolution.
 */
export async function requireAuthenticatedBusinessContext(): Promise<AuthenticatedBusinessContext> {
  const [user, resolution] = await Promise.all([
    getCurrentSessionUser(),
    getCurrentMembershipResolution(),
  ]);

  if (!user) {
    redirect("/login");
  }

  const redirectPath = getRedirectPathForMembershipStatus(resolution.status);
  if (redirectPath) {
    redirect(redirectPath);
  }

  const { activeMembership } = resolution;
  if (!activeMembership) {
    throw new Error(
      "No se pudo resolver una membresía activa para el usuario.",
    );
  }

  return {
    userId: user.id,
    userEmail: user.email,
    businessId: activeMembership.businessId,
    role: activeMembership.role,
    business: activeMembership.business,
  };
}
