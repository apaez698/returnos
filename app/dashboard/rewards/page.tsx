import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { searchRewardCustomers } from "@/features/rewards/queries/search-reward-customers";
import { SearchableRewardsPanel } from "@/features/rewards/components/searchable-rewards-panel";
import { RewardForm } from "@/components/rewards/reward-form";
import { RewardRulesTable } from "@/components/rewards/reward-rules-table";
import { getRewardRulesForCurrentBusiness } from "@/lib/rewards/data";
import { createRewardRuleAction, redeemRewardAction } from "./actions";

export default async function DashboardRewardsPage() {
  let rewards: Awaited<ReturnType<typeof getRewardRulesForCurrentBusiness>> =
    [];
  let searchableCustomers: Awaited<ReturnType<typeof searchRewardCustomers>> = {
    items: [],
    total_count: 0,
  };
  let error: string | null = null;

  try {
    rewards = await getRewardRulesForCurrentBusiness();

    try {
      searchableCustomers = await searchRewardCustomers({ limit: 250 });
    } catch {
      searchableCustomers = { items: [], total_count: 0 };
    }
  } catch (err) {
    if (err instanceof Error) {
      error = err.message;
    } else {
      error = "No se pudo cargar el módulo de recompensas.";
    }
  }

  const activeRewards = rewards.filter((r) => r.is_active);

  return (
    <DashboardLayout pageTitle="Recompensas">
      <div className="space-y-6">
        <section>
          <p className="text-slate-600">
            Gestiona reglas de recompensas para fidelizar a tus clientes. Define
            cuántos puntos necesitan para obtener premios especiales.
          </p>
        </section>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <p className="font-medium">No se puede acceder a las recompensas</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!error && (
          <>
            <section>
              <RewardForm action={createRewardRuleAction} />
            </section>

            <section>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">
                Reglas de recompensa
              </h2>
              <RewardRulesTable rewards={rewards} />
            </section>

            {activeRewards.length > 0 ? (
              <section>
                <h2 className="mb-3 text-lg font-semibold text-slate-900">
                  Progreso de clientes
                </h2>
                <p className="mb-4 text-sm text-slate-600">
                  Visualiza el progreso de cada cliente hacia sus recompensas.
                </p>
                <SearchableRewardsPanel
                  initialItems={searchableCustomers.items}
                  redeemAction={redeemRewardAction}
                />
              </section>
            ) : (
              <section className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
                <p className="font-medium">No hay recompensas activas</p>
                <p className="mt-1">
                  Crea y activa una recompensa para que los clientes puedan
                  verla en el progreso.
                </p>
              </section>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
