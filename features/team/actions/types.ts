export interface InviteCollaboratorActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    email?: string;
    role?: string;
  };
}

export interface AcceptInvitationActionState {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    token?: string;
  };
}
