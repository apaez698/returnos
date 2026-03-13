interface TeamMember {
  id: string;
  user_id: string;
  user_email: string | null;
  role: "owner" | "admin" | "staff";
  created_at: string;
}

interface TeamMembersTableProps {
  members: TeamMember[];
}

function formatRole(role: TeamMember["role"]): string {
  if (role === "owner") return "Owner";
  if (role === "admin") return "Admin";
  return "Staff";
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

export function TeamMembersTable({ members }: TeamMembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Todavia no hay colaboradores en este negocio.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="px-4 py-3 font-semibold">Correo</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Fecha alta</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-slate-700">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-3">{member.user_email ?? "-"}</td>
              <td className="px-4 py-3">{formatRole(member.role)}</td>
              <td className="px-4 py-3">{formatDate(member.created_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
