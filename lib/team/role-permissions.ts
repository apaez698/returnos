import type { MembershipRole } from "@/lib/auth/membership-types";

export function canManageTeam(role: MembershipRole | null): boolean {
  return role === "owner" || role === "admin";
}

export function canInviteCollaborators(role: MembershipRole | null): boolean {
  return canManageTeam(role);
}

export function canChangeBusinessAssociations(
  role: MembershipRole | null,
): boolean {
  return role === "owner" || role === "admin";
}
