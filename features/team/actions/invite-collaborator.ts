"use server";

import { revalidatePath } from "next/cache";
import { requireBusinessMembership } from "@/lib/auth/require-business-membership";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  BUSINESS_INVITATION_TTL_DAYS,
  inviteCollaboratorSchema,
} from "@/lib/team/invitation-schema";
import { canInviteCollaborators } from "@/lib/team/role-permissions";
import { sendInvitationEmail } from "@/lib/team/send-invitation-email";
import { createServerClient } from "@/lib/supabase/server";
import type { InviteCollaboratorActionState } from "./types";

function generateInvitationToken(): string {
  return `${crypto.randomUUID().replaceAll("-", "")}${crypto
    .randomUUID()
    .replaceAll("-", "")}`;
}

export async function inviteCollaboratorAction(
  previousState: InviteCollaboratorActionState,
  formData: FormData,
): Promise<InviteCollaboratorActionState> {
  void previousState;

  const membership = await requireBusinessMembership();

  if (!canInviteCollaborators(membership.role)) {
    return {
      status: "error",
      message: "Solo owner o admin pueden invitar colaboradores.",
    };
  }

  const inviter = await getCurrentUser();

  if (!inviter) {
    return {
      status: "error",
      message: "Tu sesion no es valida. Inicia sesion de nuevo.",
    };
  }

  const parsed = inviteCollaboratorSchema.safeParse({
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? ""),
  });

  if (!parsed.success) {
    const fieldErrors = parsed.error.flatten().fieldErrors;

    return {
      status: "error",
      message: "Revisa los datos de la invitacion.",
      fieldErrors: {
        email: fieldErrors.email?.[0],
        role: fieldErrors.role?.[0],
      },
    };
  }

  const supabase = createServerClient();
  const email = parsed.data.email.toLowerCase();
  const token = generateInvitationToken();
  const expiresAt = new Date(
    Date.now() + BUSINESS_INVITATION_TTL_DAYS * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: existingPending, error: existingPendingError } = await supabase
    .from("business_invitations")
    .select("id")
    .eq("business_id", membership.businessId)
    .eq("email", email)
    .eq("status", "pending")
    .limit(1)
    .maybeSingle();

  if (existingPendingError) {
    return {
      status: "error",
      message: "No se pudo validar invitaciones previas.",
    };
  }

  if (existingPending?.id) {
    const { error: updateError } = await supabase
      .from("business_invitations")
      .update({
        role: parsed.data.role,
        token,
        expires_at: expiresAt,
      })
      .eq("id", existingPending.id);

    if (updateError) {
      return {
        status: "error",
        message: "No se pudo actualizar la invitacion existente.",
      };
    }
  } else {
    const { error: insertError } = await supabase
      .from("business_invitations")
      .insert({
        business_id: membership.businessId,
        email,
        role: parsed.data.role,
        invited_by: inviter.id,
        status: "pending",
        token,
        expires_at: expiresAt,
      });

    if (insertError) {
      return {
        status: "error",
        message: "No se pudo guardar la invitacion.",
      };
    }
  }

  const sendEmailResult = await sendInvitationEmail({
    toEmail: email,
    invitedByEmail: inviter.email,
    businessName: membership.business.name,
    role: parsed.data.role,
    token,
  });

  if (!sendEmailResult.success) {
    return {
      status: "error",
      message:
        sendEmailResult.error ??
        "La invitacion se guardo, pero no se pudo enviar por correo.",
    };
  }

  revalidatePath("/dashboard/settings/team");

  return {
    status: "success",
    message: `Invitacion enviada a ${email}.`,
  };
}
