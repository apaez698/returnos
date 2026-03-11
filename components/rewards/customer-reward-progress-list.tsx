"use client";

import { CustomerRewardProgress } from "@/lib/rewards/types";

interface CustomerRewardProgressListProps {
  progressList: CustomerRewardProgress[];
}

export function CustomerRewardProgressList({
  progressList,
}: CustomerRewardProgressListProps) {
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "redeemable":
        return "¡Canjeable!";
      case "in_progress":
        return "En progreso";
      default:
        return "Sin recompensa";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "redeemable":
        return "bg-emerald-100 text-emerald-800";
      case "in_progress":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (progressList.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">
          No hay clientes con recompensas disponibles.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Mobile card view */}
      <div className="space-y-3 md:hidden">
        {progressList.map((progress) => (
          <article
            key={progress.customer_id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 truncate">
                  {progress.customer_name}
                </h3>
                <p className="text-xs text-slate-600 mt-1">
                  {progress.current_points} puntos
                </p>
              </div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium whitespace-nowrap ${getStatusColor(progress.status)}`}
              >
                {getStatusLabel(progress.status)}
              </span>
            </div>

            {progress.nearest_reward ? (
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-slate-700">
                    {progress.nearest_reward.name}
                  </p>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {progress.nearest_reward.reward_description}
                  </p>
                </div>

                {progress.status === "in_progress" && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-indigo-600 h-full transition-all"
                          style={{ width: `${progress.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">
                      {progress.remaining_points} pts faltantes
                    </p>
                  </div>
                )}

                {progress.status === "redeemable" && (
                  <div className="rounded-md bg-emerald-50 px-2 py-1 text-xs text-emerald-800">
                    El cliente puede reclamar esta recompensa
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500">
                No hay recompensas activas disponibles
              </p>
            )}
          </article>
        ))}
      </div>

      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="divide-x divide-slate-200">
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Cliente
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Puntos
              </th>
              <th className="px-4 py-3 text-left font-semibold text-slate-900">
                Recompensa
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900">
                Progreso
              </th>
              <th className="px-4 py-3 text-center font-semibold text-slate-900">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {progressList.map((progress) => (
              <tr
                key={progress.customer_id}
                className="divide-x divide-slate-200"
              >
                <td className="px-4 py-3 text-slate-900 font-medium">
                  {progress.customer_name}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {progress.current_points}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {progress.nearest_reward ? (
                    <div>
                      <p className="font-medium text-slate-900">
                        {progress.nearest_reward.name}
                      </p>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        {progress.nearest_reward.reward_description}
                      </p>
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {progress.status === "in_progress" ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-200 rounded-full h-1.5 overflow-hidden min-w-20">
                        <div
                          className="bg-indigo-600 h-full transition-all"
                          style={{ width: `${progress.progress_percentage}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-slate-700 whitespace-nowrap w-10">
                        {progress.progress_percentage}%
                      </span>
                    </div>
                  ) : progress.status === "redeemable" ? (
                    <span className="text-emerald-600 font-medium">100%</span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(progress.status)}`}
                  >
                    {getStatusLabel(progress.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
