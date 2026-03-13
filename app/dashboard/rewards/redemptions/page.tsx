import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import RedemptionsPageClient from "./page-client";
import { getRedemptionsForCurrentBusiness } from "@/lib/rewards/data";

export default async function RedemptionsPage() {
  let redemptions: Awaited<
    ReturnType<typeof getRedemptionsForCurrentBusiness>
  > = {
    items: [],
    total_count: 0,
  };
  let error: string | null = null;

  try {
    redemptions = await getRedemptionsForCurrentBusiness({ limit: 500 });
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar el historial de canjes.";
    }
  }

  return (
    <DashboardLayout pageTitle="Historial de canjes">
      <RedemptionsPageClient
        initialRedemptions={redemptions.items}
        error={error}
      />
    </DashboardLayout>
  );
}
