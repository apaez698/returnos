"use server";

import { revalidatePath } from "next/cache";
import { getCurrentMembershipResolution } from "@/lib/auth/get-current-membership";
import { acceptInvitationSchema } from "@/lib/team/invitation-schema";
import { canChangeBusinessAssociations } from "@/lib/team/role-permissions";
import {
  createServerAuthClient,
  createServerClient,
} from "@/lib/supabase/server";
import type { AcceptInvitationActionState } from "./types";

interface InvitationRow {
  id: string;
  business_id: string;
  email: string;
  role: "admin" | "staff";
  status: "pending" | "accepted" | "revoked" | "expired";
  expires_at: string;
}

export async function acceptInvitationAction(
  previousState: AcceptInvitationActionState,
  formData: FormData,
): Promise<AcceptInvitationActionState> {
  void previousState;

  const parsed = acceptInvitationSchema.safeParse({
    token: String(formData.get("token") ?? ""),
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: "Revisa el token de invitacion.",
      fieldErrors: {
        token: parsed.error.flatten().fieldErrors.token?.[0],
      },
    };
  }

  const supabaseAuth = await createServerAuthClient();
  const {
    data: { user },
  } = await supabaseAuth.auth.getUser();

  if (!user?.email) {
    return {
      status: "error",
      message: "Debes iniciar sesion para aceptar la invitacion.",
    };
  }

  const resolution = await getCurrentMembershipResolution();
  const hasStaffOnlyMemberships =
    resolution.memberships.length > 0 &&
    resolution.memberships.every(
      (membership) => !canChangeBusinessAssociations(membership.role),
    );

  if (hasStaffOnlyMemberships) {
    return {
      status: "error",
      message:
        "Tu rol actual no permite cambiar asociaciones de negocio. Solicita ayuda a un owner/admin.",
    };
  }

  const supabase = createServerClient();

  const { data: invitation, error: invitationError } = await supabase
    .from("business_invitations")
    .select("id, business_id, email, role, status, expires_at")
    .eq("token", parsed.data.token)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (invitationError) {
    return {
      status: "error",
      message: "No se pudo validar la invitacion.",
    };
  }

  const invitationRow = invitation as InvitationRow | null;

  if (!invitationRow) {
    return {
      status: "error",
      message: "La invitacion no existe o ya fue usada.",
    };
  }

  if (new Date(invitationRow.expires_at).getTime() < Date.now()) {
    await supabase
      .from("business_invitations")
      .update({ status: "expired" })
      .eq("id", invitationRow.id);

    return {
      status: "error",
      message: "La invitacion expiro. Solicita una nueva invitacion.",
    };
  }

  if (invitationRow.email !== user.email.toLowerCase()) {
    return {
      status: "error",
      message: "Este usuario no coincide con el correo invitado.",
    };
  }

  const { data: existingMembership, error: existingMembershipError } =
    await supabase
      .from("business_users")
      .select("id")
      .eq("business_id", invitationRow.business_id)
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle();

  if (existingMembershipError) {
    return {
      status: "error",
      message: "No se pudo validar la membresia actual.",
    };
  }

  if (!existingMembership?.id) {
    const { error: insertMembershipError } = await supabase
      .from("business_users")
      .insert({
        business_id: invitationRow.business_id,
        user_id: user.id,
        role: invitationRow.role,
      });

    if (insertMembershipError) {
      return {
        status: "error",
        message: "No se pudo completar la membresia del colaborador.",
      };
    }
  }

  const { error: consumeInvitationError } = await supabase
    .from("business_invitations")
    .update({ status: "accepted" })
    .eq("id", invitationRow.id);

  if (consumeInvitationError) {
    return {
      status: "error",
      message: "La membresia se creo, pero la invitacion no se pudo cerrar.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings/team");
  revalidatePath("/onboarding");

  return {
    status: "success",
    message: "Invitacion aceptada. Ya puedes continuar al dashboard.",
  };
}
