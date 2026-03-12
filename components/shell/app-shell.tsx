import Link from "next/link";
import { ReactNode } from "react";
import { BusinessBrand } from "./business-brand";
import { UserMenu } from "./user-menu";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Clientes", href: "/dashboard/customers", icon: "👥" },
  { label: "Caja", href: "/dashboard/caja", icon: "🧾" },
  { label: "Inactivos", href: "/dashboard/inactive-customers", icon: "⏳" },
  { label: "Visitas", href: "/dashboard/visits", icon: "📍" },
  { label: "Recompensas", href: "/dashboard/rewards", icon: "🎁" },
  { label: "Campañas", href: "/dashboard/campaigns", icon: "📢" },
];

interface AppShellProps {
  children: ReactNode;
  businessName: string;
  businessType: string;
  userEmail: string;
}

export function AppShell({
  children,
  businessName,
  businessType,
  userEmail,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <nav
        className="bg-slate-900 text-white w-64 h-screen sticky top-0 flex flex-col flex-shrink-0 overflow-y-auto"
        aria-label="Navegación principal"
      >
        <div className="p-6 flex-1 space-y-8">
          <BusinessBrand name={businessName} type={businessType} />
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-slate-800 transition-colors text-sm"
                >
                  <span aria-hidden="true">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="p-6 border-t border-slate-700">
          <UserMenu email={userEmail} />
        </div>
      </nav>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
