import { PosRewardThreshold } from "@/lib/pos/types";

interface PurchaseRewardProgressProps {
  updatedPoints: number;
  rewardThresholds: PosRewardThreshold[];
  unlockedRewardName?: string | null;
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}

function getNextReward(
  updatedPoints: number,
  rewardThresholds: PosRewardThreshold[],
): PosRewardThreshold | null {
  const activeThresholds = rewardThresholds
    .filter((reward) => reward.is_active)
    .sort((a, b) => a.points_required - b.points_required);

  return (
    activeThresholds.find((reward) => reward.points_required > updatedPoints) ??
    null
  );
}

export function PurchaseRewardProgress({
  updatedPoints,
  rewardThresholds,
  unlockedRewardName,
}: PurchaseRewardProgressProps) {
  const nextReward = getNextReward(updatedPoints, rewardThresholds);
  const hasRewards = rewardThresholds.some((reward) => reward.is_active);
  const targetPoints = nextReward?.points_required ?? null;
  const remainingPoints = targetPoints
    ? Math.max(0, targetPoints - updatedPoints)
    : 0;
  const progressPercentage = targetPoints
    ? clampPercentage((updatedPoints / targetPoints) * 100)
    : hasRewards
      ? 100
      : 0;

  let statusMessage = "Este negocio aun no tiene recompensas activas.";

  if (unlockedRewardName) {
    statusMessage = `Recompensa disponible: ${unlockedRewardName}`;
  } else if (nextReward) {
    statusMessage = `Te faltan ${remainingPoints} puntos para desbloquear ${nextReward.name}.`;
  } else if (hasRewards) {
    statusMessage = "Cliente en el nivel mas alto de recompensas.";
  }

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 md:p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
          Progreso de recompensa
        </p>
        <p className="text-xs font-semibold text-slate-700">
          {progressPercentage}%
        </p>
      </div>

      <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progressPercentage}
          aria-label="Progreso de recompensa"
        />
      </div>

      <p className="mt-2 text-xs text-slate-600">
        {targetPoints
          ? `${updatedPoints} / ${targetPoints} puntos para la siguiente recompensa`
          : hasRewards
            ? "Ya alcanzo la recompensa mas alta disponible."
            : "Sin recompensas activas para mostrar progreso."}
      </p>

      <p
        className={`mt-2 rounded-md border px-2.5 py-2 text-sm font-medium ${
          unlockedRewardName
            ? "border-amber-200 bg-amber-50 text-amber-900"
            : "border-slate-200 bg-white text-slate-900"
        }`}
      >
        {statusMessage}
      </p>
    </section>
  );
}
