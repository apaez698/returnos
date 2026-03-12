import { createServerAuthClient } from "@/lib/supabase/server";
import type { Business } from "@/lib/businesses/queries";
import type {
  BusinessMembership,
  MembershipResolution,
} from "./membership-types";

interface MembershipRow {
  business_id: string;
  role: "owner" | "admin" | "staff" | null;
  businesses: Business | Business[] | null;
}

function normalizeMembershipRows(rows: MembershipRow[]): BusinessMembership[] {
  return rows
    .map((row) => {
      const business = Array.isArray(row.businesses)
        ? row.businesses[0]
        : row.businesses;

      if (!business || !row.business_id) {
        return null;
      }

      return {
        businessId: row.business_id,
        role: row.role,
        business,
      } satisfies BusinessMembership;
    })
    .filter((membership): membership is BusinessMembership =>
      Boolean(membership),
    );
}

/**
 * Resolves business memberships for the authenticated user.
 * Active business is only considered valid when exactly one membership exists.
 */
export async function getCurrentMembershipResolution(): Promise<MembershipResolution> {
  const supabase = await createServerAuthClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      status: "unauthenticated",
      userId: null,
      memberships: [],
      activeMembership: null,
    };
  }

  const { data, error } = await supabase
    .from("business_users")
    .select(
      "business_id, role, businesses:businesses!inner(id, name, slug, business_type, created_at)",
    )
    .eq("user_id", user.id);

  if (error) {
    throw new Error("No se pudo resolver la membresia actual del usuario.");
  }

  const memberships = normalizeMembershipRows((data ?? []) as MembershipRow[]);

  if (memberships.length === 0) {
    return {
      status: "no-memberships",
      userId: user.id,
      memberships,
      activeMembership: null,
    };
  }

  if (memberships.length === 1) {
    return {
      status: "single-membership",
      userId: user.id,
      memberships,
      activeMembership: memberships[0],
    };
  }

  return {
    status: "multiple-memberships",
    userId: user.id,
    memberships,
    activeMembership: null,
  };
}
