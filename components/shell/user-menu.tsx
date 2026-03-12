import { LogoutButton } from "./logout-button";

interface UserMenuProps {
  email: string;
}

export function UserMenu({ email }: UserMenuProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span
        className="text-xs text-slate-400 truncate max-w-[176px]"
        title={email}
      >
        {email}
      </span>
      <LogoutButton />
    </div>
  );
}
