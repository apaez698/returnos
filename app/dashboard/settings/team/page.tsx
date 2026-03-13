import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { inviteCollaboratorAction } from "@/features/team/actions/invite-collaborator";
import { InviteCollaboratorForm } from "@/features/team/components/invite-collaborator-form";
import { PendingInvitationsList } from "@/features/team/components/pending-invitations-list";
import { TeamMembersTable } from "@/features/team/components/team-members-table";
import { requireBusinessMembership } from "@/lib/auth/require-business-membership";
import { canManageTeam } from "@/lib/team/role-permissions";
import { createServerClient } from "@/lib/supabase/server";

interface TeamMemberRow {
  id: string;
  user_id: string;
  user_email: string | null;
  role: "owner" | "admin" | "staff";
  created_at: string;
}

interface PendingInvitationRow {
  id: string;
  email: string;
  role: "admin" | "staff";
  token: string;
  expires_at: string;
  created_at: string;
}

export default async function DashboardTeamSettingsPage() {
  const membership = await requireBusinessMembership();
  const supabase = createServerClient();

  let members: TeamMemberRow[] = [];
  let invitations: PendingInvitationRow[] = [];
  let error: string | null = null;

  try {
    const [
      { data: membersData, error: membersError },
      { data: invitationsData, error: invitationsError },
    ] = await Promise.all([
      supabase
        .from("business_users")
        .select("id, user_id, user_email, role, created_at")
        .eq("business_id", membership.businessId)
        .order("created_at", { ascending: true }),
      supabase
        .from("business_invitations")
        .select("id, email, role, token, expires_at, created_at")
        .eq("business_id", membership.businessId)
        .eq("status", "pending")
        .order("created_at", { ascending: false }),
    ]);

    if (membersError) {
      throw new Error("No se pudo cargar el equipo.");
    }

    if (invitationsError) {
      throw new Error("No se pudieron cargar invitaciones pendientes.");
    }

    members = (membersData ?? []) as TeamMemberRow[];
    invitations = (invitationsData ?? []) as PendingInvitationRow[];
  } catch (err) {
    error = err instanceof Error ? err.message : "No se pudo cargar el equipo.";
  }

  const canManage = canManageTeam(membership.role);

  return (
    <DashboardLayout pageTitle="Equipo">
      <div className="space-y-6">
        <section>
          <p className="text-slate-600">
            Administra colaboradores de tu negocio. Owner y admin pueden enviar
            invitaciones y definir el rol (admin o staff).
          </p>
        </section>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">No se puede acceder al equipo</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : null}

        {!error && canManage ? (
          <section>
            <InviteCollaboratorForm action={inviteCollaboratorAction} />
          </section>
        ) : null}

        {!error && !canManage ? (
          <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            Tu rol es staff y no puede invitar colaboradores ni cambiar
            asociaciones de negocio.
          </section>
        ) : null}

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Miembros del equipo
          </h2>
          {error ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No se puede mostrar el listado de miembros en este momento.
            </div>
          ) : (
            <TeamMembersTable members={members} />
          )}
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900">
            Invitaciones pendientes
          </h2>
          {error ? (
            <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
              No se puede mostrar el listado de invitaciones en este momento.
            </div>
          ) : (
            <PendingInvitationsList invitations={invitations} />
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
