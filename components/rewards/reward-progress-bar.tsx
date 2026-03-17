"use client";

import { ReactNode } from "react";

interface RewardProgressBarProps {
  /**
   * Points needed to reach the next reward
   */
  remainingPoints: number;
  /**
   * Total points required for the reward
   */
  totalPoints?: number;
  /**
   * Progress percentage (0-100)
   */
  progressPercentage: number;
  /**
   * Name of the reward (e.g., "café gratis", "Descuento 20%")
   */
  rewardName?: string;
  /**
   * Optional label text above the bar (overrides default)
   */
  label?: ReactNode;
  /**
   * Whether to show the percentage badge
   */
  showPercentage?: boolean;
  /**
   * Color theme (indigo, amber, emerald)
   */
  colorTheme?: "indigo" | "amber" | "emerald";
}

const colorThemes = {
  indigo: {
    background: "bg-slate-100",
    fill: "bg-indigo-600",
    label: "text-indigo-900",
  },
  amber: {
    background: "bg-amber-100",
    fill: "bg-amber-500",
    label: "text-amber-900",
  },
  emerald: {
    background: "bg-emerald-100",
    fill: "bg-emerald-600",
    label: "text-emerald-900",
  },
};

export function RewardProgressBar({
  remainingPoints,
  totalPoints,
  progressPercentage,
  rewardName,
  label,
  showPercentage = true,
  colorTheme = "indigo",
}: RewardProgressBarProps) {
  const theme = colorThemes[colorTheme];
  const normalizedProgress = Math.min(
    100,
    Math.max(0, Math.round(progressPercentage)),
  );

  const defaultLabel = rewardName
    ? `${remainingPoints} pts para ${rewardName}`
    : `${remainingPoints} puntos para desbloquear`;

  return (
    <div className="w-full">
      {/* Label above progress bar */}
      <div className="flex items-center justify-between gap-3 mb-2">
        <p className={`text-sm font-bold ${theme.label} truncate`}>
          {label || defaultLabel}
        </p>
        {showPercentage && (
          <span className="inline-flex items-center rounded-full px-2 py-1 bg-slate-100 text-xs font-semibold text-slate-700 whitespace-nowrap">
            {normalizedProgress}%
          </span>
        )}
      </div>

      {/* Progress bar with rounded corners */}
      <div
        className={`relative h-3 w-full overflow-hidden rounded-full ${theme.background} shadow-sm`}
      >
        <div
          className={`h-full rounded-full ${theme.fill} transition-all duration-500 ease-out`}
          style={{ width: `${normalizedProgress}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={normalizedProgress}
          aria-label={`Progreso hacia ${rewardName || "recompensa"}`}
        />
      </div>

      {/* Optional helper text below */}
      {totalPoints && (
        <p className="mt-1.5 text-xs text-slate-500">
          Puntos actuales / Total: Información disponible en detalles
        </p>
      )}
    </div>
  );
}
