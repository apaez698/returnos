"use client";

import { CustomerRewardProgress } from "@/lib/rewards/types";

interface RewardProgressCardProps {
  progress: CustomerRewardProgress;
}

export function RewardProgressCard({ progress }: RewardProgressCardProps) {
  const statusLabel =
    progress.status === "eligible"
      ? "¡Elegible!"
      : progress.status === "in_progress"
        ? "En progreso"
        : "Sin recompensa";
  const isEligible = progress.status === "eligible";

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-sm transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <h3 className="font-semibold text-slate-900">
            {progress.customer_name}
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            {progress.current_points} puntos
          </p>
        </div>
        <span
          className={
            isEligible
              ? "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-800"
              : "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-indigo-100 text-indigo-800"
          }
        >
          {statusLabel}
        </span>
      </div>

      {progress.nearest_reward ? (
        <div className="mt-4">
          <p className="text-sm font-medium text-slate-700">
            {progress.nearest_reward.name}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {progress.nearest_reward.reward_description}
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

          {progress.status === "eligible" && (
            <div className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              ¡El cliente puede reclamar esta recompensa!
            </div>
          )}
        </div>
      ) : (
        <div className="mt-4 text-sm text-slate-500">
          No hay recompensas activas disponibles.
        </div>
      )}
    </div>
  );
}
