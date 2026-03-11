"use client";

import { RewardRule } from "@/lib/rewards/types";
import {
  toggleRewardRuleAction,
  deleteRewardRuleAction,
} from "@/app/dashboard/rewards/actions";
import { useState } from "react";

interface RewardRulesTableProps {
  rewards: RewardRule[];
}

export function RewardRulesTable({ rewards }: RewardRulesTableProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  const handleToggle = async (ruleId: string) => {
    setIsToggling(ruleId);
    try {
      await toggleRewardRuleAction(ruleId);
      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error toggling reward", error);
      setIsToggling(null);
    }
  };

  const handleDelete = async (ruleId: string) => {
    if (!confirm("¿Estás seguro que deseas eliminar esta regla?")) return;

    setIsDeleting(ruleId);
    try {
      await deleteRewardRuleAction(ruleId);
      // Reload the page to refresh the data
      window.location.reload();
    } catch (error) {
      console.error("Error deleting reward", error);
      setIsDeleting(null);
    }
  };

  if (rewards.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center">
        <p className="text-sm text-slate-600">
          No hay reglas de recompensa. Crea la primera para empezar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="space-y-3 md:hidden">
        {rewards.map((reward) => (
          <article
            key={reward.id}
            className="rounded-lg border border-slate-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {reward.name}
                </h3>
                <p className="mt-1 text-xs text-slate-600">
                  {reward.points_required} pts
                </p>
              </div>
              {reward.is_active ? (
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
                  Activa
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  Inactiva
                </span>
              )}
            </div>

            <p className="mt-3 text-sm text-slate-600">
              {reward.reward_description}
            </p>

            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => handleToggle(reward.id)}
                disabled={isToggling === reward.id}
                className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition disabled:text-slate-400"
              >
                {isToggling === reward.id
                  ? "..."
                  : reward.is_active
                    ? "Desactivar"
                    : "Activar"}
              </button>
              <button
                onClick={() => handleDelete(reward.id)}
                disabled={isDeleting === reward.id}
                className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition disabled:text-slate-400"
              >
                {isDeleting === reward.id ? "..." : "Eliminar"}
              </button>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-slate-200 bg-white md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Nombre
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Puntos requeridos
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Descripción
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Estado
              </th>
              <th className="px-6 py-3 text-left font-semibold text-slate-900">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {rewards.map((reward) => (
              <tr key={reward.id} className="transition hover:bg-slate-50">
                <td className="px-6 py-4 font-medium text-slate-900">
                  {reward.name}
                </td>
                <td className="px-6 py-4 text-slate-600">
                  {reward.points_required} pts
                </td>
                <td className="max-w-xs truncate px-6 py-4 text-slate-600">
                  {reward.reward_description}
                </td>
                <td className="px-6 py-4">
                  {reward.is_active ? (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                      Activa
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      Inactiva
                    </span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(reward.id)}
                      disabled={isToggling === reward.id}
                      className="rounded px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition disabled:text-slate-400"
                    >
                      {isToggling === reward.id
                        ? "..."
                        : reward.is_active
                          ? "Desactivar"
                          : "Activar"}
                    </button>
                    <button
                      onClick={() => handleDelete(reward.id)}
                      disabled={isDeleting === reward.id}
                      className="rounded px-2 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 transition disabled:text-slate-400"
                    >
                      {isDeleting === reward.id ? "..." : "Eliminar"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
