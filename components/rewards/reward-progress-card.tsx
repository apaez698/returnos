"use client";

import { calculateRewardProgress } from "@/lib/rewards/progress";
import { CustomerRewardProgress, RewardRule } from "@/lib/rewards/types";
import { RewardProgressBar } from "./reward-progress-bar";

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
      ? "Recompensa disponible"
      : progress.status === "in_progress"
        ? "En progreso"
        : "Sin recompensa";
  const badgeClassName =
    progress.status === "redeemable"
      ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800"
      : progress.status === "in_progress"
        ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800"
        : "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-700";
  const hasNextGoal = progress.nextReward !== null;

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

      {progress.status === "in_progress" && progress.nextReward && (
        <section className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
            Progreso actual
          </p>
          <p className="mt-1 text-sm font-medium text-slate-900">
            {progress.nextReward.name}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {progress.nextReward.reward_description}
          </p>

          <div className="mt-3">
            <RewardProgressBar
              remainingPoints={progress.remainingPointsToNext}
              progressPercentage={progress.progressPercentageToNext}
              rewardName={progress.nextReward.name}
              colorTheme="indigo"
              showPercentage={true}
            />
          </div>
        </section>
      )}

      {progress.status === "redeemable" && progress.redeemableReward && (
        <div className="mt-4 space-y-3">
          <section className="rounded-md border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Recompensa disponible
            </p>
            <p className="mt-1 text-sm font-medium text-emerald-900">
              {progress.redeemableReward.name}
            </p>
            <p className="mt-1 text-xs text-emerald-800/90">
              {progress.redeemableReward.reward_description}
            </p>
          </section>

          {hasNextGoal && progress.nextReward ? (
            <section className="rounded-md border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                Próxima meta
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {progress.nextReward.name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {progress.nextReward.reward_description}
              </p>

              <div className="mt-3">
                <RewardProgressBar
                  remainingPoints={progress.remainingPointsToNext}
                  progressPercentage={progress.progressPercentageToNext}
                  rewardName={progress.nextReward.name}
                  colorTheme="indigo"
                  showPercentage={true}
                />
              </div>
            </section>
          ) : (
            <p className="text-xs text-slate-500">Highest reward reached.</p>
          )}
        </div>
      )}

      {progress.status === "no_reward" && (
        <p className="mt-4 text-sm text-slate-500">
          No rewards available yet for this customer.
        </p>
      )}
    </div>
  );
}
