import type { MembershipRole } from "@/lib/auth/membership-types";
import { LogoutButton } from "./logout-button";

const ROLE_LABELS: Record<string, string> = {
  owner: "Propietario",
  admin: "Administrador",
  staff: "Colaborador",
};

interface UserMenuProps {
  email: string;
  role?: MembershipRole | null;
}

export function UserMenu({ email, role }: UserMenuProps) {
  const initial = email.charAt(0).toUpperCase();
  const roleLabel = role ? (ROLE_LABELS[role] ?? role) : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <div
          className="w-8 h-8 rounded-full bg-slate-600 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <span className="text-white text-xs font-medium">{initial}</span>
        </div>
        <div className="min-w-0">
          <span
            className="text-xs text-slate-300 truncate block leading-snug"
            title={email}
          >
            {email}
          </span>
          {roleLabel && (
            <span className="text-xs text-slate-500 block">{roleLabel}</span>
          )}
        </div>
      </div>
      <LogoutButton />
    </div>
  );
}
