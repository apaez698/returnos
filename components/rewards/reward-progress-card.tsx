"use client";

import { calculateRewardProgress } from "@/lib/rewards/progress";
import { CustomerRewardProgress, RewardRule } from "@/lib/rewards/types";

interface RewardProgressCardProps {
  customer: Pick<
    CustomerRewardProgress,
    "customer_id" | "customer_name" | "current_points"
  >;
  rewardRules: RewardRule[];
}

export function RewardProgressCard({
  customer,
  rewardRules,
}: RewardProgressCardProps) {
  const progress = calculateRewardProgress(
    customer.current_points,
    rewardRules,
  );
  const statusLabel =
    progress.status === "redeemable"
      ? "Premio disponible"
      : progress.status === "in_progress"
        ? "En progreso"
        : "Sin recompensa";
  const badgeClassName =
    progress.status === "redeemable"
      ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800"
      : progress.status === "in_progress"
        ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800"
        : "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {customer.customer_name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {customer.current_points} puntos
          </p>
        </div>
        <span className={badgeClassName}>{statusLabel}</span>
      </div>

      {progress.reward ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">
            {progress.reward.name}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {progress.reward.reward_description}
          </p>

          {progress.status === "in_progress" && (
            <>
              <div className="mt-3 flex items-center justify-between gap-2">
                <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full transition-all"
                    style={{ width: `${progress.progress_percentage}%` }}
                  />
                </div>
                <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                  {progress.progress_percentage}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {progress.remaining_points} puntos faltantes
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-500">
          Sin recompensa por ahora.
        </div>
      )}
    </div>
  );
}
