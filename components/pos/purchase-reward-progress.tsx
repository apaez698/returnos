import { RewardProgressBar } from "@/components/rewards/reward-progress-bar";
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
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4">
      <div className="flex items-center justify-between gap-3 mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-700">
          Progreso de recompensa
        </p>
      </div>

      {nextReward && (
        <div className="mb-4">
          <RewardProgressBar
            remainingPoints={remainingPoints}
            progressPercentage={progressPercentage}
            rewardName={nextReward.name}
            colorTheme="indigo"
            showPercentage={true}
          />
        </div>
      )}

      <p
        className={`rounded-md border px-3 py-2 text-sm font-medium ${
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
