import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { requireBusinessMembership } from "@/lib/auth/require-business-membership";
import { AppShell } from "@/components/shell/app-shell";

export default async function DashboardShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, business] = await Promise.all([
    getCurrentUser(),
    requireBusinessMembership(),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <AppShell
      businessName={business.business.name}
      businessType={business.business.business_type}
      userEmail={user.email}
    >
      {children}
    </AppShell>
  );
}
