import type { RewardCustomerSearchItem } from "@/lib/rewards/reward-customer-types";
import {
  RedeemRewardButton,
  type RedeemRewardResult,
} from "@/components/rewards/redeem-reward-button";

interface RewardsCustomerCardProps {
  customer: RewardCustomerSearchItem;
  redeemAction?: (
    previousState: RedeemRewardResult,
    formData: FormData,
  ) => Promise<RedeemRewardResult>;
}

function getStatusUi(status: RewardCustomerSearchItem["reward_status"]) {
  switch (status) {
    case "eligible":
      return {
        label: "Canjeable",
        className: "bg-emerald-100 text-emerald-800",
      };
    case "redeemed":
      return {
        label: "Canjeo previo",
        className: "bg-sky-100 text-sky-800",
      };
    case "near_unlock":
      return {
        label: "Cerca de premio",
        className: "bg-amber-100 text-amber-800",
      };
    case "active":
      return {
        label: "Activo",
        className: "bg-indigo-100 text-indigo-800",
      };
    default:
      return {
        label: "Sin actividad",
        className: "bg-slate-100 text-slate-700",
      };
  }
}

export function RewardsCustomerCard({
  customer,
  redeemAction,
}: RewardsCustomerCardProps) {
  const statusUi = getStatusUi(customer.reward_status);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {customer.customer_name}
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            {customer.customer_phone || "Sin telefono"}
          </p>
        </div>
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${statusUi.className}`}
        >
          {statusUi.label}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Puntos actuales</span>
          <span className="font-semibold text-slate-900">
            {customer.current_points}
          </span>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>Progreso a proxima recompensa</span>
            <span className="font-medium text-slate-700">
              {customer.progress_percentage_to_next}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-indigo-600 transition-all"
              style={{ width: `${customer.progress_percentage_to_next}%` }}
            />
          </div>
          <p className="mt-1 text-xs text-slate-500">
            {customer.remaining_points_to_next} puntos para desbloquear.
          </p>
        </div>

        {customer.redeemable_reward_name ? (
          <section className="rounded-md border border-emerald-200 bg-emerald-50 p-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Recompensa disponible
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-900">
              {customer.redeemable_reward_name}
            </p>
            {customer.redeemable_reward_description ? (
              <p className="mt-1 text-xs text-emerald-800/90">
                {customer.redeemable_reward_description}
              </p>
            ) : null}

            {redeemAction &&
            customer.redeemable_reward_id &&
            customer.redeemable_reward_points_required !== null ? (
              <RedeemRewardButton
                customerId={customer.customer_id}
                customerName={customer.customer_name}
                currentPoints={customer.current_points}
                rewardRuleId={customer.redeemable_reward_id}
                rewardName={customer.redeemable_reward_name}
                pointsRequired={customer.redeemable_reward_points_required}
                action={redeemAction}
              />
            ) : null}
          </section>
        ) : customer.next_reward_name ? (
          <section className="rounded-md border border-slate-200 bg-slate-50 p-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Proxima meta
            </p>
            <p className="mt-1 text-sm font-medium text-slate-900">
              {customer.next_reward_name}
            </p>
            {customer.next_reward_description ? (
              <p className="mt-1 text-xs text-slate-500">
                {customer.next_reward_description}
              </p>
            ) : null}
          </section>
        ) : (
          <p className="text-xs text-slate-500">Sin recompensas activas.</p>
        )}
      </div>
    </article>
  );
}
