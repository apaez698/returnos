import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { CampaignForm } from "@/components/campaigns/campaign-form";
import { CampaignsList } from "@/components/campaigns/campaigns-list";
import { buildReactivationCampaignSuggestions } from "@/lib/campaigns/suggestions";
import type { CampaignRecord } from "@/lib/campaigns/types";
import { getCurrentBusinessId } from "@/lib/businesses/current-business";
import { getCustomersWithPointsForCurrentBusiness } from "@/lib/customers/data";
import {
  getInactiveCustomers,
  type InactiveCustomer,
} from "@/lib/customers/inactivity";
import { createServerClient } from "@/lib/supabase/server";
import { createCampaignAction } from "./actions";

async function getCampaignsForCurrentBusiness(): Promise<CampaignRecord[]> {
  const businessId = await getCurrentBusinessId();
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(
      "id, business_id, name, campaign_type, audience_type, message, target_inactive_days, status, scheduled_at, sent_at, total_messages, messages_sent, messages_failed, created_at",
    )
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("No se pudieron cargar las campanas.");
  }

  return (data ?? []) as CampaignRecord[];
}

export default async function DashboardCampaignsPage() {
  let campaigns: CampaignRecord[] = [];
  let inactiveCount = 0;
  let inactiveCustomers: InactiveCustomer[] = [];
  let error: string | null = null;

  try {
    const [customers, campaignRows] = await Promise.all([
      getCustomersWithPointsForCurrentBusiness(),
      getCampaignsForCurrentBusiness(),
    ]);

    campaigns = campaignRows;
    inactiveCustomers = getInactiveCustomers(customers, 14);
    inactiveCount = inactiveCustomers.length;
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar el modulo de campanas.";
    }
  }

  const suggestions = buildReactivationCampaignSuggestions({
    inactiveCustomers,
    targetInactiveDays: 14,
  });

  return (
    <DashboardLayout pageTitle="Campanas">
      <div className="space-y-6">
        <section className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Campanas de reactivacion
          </h1>
          <p className="dashboard-explainer text-sm text-slate-600 sm:text-base">
            Crea campanas para clientes con 14+ dias sin visitar. Puedes crear
            una campana directamente desde una sugerencia o editarla antes de
            guardar.
          </p>
          <p className="text-sm text-slate-500">
            Clientes inactivos detectados: <strong>{inactiveCount}</strong>
          </p>
        </section>

        {error ? (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">No se pudo cargar campanas</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <>
            <CampaignForm
              action={createCampaignAction}
              suggestions={suggestions}
            />

            <section className="space-y-3">
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Campanas creadas
              </h2>
              <CampaignsList campaigns={campaigns} />
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
