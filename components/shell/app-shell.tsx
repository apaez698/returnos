import { ReactNode } from "react";
import type { MembershipRole } from "@/lib/auth/membership-types";
import { BusinessBrand } from "./business-brand";
import { UserMenu } from "./user-menu";
import { AppNav } from "./app-nav";

interface AppShellProps {
  children: ReactNode;
  businessName: string;
  businessType: string;
  businessLogoUrl?: string | null;
  userEmail: string;
  userRole?: MembershipRole | null;
}

export function AppShell({
  children,
  businessName,
  businessType,
  businessLogoUrl,
  userEmail,
  userRole,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside
        className="bg-slate-900 text-white w-52 md:w-52 lg:w-60 h-screen sticky top-0 flex flex-col flex-shrink-0"
        aria-label="Sidebar"
      >
        <div className="px-4 py-5 border-b border-slate-700/60">
          <BusinessBrand
            name={businessName}
            type={businessType}
            logoUrl={businessLogoUrl}
          />
        </div>
        <div className="flex-1 overflow-y-auto py-4">
          <AppNav />
        </div>
        <div className="px-4 py-4 border-t border-slate-700/60">
          <UserMenu email={userEmail} role={userRole} />
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">{children}</div>
    </div>
  );
}
