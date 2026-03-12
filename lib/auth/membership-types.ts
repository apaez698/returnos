import type { Business } from "@/lib/businesses/queries";

export type MembershipRole = "owner" | "admin" | "staff";

export interface BusinessMembership {
  businessId: string;
  role: MembershipRole | null;
  business: Business;
}

export type MembershipResolutionStatus =
  | "unauthenticated"
  | "no-memberships"
  | "single-membership"
  | "multiple-memberships";

export interface MembershipResolution {
  status: MembershipResolutionStatus;
  userId: string | null;
  memberships: BusinessMembership[];
  activeMembership: BusinessMembership | null;
}

export function getRedirectPathForMembershipStatus(
  status: MembershipResolutionStatus,
): string | null {
  if (status === "unauthenticated") {
    return "/login";
  }

  if (status === "no-memberships") {
    return "/onboarding";
  }

  if (status === "multiple-memberships") {
    return "/select-business";
  }

  return null;
}
