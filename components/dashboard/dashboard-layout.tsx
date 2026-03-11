import { ReactNode } from "react";
import { DashboardNavigation } from "./navigation";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
}

export function DashboardLayout({ children, pageTitle }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <DashboardNavigation />
      <div className="flex-1">
        <header className="bg-white border-b border-slate-200 px-8 py-6">
          <h1 className="text-3xl font-bold text-slate-900">{pageTitle}</h1>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
