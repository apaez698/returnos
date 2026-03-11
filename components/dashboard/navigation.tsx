import Link from "next/link";

interface NavItem {
  label: string;
  href: string;
  icon: string;
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" },
  { label: "Customers", href: "/customers", icon: "👥" },
  { label: "Visits", href: "/dashboard/visits", icon: "📍" },
  { label: "Rewards", href: "/rewards", icon: "🎁" },
  { label: "Campaigns", href: "/campaigns", icon: "📢" },
];

export function DashboardNavigation() {
  return (
    <nav className="bg-slate-900 text-white w-64 min-h-screen p-6">
      <div className="space-y-8">
        <div className="font-bold text-xl">ReturnOS</div>
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
