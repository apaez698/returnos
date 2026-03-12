import { z } from "zod";

export const teamRoleSchema = z.enum(["admin", "staff"]);

export const inviteCollaboratorSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "El correo es obligatorio.")
    .email("Ingresa un correo valido."),
  role: teamRoleSchema,
});

export const acceptInvitationSchema = z.object({
  token: z.string().trim().min(20, "El token de invitacion no es valido."),
});

export type InviteCollaboratorInput = z.infer<typeof inviteCollaboratorSchema>;
export type TeamRole = z.infer<typeof teamRoleSchema>;

export const BUSINESS_INVITATION_TTL_DAYS = 7;
