import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { RewardForm } from "@/components/rewards/reward-form";
import { RewardRulesTable } from "@/components/rewards/reward-rules-table";
import { RedeemRewardButton } from "@/components/rewards/redeem-reward-button";
import {
  getRewardRulesForCurrentBusiness,
  getCustomerRewardProgressList,
} from "@/lib/rewards/data";
import { createRewardRuleAction, redeemRewardAction } from "./actions";

export default async function DashboardRewardsPage() {
  let rewards: Awaited<ReturnType<typeof getRewardRulesForCurrentBusiness>> =
    [];
  let customerProgress: Awaited<
    ReturnType<typeof getCustomerRewardProgressList>
  > = [];
  let error: string | null = null;

  try {
    [rewards, customerProgress] = await Promise.all([
      getRewardRulesForCurrentBusiness(),
      getCustomerRewardProgressList(),
    ]);
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

                {customerProgress.length === 0 ? (
                  <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
                    <p className="text-sm text-slate-600">
                      No hay clientes registrados aún.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {customerProgress.map((customer) => {
                      const statusBadgeClass =
                        customer.status === "redeemable"
                          ? "bg-emerald-100 text-emerald-800"
                          : customer.status === "in_progress"
                            ? "bg-indigo-100 text-indigo-800"
                            : "bg-slate-100 text-slate-700";
                      const statusLabel =
                        customer.status === "redeemable"
                          ? "Canjeable"
                          : customer.status === "in_progress"
                            ? "En progreso"
                            : "Sin recompensa";

                      return (
                        <article
                          key={customer.customer_id}
                          className="rounded-lg border border-slate-200 bg-white p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold text-slate-900">
                                {customer.customer_name}
                              </h3>
                              <p className="mt-1 text-sm text-slate-600">
                                {customer.current_points} puntos
                              </p>
                            </div>
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusBadgeClass}`}
                            >
                              {statusLabel}
                            </span>
                          </div>

                          <div className="mt-4 space-y-3">
                            {customer.redeemable_reward && (
                              <section className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
                                  Recompensa disponible
                                </p>
                                <p className="mt-1 text-sm font-medium text-emerald-900">
                                  {customer.redeemable_reward.name}
                                </p>
                                <p className="mt-1 text-xs text-emerald-800/90">
                                  {
                                    customer.redeemable_reward
                                      .reward_description
                                  }
                                </p>

                                <RedeemRewardButton
                                  customerId={customer.customer_id}
                                  customerName={customer.customer_name}
                                  currentPoints={customer.current_points}
                                  rewardRuleId={customer.redeemable_reward.id}
                                  rewardName={customer.redeemable_reward.name}
                                  pointsRequired={
                                    customer.redeemable_reward.points_required
                                  }
                                  action={redeemRewardAction}
                                />
                              </section>
                            )}

                            {customer.next_reward && (
                              <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
                                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                                  Próxima meta
                                </p>
                                <p className="mt-1 text-sm font-medium text-slate-900">
                                  {customer.next_reward.name}
                                </p>
                                <p className="mt-1 text-xs text-slate-500">
                                  {customer.next_reward.reward_description}
                                </p>

                                <div className="mt-3 flex items-center gap-2">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                                    <div
                                      className="h-full bg-indigo-600 transition-all"
                                      style={{
                                        width: `${customer.progress_percentage_to_next}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="whitespace-nowrap text-xs font-semibold text-slate-700">
                                    {customer.progress_percentage_to_next}%
                                  </span>
                                </div>
                                <p className="mt-2 text-xs text-slate-500">
                                  {customer.remaining_points_to_next} puntos
                                  para la siguiente recompensa.
                                </p>
                              </section>
                            )}

                            {!customer.redeemable_reward &&
                              !customer.next_reward && (
                                <p className="text-sm text-slate-500">
                                  No hay recompensas activas para este cliente.
                                </p>
                              )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
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
