interface PendingInvitation {
  id: string;
  email: string;
  role: "admin" | "staff";
  token: string;
  expires_at: string;
  created_at: string;
}

interface PendingInvitationsListProps {
  invitations: PendingInvitation[];
}

function formatDate(dateInput: string): string {
  const date = new Date(dateInput);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function PendingInvitationsList({
  invitations,
}: PendingInvitationsListProps) {
  if (invitations.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        No hay invitaciones pendientes.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {invitations.map((invitation) => (
        <article
          key={invitation.id}
          className="rounded-lg border border-slate-200 bg-white p-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">
                {invitation.email}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Rol: {invitation.role === "admin" ? "Admin" : "Staff"}
              </p>
            </div>
            <div className="text-xs text-slate-500">
              Expira: {formatDate(invitation.expires_at)}
            </div>
          </div>

          <p className="mt-3 text-xs text-slate-600">
            Token de invitacion (compartelo con el colaborador):
          </p>
          <p className="mt-1 break-all rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
            {invitation.token}
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Creada: {formatDate(invitation.created_at)}
          </p>
        </article>
      ))}
    </div>
  );
}
