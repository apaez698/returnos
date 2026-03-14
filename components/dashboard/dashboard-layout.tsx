import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  pageTitle: string;
  hideHeaderOnIpad?: boolean;
}

export function DashboardLayout({
  children,
  pageTitle,
  hideHeaderOnIpad = false,
}: DashboardLayoutProps) {
  return (
    <div className="flex-1">
      <header
        className={[
          "bg-white border-b border-slate-200 px-3 py-3 md:px-4 md:py-3 lg:px-8 lg:py-6",
          hideHeaderOnIpad ? "dashboard-ipad-hide-header" : "",
        ].join(" ")}
      >
        <h1 className="text-xl font-bold text-slate-900 md:text-2xl lg:text-3xl">
          {pageTitle}
        </h1>
      </header>
      <main className="dashboard-main p-3 md:p-4 lg:p-8">{children}</main>
    </div>
  );
}
