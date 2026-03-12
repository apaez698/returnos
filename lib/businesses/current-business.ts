import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";

/**
 * Returns the business id currently in scope for dashboard operations.
 * The active business is valid only when the authenticated user has exactly
 * one business membership.
 */
export async function getCurrentBusinessId(): Promise<string> {
  const resolution = await getCurrentMembershipResolution();

  if (resolution.status === "unauthenticated") {
    throw new Error("Usuario no autenticado.");
  }

  if (resolution.status === "no-memberships") {
    throw new Error("El usuario no pertenece a ningun negocio.");
  }

  if (resolution.status === "multiple-memberships") {
    throw new Error("El usuario pertenece a multiples negocios.");
  }

  const activeMembership = resolution.activeMembership;

  if (!activeMembership) {
    throw new Error("No se pudo resolver el negocio actual.");
  }

  return activeMembership.businessId;
}
