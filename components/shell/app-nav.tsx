"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Caja (POS)", href: "/dashboard/caja", icon: "🧾" },
  { label: "Clientes", href: "/dashboard/customers", icon: "👥" },
  { label: "Recompensas", href: "/dashboard/rewards", icon: "🎁" },
  { label: "Campañas", href: "/dashboard/campaigns", icon: "📢" },
];

const managementNavItems: NavItem[] = [
  { label: "Visitas", href: "/dashboard/visits", icon: "📍" },
  { label: "Inactivos", href: "/dashboard/inactive-customers", icon: "⏳" },
  { label: "Equipo", href: "/dashboard/settings/team", icon: "🛠️" },
];

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
        active
          ? "bg-slate-800 text-white font-medium"
          : "text-slate-300 hover:bg-slate-800 hover:text-white"
      }`}
    >
      <span aria-hidden="true">{item.icon}</span>
      <span>{item.label}</span>
    </Link>
  );
}

export function AppNav() {
  const pathname = usePathname();

  function isActive(href: string): boolean {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
    <nav aria-label="Navegación principal" className="space-y-6">
      <ul className="space-y-0.5 px-4" role="list">
        {mainNavItems.map((item) => (
          <li key={item.href}>
            <NavLink item={item} active={isActive(item.href)} />
          </li>
        ))}
      </ul>

      <div>
        <p className="px-8 mb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
          Gestión
        </p>
        <ul className="space-y-0.5 px-4" role="list">
          {managementNavItems.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
